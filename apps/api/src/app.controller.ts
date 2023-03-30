import { Controller, Get, Inject,Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {}

  @Get()
  async foo() {
    return { foo: 'bar!' };
  }
  @Get('auth')
  async getUsers() {
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @Post('auth')
  async postUser() {
    return this.authService.send(
      {
        cmd: 'post-user',
      },
      {},
    );
  }
}
