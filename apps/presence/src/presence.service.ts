import { Injectable } from '@nestjs/common';
import { ActiveUser } from './interfaces/ActiveUser.interface';
import { RedisCacheService } from '@app/shared/services/redis-cache.service';

@Injectable()
export class PresenceService {
  constructor(private readonly cache: RedisCacheService) {}

  getHello(): string {
    return 'Hello World!';
  }

  getFoo() {
    console.log('NoCched');
    return {
      foo: 'bar',
    };
  }
  async getActiveUser(id: number) {
    const user = await this.cache.get(`user ${id}`);
    return user as ActiveUser | undefined;
  }
}
