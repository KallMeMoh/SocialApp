import type { Types } from 'mongoose';
import {
  redisClient,
  type RedisClient,
} from '../../database/redis.connection.js';

export class AuthRepository {
  private readonly KEYS = {
    loginCounter: (userId: Types.ObjectId) => `auth:login-counter:${userId}`,
    passwordReset: (token: string) => `auth:password-reset:${token}`,
    login2FA: (userId: Types.ObjectId) => `auth:login-2fa:${userId}`,
    jwtBlacklist: (jti: string) => `jwt:blacklist:${jti}`,
  } as const;

  constructor(private readonly redisClient: RedisClient) {}

  async getLoginAttempts(userId: Types.ObjectId) {
    return this.redisClient.get(this.KEYS.loginCounter(userId));
  }

  async incrementLoginAttempts(userId: Types.ObjectId) {
    const count = await this.redisClient.incr(this.KEYS.loginCounter(userId));
    if (count === 1) {
      await this.redisClient.expire(this.KEYS.loginCounter(userId), 1800);
    }
    return count;
  }

  async resetLoginAttempts(userId: Types.ObjectId) {
    return this.redisClient.del(this.KEYS.loginCounter(userId));
  }

  async setPasswordResetToken(token: string, userId: Types.ObjectId) {
    return this.redisClient.set(
      this.KEYS.passwordReset(token),
      userId.toString(),
      {
        expiration: { type: 'EX', value: 300 },
      },
    );
  }

  async getPasswordResetToken(token: string) {
    return this.redisClient.get(this.KEYS.passwordReset(token));
  }

  async store2FACode(userId: Types.ObjectId, code: string) {
    return this.redisClient.set(this.KEYS.login2FA(userId), code, {
      expiration: { type: 'EX', value: 300 },
    });
  }

  async get2FACode(userId: Types.ObjectId) {
    return this.redisClient.get(this.KEYS.login2FA(userId));
  }

  async blacklistToken(jti: string) {
    return this.redisClient.set(this.KEYS.jwtBlacklist(jti), '1', {
      expiration: { type: 'EX', value: 365 * 24 * 60 * 60 },
    });
  }
}

const authRepository = new AuthRepository(redisClient);
export default authRepository;
