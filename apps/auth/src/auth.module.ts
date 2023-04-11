import {
  FriendRequestEntity,
  FriendRequestsRepository,
  PostgresDBModule,
  SharedModule,
  SharedService,
  UserEntity,
} from '@app/shared';
// import { PostgresDBModule } from '@app/shared/postgresdb.module';
import { Inject, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { dataSourceOptions } from './db/data-source';

import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt-strategy';
import { UsersRepository } from '@app/shared/repositories/users.repository';
import { ConversationEntity } from '@app/shared/entities/conversation.entity';
import { MessageEntity } from '@app/shared/entities/message.entity';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    PostgresDBModule,
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '3600s' },
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtGuard,
    JwtStrategy,
    {
      provide: 'AuthServiceInterface',
      useClass: AuthService,
    },
    {
      provide: 'UsersRepositoryInterface',
      useClass: UsersRepository,
    },
    {
      provide: 'SharedServiceInterface',
      useClass: SharedService,
    },
    {
      provide: 'FriendRequestsRepositoryInterface',
      useClass: FriendRequestsRepository,
    },
  ],
})
export class AuthModule {}
