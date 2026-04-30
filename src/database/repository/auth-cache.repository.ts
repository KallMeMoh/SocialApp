import { RedisClient } from '../redis.connection.js';

class AuthCacheRepository {
  constructor(private redisClient: typeof RedisClient) {}

  async getLoginAttempts(userId: string) {
    return this.redisClient.get(`auth:login-counter:${userId}`);
  }

  async incrementLoginAttempts(userId: string) {
    return this.redisClient.incr(`auth:login-counter:${userId}`);
  }

  async expireLoginAttempts(userId: string) {
    return this.redisClient.expire(`auth:login-counter:${userId}`, 1800);
  }

  async setPasswordResetToken(token: string, userId: string) {
    return this.redisClient.set(`auth:password-reset:${token}`, userId, {
      expiration: { type: 'EX', value: 900 },
    });
  }

  async getPasswordResetToken(token: string) {
    return this.redisClient.get(`auth:password-reset:${token}`);
  }

  async store2FACode(userId: string, code: string) {
    return this.redisClient.set(`auth:login-2fa:${userId}`, code);
  }

  async get2FACode(userId: string) {
    return this.redisClient.get(`auth:login-2fa:${userId}`);
  }

  async blacklistToken(jti: string) {
    return this.redisClient.set(`jwt:blacklist:${jti}`, '1', {
      expiration: { type: 'EX', value: 365 * 24 * 60 * 60 },
    });
  }
}

export default new AuthCacheRepository(RedisClient);
