import { UserEntity } from '@app/shared';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@postgres:5432/${process.env.POSTGRES_DB}`, //127.0.0.1
  entities: [UserEntity],
  migrations: ['dist/apps/auth/db/migrations/*.js'],
};
export const dataSource = new DataSource(dataSourceOptions);
