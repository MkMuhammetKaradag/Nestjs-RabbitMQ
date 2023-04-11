import { SharedModule } from '@app/shared';
import { Module } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config/dist';
import { ClientProxyFactory } from '@nestjs/microservices/client';
import { Transport } from '@nestjs/microservices/enums';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
  ],

  controllers: [AppController],
})
export class AppModule {}
