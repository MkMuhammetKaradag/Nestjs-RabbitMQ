import { SharedService } from '@app/shared';
// import { AuthGuard } from '@app/shared/auth.guard';
import {
  CacheInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { PresenceService } from './presence.service';

@Controller()
export class PresenceController {
  constructor(
    private readonly presenceService: PresenceService,

    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-presence' })
  async getFoo(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);

    return { foo: 1 };
  }
  @MessagePattern({ cmd: 'get-active-user' })
  async getActiveUser(
    @Ctx() context: RmqContext,
    @Payload() payload: { id: number },
  ) {
    this.sharedService.acknowledgeMessage(context);
    return await this.presenceService.getActiveUser(payload.id);
  }
}
