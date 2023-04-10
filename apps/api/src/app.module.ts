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
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
    SharedModule.registerRmq(
      'PRESENCE_SERVICE',
      process.env.RABBITMQ_PRESENCE_QUEUE,
    ),
  ],
  
  controllers: [AppController],
  providers: [
    AppService,
    // {
    //   provide: 'AUTH_SERVICE',
    //   useFactory: (configService: ConfigService) => {
    //     const USER = configService.get('RABBITMQ_USER');
    //     const PASS = configService.get('RABBITMQ_PASS');
    //     const HOST = configService.get('RABBITMQ_HOST');
    //     const QUEUE = configService.get('RABBITMQ_AUTH_QUEUE');
    //     // const USER = "user" //configService.get('RABBITMQ_USER');
    //     // const PASS ="password" //configService.get('RABBITMQ_PASS');
    //     // const HOST ="localhost:5672" //configService.get('RABBITMQ_HOST');
    //     // const QUEUE ="auth_queue" //configService.get('RABBITMQ_AUTH_QUEUE');
    //     return ClientProxyFactory.create({
    //       transport: Transport.RMQ,
    //       options: {
    //         urls: [`amqp://${USER}:${PASS}@${HOST}`],
    //         queue: QUEUE,
    //         queueOptions: {
    //           durable: true,
    //         },
    //       },
    //     });
    //   },
    //   inject: [ConfigService],
    // },
    // {
    //   provide: 'PRESENCE_SERVICE',
    //   useFactory: (configService: ConfigService) => {
    //     const USER = configService.get('RABBITMQ_USER');
    //     const PASS = configService.get('RABBITMQ_PASS');
    //     const HOST = configService.get('RABBITMQ_HOST');
    //     const QUEUE = configService.get('RABBITMQ_PRESENCE_QUEUE');
    //     // const USER = "user" //configService.get('RABBITMQ_USER');
    //     // const PASS ="password" //configService.get('RABBITMQ_PASS');
    //     // const HOST ="localhost:5672" //configService.get('RABBITMQ_HOST');
    //     // const QUEUE ="auth_queue" //configService.get('RABBITMQ_AUTH_QUEUE');
    //     return ClientProxyFactory.create({
    //       transport: Transport.RMQ,
    //       options: {
    //         urls: [`amqp://${USER}:${PASS}@${HOST}`],
    //         queue: QUEUE,
    //         queueOptions: {
    //           durable: true,
    //         },
    //       },
    //     });
    //   },
    //   inject: [ConfigService],
    // },
  ],
})


export class AppModule {}
