import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  PostgresDBModule,

  SharedModule,

  UserEntity,
  FriendRequestEntity,
} from '@app/shared';

import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { RedisModule } from '@app/shared/modules/redis.module';
import { ConversationEntity } from '@app/shared/entities/conversation.entity';
import { MessageEntity } from '@app/shared/entities/message.entity';
import { ConversationsRepository } from '@app/shared/repositories/conversations.repository';
import { MessagesRepository } from '@app/shared/repositories/messages.repository';

@Module({
  imports: [
    PostgresDBModule,
    RedisModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
    TypeOrmModule.forFeature([
      UserEntity,
      FriendRequestEntity,
      ConversationEntity,
      MessageEntity,
    ]),
  ],
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatGateway,
    {
      provide: 'ConversationsRepositoryInterface',
      useClass: ConversationsRepository,
    },
    {
      provide: 'MessagesRepositoryInterface',
      useClass: MessagesRepository,
    },
  ],
})
export class ChatModule {}