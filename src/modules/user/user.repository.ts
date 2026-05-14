import type { IUser } from '../../common/types/user.type.js';
import type { AuthProviderEnum } from '../../common/types/auth.type.js';
import { UserModel } from '../../database/models/user.model.js';
import { RedisClient } from '../../database/redis.connection.js';
import type {
  Types,
  UpdateQuery,
  UpdateWithAggregationPipeline,
} from 'mongoose';

type DistributiveOmit<T, K extends PropertyKey> = T extends any
  ? Omit<T, K>
  : never;

type CreateInput = DistributiveOmit<IUser, '_id' | 'createdAt' | 'updatedAt'>;

class UserRepository {
  readonly KEYS = {
    verificationCode: (userId: string) => `user:verification-code:${userId}`,
    twoFAActivationCode: (userId: string) =>
      `user:2fa-activation-code:${userId}`,
  } as const;

  constructor(private readonly redisClient: typeof RedisClient) {}

  async existsByEmail(email: string) {
    return UserModel.exists({ email });
  }

  async create(data: CreateInput) {
    return UserModel.create(data);
  }

  async findByEmail(email: string) {
    return UserModel.findOne({ email }).lean();
  }

  async findById(userId: Types.ObjectId | string, select?: string) {
    const query = UserModel.findOne({ _id: userId }).lean();
    return select ? query.select(select) : query;
  }

  async findByEmailAndProvider(email: string, provider: AuthProviderEnum) {
    return UserModel.findOne({ email, provider }).lean();
  }

  updateById(
    userId: Types.ObjectId | string,
    updates: UpdateQuery<IUser> | UpdateWithAggregationPipeline,
  ) {
    return UserModel.updateOne({ _id: userId }, updates);
  }

  deleteById(userId: Types.ObjectId | string) {
    return UserModel.deleteOne({ _id: userId });
  }

  updatePassword(userId: string, hashedPassword: string) {
    return UserModel.updateOne(
      { _id: userId },
      { $set: { hashed_password: hashedPassword } },
    );
  }

  async getVerificationCode(userId: string) {
    return this.redisClient.get(this.KEYS.verificationCode(userId));
  }

  async setVerificationCode(userId: string, code: string) {
    return this.redisClient.set(this.KEYS.verificationCode(userId), code, {
      expiration: { type: 'EX', value: 300 },
    });
  }

  async delVerificationCode(userId: string) {
    return this.redisClient.del(this.KEYS.verificationCode(userId));
  }

  async verificationCodeExists(userId: string) {
    return this.redisClient.exists(this.KEYS.verificationCode(userId));
  }

  async get2FAActivationCode(userId: string) {
    return this.redisClient.get(this.KEYS.twoFAActivationCode(userId));
  }

  async set2FAActivationCode(userId: string, code: string) {
    return this.redisClient.set(this.KEYS.twoFAActivationCode(userId), code, {
      expiration: { type: 'EX', value: 300 },
    });
  }

  async del2FAActivationCode(userId: string) {
    return this.redisClient.del(this.KEYS.twoFAActivationCode(userId));
  }

  async twoFAActivationCodeExists(userId: string) {
    return this.redisClient.exists(this.KEYS.twoFAActivationCode(userId));
  }
}

export default new UserRepository(RedisClient);
