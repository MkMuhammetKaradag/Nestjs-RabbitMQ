import { SharedService } from '@app/shared';
// import { AuthGuard } from '@app/shared/auth.guard';
import {
  CacheInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { Ctx, MessagePattern, RmqContext } from '@nestjs/microservices';
import { PresenceService } from './presence.service';
import { RedisService } from '@app/shared/services/redis.service';

@Controller()
export class PresenceController {
  constructor(
    private readonly redisService: RedisService,
    private readonly presenceService: PresenceService,

    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-presence' })
  @UseInterceptors(CacheInterceptor)
  async getPresence(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    const foo = await this.redisService.get('foo');
    if (foo) {
      console.log('Cached');
      return foo;
    }
    const f = await this.presenceService.getFoo();
    this.redisService.set('foo', f);
    return f;

    // return this.presenceService.getHello();
  }
}
