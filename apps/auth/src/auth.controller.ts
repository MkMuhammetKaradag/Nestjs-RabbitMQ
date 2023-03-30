import { SharedService } from '@app/shared';
import { Controller, Get } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices/ctx-host';
import { Ctx, MessagePattern } from '@nestjs/microservices/decorators';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sharedService: SharedService,
  ) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUsers(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.getUsers();
  }
  @MessagePattern({ cmd: 'post-user' })
  async postUseer(@Ctx() context: RmqContext) {
    this.sharedService.acknowledgeMessage(context);
    return this.authService.postUser();
  }
}
