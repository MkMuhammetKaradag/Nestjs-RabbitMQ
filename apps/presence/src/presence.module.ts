import { AuthGuard, SharedModule } from '@app/shared';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PresenceController } from './presence.controller';
import { PresenceService } from './presence.service';
import { RedisModule } from '@app/shared/modules/redis.module';
import { PresenceGateway } from './presence.gateway';

@Module({
  imports: [
    RedisModule,
    SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  ],
  controllers: [PresenceController],
  providers: [PresenceService, PresenceGateway],
})
export class PresenceModule {}
