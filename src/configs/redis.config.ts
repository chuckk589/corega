import { ConnectionOptions } from 'bullmq';

export const RedisConnectionOptions: ConnectionOptions = {
  password: process.env.REDIS_PASSWORD,
  host: process.env.REDIS_HOST,
  port: +process.env.REDIS_PORT,
};
