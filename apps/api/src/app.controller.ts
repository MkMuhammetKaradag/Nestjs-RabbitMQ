import { AuthGuard, UserRequest } from '@app/shared';
import { UserInterceptor } from '@app/shared/interceptors/user.interceptors';

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
} from '@nestjs/common';
import {
  Param,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  async foo() {
    return { foo: 'bar!' };
  }
  @Get('auth')
  async getUsers() {
    console.log('geldi');
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }

  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    console.log(password);
    return this.authService.send(
      {
        cmd: 'register',
      },
      {
        firstName,
        lastName,
        email,
        password,
      },
    );
  }

  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {
        email,
        password,
      },
    );
  }

  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Post('add-friend/:friendId')
  async addFriend(
    @Req() req: UserRequest,
    @Param('friendId') friendId: number,
  ) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'add-friend',
      },
      {
        userId: req.user.id,
        friendId,
      },
    );
  }
  @UseGuards(AuthGuard)
  @UseInterceptors(UserInterceptor)
  @Get('get-friend')
  async getFriends(@Req() req: UserRequest) {
    if (!req?.user) {
      throw new BadRequestException();
    }

    return this.authService.send(
      {
        cmd: 'get-friends',
      },
      {
        userId: req.user.id,
      },
    );
  }
}
