import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: `postgresql://${configService.get(
          'POSTGRES_USER',
        )}:${configService.get(
          'POSTGRES_PASSWORD',
        )}@postgres:5432/${configService.get('POSTGRES_DB')}`, //127.0.0.1
        autoLoadEntities: true,
        synchronize: true,
      }),

      inject: [ConfigService],
    }),
  ],
})
export class PostgresDBModule {}
