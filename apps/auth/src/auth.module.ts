import { SharedModule } from '@app/shared';
import { PostgresDBModule } from '@app/shared/postgresdb.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { dataSourceOptions } from './db/data-source';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
    PostgresDBModule,
    SharedModule,
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   // useFactory: (configService: ConfigService) => ({
    //   //   type: 'postgres',
    //   //   url: `postgresql://${configService.get(
    //   //     'POSTGRES_USER',
    //   //   )}:${configService.get(
    //   //     'POSTGRES_PASSWORD',
    //   //   )}@postgres:5432/${configService.get('POSTGRES_DB')}`, //127.0.0.1
    //   //   autoLoadEntities: true,
    //   //   synchronize: true,
    //   // }),
    //   useFactory: () => ({
    //     ...dataSourceOptions,
    //     autoLoadEntities: true,
    //     synchronize: true,
    //   }),
    //   inject: [ConfigService],
    // }),

    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
