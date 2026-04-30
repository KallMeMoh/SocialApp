import type { Model } from 'mongoose';
import type { User } from '../../common/types/user.type.js';
import type { AuthProvider } from '../../common/types/auth.types.js';
import { UserModel } from '../models/user.model.js';

class UserRepository {
  constructor(private userModel: Model<User>) {}

  async existsByEmail(email: string) {
    return this.userModel.exists({ email });
  }

  async create(data: User) {
    return this.userModel.create(data);
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async findByEmailAndProvider(email: string, provider: AuthProvider) {
    return this.userModel.findOne({ email, provider });
  }

  async updatePassword(userId: string, hashedPassword: string) {
    const user = await this.userModel.findById(userId);
    if (!user) return null;
    user.hashed_password = hashedPassword;
    return user.save();
  }
}

export default new UserRepository(UserModel);
