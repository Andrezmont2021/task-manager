import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(
  process: NodeJS.Process,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  };
}
