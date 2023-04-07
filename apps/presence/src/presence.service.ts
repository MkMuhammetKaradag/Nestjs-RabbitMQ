import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  getHello(): string {
    return 'Hello World!';
  }

  getFoo() {
    console.log('NoCched');
    return {
      foo: 'bar',
    };
  }
}
