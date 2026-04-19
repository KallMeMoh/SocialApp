import { createClient } from 'redis';
import { REDIS_URI } from '../config/index.js';

export const RedisClient = createClient({
  url: REDIS_URI,
});

RedisClient.on('error', (err) => {
  console.error(err);
  process.exit(1);
});

export const connectRedis = async () => {
  try {
    await RedisClient.connect();
    console.log('Successfully connected to Redis');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
