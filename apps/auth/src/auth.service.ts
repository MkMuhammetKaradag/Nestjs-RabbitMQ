import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewUserDTO } from './dtos/new-user.dto';

import * as bcrypt from 'bcrypt';
import { ExistingUserDTO } from './dtos/existing-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserRepositoryInterface } from '@app/shared/interfaces/users.repository.interface';
import { AuthServiceInterface } from './interface/auth.service.interface';
import { FriendRequestsRepository, UserEntity } from '@app/shared';
import { UserJwt } from '@app/shared/interfaces/user-jwt.interface';
import { FriendRequestEntity } from '@app/shared/entities/friend-request.entity';
@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @Inject('UsersRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('FriendRequestsRepositoryInterface')
    private readonly friendRequestsRepository: FriendRequestsRepository,
    private readonly jwtService: JwtService,
  ) {}
  async getUsers() {
    console.log('servis içi');
    return this.userRepository.findAll();
  }
  async findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findByCondition({
      where: { email },
      select: ['id', 'firstName', 'lastName', 'email', 'password'],
    });
  }
  async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneById(id);
  }

  // async postUser() {
  //   return this.userRepository.save({ firstName: 'Barry' });
  // }
  async hashPassword(password: string): Promise<string> {
    const saltOrRounds = 10;
    console.log(password);
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }
  async register(newUser: Readonly<NewUserDTO>): Promise<UserEntity> {
    const { firstName, lastName, email, password } = newUser;
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        'An  account  with  that email  already exists!',
      );
    }
    const hashedPassword = await this.hashPassword(password);

    const user = await this.userRepository.save({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    delete user.password;
    return user;
  }
  async doesPasswordMatch(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.findByEmail(email);
    const doesUsewrExist = !!user;
    if (!doesUsewrExist) return null;
    const doesPasswordMatch = await this.doesPasswordMatch(
      password,
      user.password,
    );
    if (!doesPasswordMatch) return null;
    return user;
  }
  async login(existingUser: Readonly<ExistingUserDTO>) {
    const { email, password } = existingUser;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException();
    }
    const jwt = await this.jwtService.signAsync({
      user,
    });
    delete user.password;
    return { token: jwt, user };
  }

  async verifyJwt(jwt: string): Promise<{ user: UserEntity; exp: number }> {
    if (!jwt) {
      throw new UnauthorizedException('');
    }
    try {
      const { user, exp } = await this.jwtService.verifyAsync(jwt);
      return { user, exp };
    } catch (error) {
      throw new UnauthorizedException('');
    }
  }

  async getUserFromHeader(jwt: string): Promise<UserJwt> {
    if (!jwt) return;

    try {
      return this.jwtService.decode(jwt) as UserJwt;
    } catch (error) {
      throw new BadRequestException();
    }
  }

  async addFriend(
    userId: number,
    friendId: number,
  ): Promise<FriendRequestEntity> {
    const creator = await this.findById(userId);
    const receiver = await this.findById(friendId);

    return await this.friendRequestsRepository.save({ creator, receiver });
  }

  async getFriends(userId: number): Promise<FriendRequestEntity[]> {
    const creator = await this.findById(userId);

    return await this.friendRequestsRepository.findWithRelations({
      where: [{ creator }, { receiver: creator }],
      relations: ['creator', 'receiver'],
    });
  }

  async getFriendsList(userId: number) {
    const friendRequests = await this.getFriends(userId);

    if (!friendRequests) return [];

    const friends = friendRequests.map((friendRequest) => {
      const isUserCreator = userId === friendRequest.creator.id;
      const friendDetails = isUserCreator
        ? friendRequest.receiver
        : friendRequest.creator;

      const { id, firstName, lastName, email } = friendDetails;

      return {
        id,
        email,
        firstName,
        lastName,
      };
    });

    return friends;
  }
}
