import { AuthGuard } from '@app/shared';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { ClientProxy } from '@nestjs/microservices/client/client-proxy';
// import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @Inject('AUTH_SERVICE') private authService: ClientProxy,
    @Inject('PRESENCE_SERVICE') private presenceService: ClientProxy,
  ) {}

  @Get()
  async foo() {
    return { foo: 'bar!' };
  }
  @Get('auth')
  async getUsers() {
    console.log('geldi');
    return this.authService.send(
      {
        cmd: 'get-users',
      },
      {},
    );
  }

  @UseGuards(AuthGuard)
  @Get('presence')
  async getPresence() {
    return this.presenceService.send(
      {
        cmd: 'get-presence',
      },
      {},
    );
  }

  @Post('auth/register')
  async register(
    @Body('firstName') firstName: string,
    @Body('lastName') lastName: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    console.log(password);
    return this.authService.send(
      {
        cmd: 'register',
      },
      {
        firstName,
        lastName,
        email,
        password,
      },
    );
  }

  @Post('auth/login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return this.authService.send(
      {
        cmd: 'login',
      },
      {
        email,
        password,
      },
    );
  }
}
