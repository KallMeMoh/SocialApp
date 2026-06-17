import { createClient } from 'redis';
import { REDIS_URI } from '../config/index.js';

export const redisClient = createClient({
  url: REDIS_URI,
});

export type RedisClient = typeof redisClient;

redisClient.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
