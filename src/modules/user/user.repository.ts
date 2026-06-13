import type { IUser } from '../../common/types/user.type.js';
import type { AuthProviderEnum } from '../../common/types/auth.type.js';
import { UserModel } from '../../database/models/user.model.js';
import { RedisClient } from '../../database/redis.connection.js';
import type {
  ProjectionType,
  QueryOptions,
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

  async findByUsername(username: string, projection?: ProjectionType<IUser>) {
    return UserModel.findOne({ username }, projection).lean();
  }

  async findByEmail(email: string, projection?: ProjectionType<IUser>) {
    return UserModel.findOne({ email }, projection).lean();
  }

  async findById(userId: Types.ObjectId, projection?: ProjectionType<IUser>) {
    const query = UserModel.findOne({ _id: userId }, projection);
    return query.lean();
  }

  async findByEmailAndProvider(email: string, provider: AuthProviderEnum) {
    return UserModel.findOne({ email, provider }).lean();
  }

  updateById(
    userId: Types.ObjectId,
    updates: UpdateQuery<IUser> | UpdateWithAggregationPipeline,
    options?: QueryOptions<IUser>,
  ) {
    return UserModel.findOneAndUpdate({ _id: userId }, updates, options);
  }

  deleteById(userId: Types.ObjectId) {
    return UserModel.updateOne({ _id: userId }, { deletedAt: new Date() });
  }

  updatePassword(userId: Types.ObjectId, hashedPassword: string) {
    return UserModel.updateOne(
      { _id: userId },
      { $set: { hashed_password: hashedPassword } },
    );
  }

  async getVerificationCode(userId: Types.ObjectId) {
    return this.redisClient.get(this.KEYS.verificationCode(userId.toString()));
  }

  async setVerificationCode(userId: Types.ObjectId, code: string) {
    return this.redisClient.set(
      this.KEYS.verificationCode(userId.toString()),
      code,
      {
        expiration: { type: 'EX', value: 300 },
      },
    );
  }

  async delVerificationCode(userId: Types.ObjectId) {
    return this.redisClient.del(this.KEYS.verificationCode(userId.toString()));
  }

  async verificationCodeExists(userId: Types.ObjectId) {
    return this.redisClient.exists(
      this.KEYS.verificationCode(userId.toString()),
    );
  }

  async get2FAActivationCode(userId: Types.ObjectId) {
    return this.redisClient.get(
      this.KEYS.twoFAActivationCode(userId.toString()),
    );
  }

  async set2FAActivationCode(userId: Types.ObjectId, code: string) {
    return this.redisClient.set(
      this.KEYS.twoFAActivationCode(userId.toString()),
      code,
      {
        expiration: { type: 'EX', value: 300 },
      },
    );
  }

  async del2FAActivationCode(userId: Types.ObjectId) {
    return this.redisClient.del(
      this.KEYS.twoFAActivationCode(userId.toString()),
    );
  }

  async twoFAActivationCodeExists(userId: Types.ObjectId) {
    return this.redisClient.exists(
      this.KEYS.twoFAActivationCode(userId.toString()),
    );
  }
}

export default new UserRepository(RedisClient);
