import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { firstValueFrom } from 'rxjs';

import { FriendRequestEntity, UserJwt } from '@app/shared';

import { ActiveUser } from './interfaces/ActiveUser.interface';

import { RedisCacheService } from '@app/shared/services/redis-cache.service';

@WebSocketGateway({ cors: true })
export class PresenceGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject('AUTH_SERVICE') private readonly authService: ClientProxy,
    private readonly cache: RedisCacheService,
  ) {}
  @WebSocketServer()
  server: Server;

  async onModuleInit() {
    await this.cache.reset();
  }

  private async getFriends(userId: number) {
    const ob$ = this.authService.send<FriendRequestEntity[]>(
      {
        cmd: 'get-friends',
      },
      {
        userId,
      },
    );
    const friendRequests = await firstValueFrom(ob$).catch((err) =>
      console.error(err),
    );
    if (!friendRequests) return;
    const friends = friendRequests.map((friendRequest) => {
      const isUserCreater = userId == friendRequest.creator.id;
      const friendDetails = isUserCreater
        ? friendRequest.receiver
        : friendRequest.creator;
      const { id, email, firstName, lastName } = friendDetails;
      return {
        id,
        email,
        firstName,
        lastName,
      };
    });
    return friends;
  }

  private async emitStatusToFriends(activeUser: ActiveUser) {
    const friends = await this.getFriends(activeUser.id);

    for (const f of friends) {
      const user = await this.cache.get(`user ${f.id}`);

      if (!user) continue;

      const friend = user as ActiveUser;

      this.server.to(friend.socketId).emit('friendActive', {
        id: activeUser.id,
        isActive: activeUser.isActive,
      });

      if (activeUser.isActive) {
        this.server.to(activeUser.socketId).emit('friendActive', {
          id: friend.id,
          isActive: friend.isActive,
        });
      }
    }
  }

  private async setActiveStatus(socket: Socket, isActive: boolean) {
    const user = socket.data?.user;
    if (!user) return;
    const activeUser: ActiveUser = {
      id: user.id,
      socketId: socket.id,
      isActive,
    };
    await this.cache.set(`user ${user.id}`, activeUser, 0);
    await this.emitStatusToFriends(activeUser);
  }
  async handleDisconnect(socket: Socket) {
    console.log('HANDLE DİSCONNECT');
    await this.setActiveStatus(socket, false);
  }

  async handleConnection(socket: Socket) {
    console.log('Handle Connection');

    const jwt = socket.handshake.headers.authorization ?? null;

    if (!jwt) {
      this.handleDisconnect(socket);
      return;
    }

    const ob$ = this.authService.send<UserJwt>({ cmd: 'decode-jwt' }, { jwt });
    const res = await firstValueFrom(ob$).catch((err) => console.error(err));

    if (!res || !res.user) {
      this.handleDisconnect(socket);
      return;
    }
    const { user } = res;
    socket.data.user = user;
    await this.setActiveStatus(socket, true);
  }

  @SubscribeMessage('updateActiveStatus')
  async updateActiveStatus(socket: Socket, isActive: boolean) {
    if (!socket.data?.user) return;

    await this.setActiveStatus(socket, isActive);
  }
}
