import { Module, Global, Inject } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  imports: [],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT as any),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB as any),
        });
      },
      inject: [],
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisConfigModule {}

export const InjectRedisClient = () => Inject('REDIS_CLIENT');