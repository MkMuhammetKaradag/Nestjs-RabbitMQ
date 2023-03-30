import { Controller, Get } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices/ctx-host';
import { Ctx, MessagePattern } from '@nestjs/microservices/decorators';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'get-users' })
  async getUseer(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    return this.authService.getUsers();
  }
  @MessagePattern({ cmd: 'post-user' })
  async postUseer(@Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    channel.ack(message);
    return this.authService.postUser();
  }
}
