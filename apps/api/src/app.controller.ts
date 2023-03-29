import { Controller, Get, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(@Inject('AUTH_SERVICE') private authService: ClientProxy) {}

  @Get()
  async getUser() { 
    return this.authService.send({
      cmd: 'get-user',
    },{});
  }
}
