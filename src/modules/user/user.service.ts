import { randomUUID } from 'node:crypto';
import r2bucketService from '../../common/services/r2bucket.service.js';
import type { AvatarUploadDTO } from '../../common/validation/avatar-upload.schema.js';
import type { Types } from 'mongoose';
import UserRepository from './user.repository.js';
import { HttpError } from '../../common/errors/http-error.js';
import { compare, hash } from 'bcrypt';
import { SALT_ROUNDS } from '../../config/index.js';
import type { IUser } from '../../common/types/user.type.js';
import { AuthProviderEnum } from '../../common/types/auth.type.js';
import AuthRepository from '../auth/auth.repository.js';
import { transporter } from '../../common/utils/email/transporter.js';
import { randomInt } from 'node:crypto';
import { otpTemplate } from '../../common/utils/email/templates/otp.js';
import type { ParamIDDTO } from '../../common/validation/param-id.schema.js';

class UserService {
  constructor(
    private readonly authRepository: typeof AuthRepository,
    private readonly userRepository: typeof UserRepository,
    private readonly _r2bucketService: typeof r2bucketService,
  ) {}

  async getUserProfile({
    userId,
  }: ParamIDDTO['params']): Promise<
    Omit<IUser, '_id' | 'provider' | 'updatedAt' | '__v' | 'hashed_password'>
  > {
    const user = await this.userRepository.findById(userId, '-hashed_password');
    if (!user) throw new HttpError(404, "User doesn't exist");

    await this.userRepository.updateById(userId, { $inc: { visits: 1 } });

    const { _id, provider, updatedAt, __v, ...userObj } = user;

    return userObj;
  }

  async request2FAActivation(userId: Types.ObjectId | string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');

    const codeExists = await this.userRepository.twoFAActivationCodeExists(
      String(userId),
    );
    if (codeExists)
      throw new HttpError(
        429,
        'A code was already sent, please wait before requesting a new one',
      );

    const code = String(randomInt(100000, 999999));
    await this.userRepository.set2FAActivationCode(String(userId), code);

    await transporter.sendMail({
      to: user.email,
      subject: 'Your SarahaClone 2FA setup code',
      html: otpTemplate(code, 'enable two-factor authentication'),
    });
  }

  async activate2FA(
    userId: Types.ObjectId | string,
    code: string,
  ): Promise<void> {
    const [user, otp] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.get2FAActivationCode(String(userId)),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (!otp)
      throw new HttpError(401, 'Code expired, please request a new one');
    if (otp !== code)
      throw new HttpError(401, 'Invalid Code, please try again later');

    await Promise.all([
      this.userRepository.del2FAActivationCode(String(userId)),
      this.userRepository.updateById(userId, { $set: { has2FA: true } }),
    ]);
  }

  async requestVerificationCode(
    userId: Types.ObjectId | string,
  ): Promise<void> {
    const [user, otpExists] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.verificationCodeExists(String(userId)),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (otpExists)
      throw new HttpError(
        429,
        'A code was already sent, please wait before requesting a new one',
      );

    const code = String(randomInt(100000, 999999));
    await this.userRepository.setVerificationCode(String(userId), code);

    await transporter.sendMail({
      to: user.email,
      subject: 'Your Account Verification Code',
      html: otpTemplate(code, 'verify your email address'),
    });
  }

  async verifyUserAccount(
    userId: Types.ObjectId | string,
    code: string,
  ): Promise<void> {
    const [user, otp] = await Promise.all([
      this.userRepository.findById(userId),
      this.userRepository.getVerificationCode(String(userId)),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (!otp)
      throw new HttpError(401, 'Code expired, please request a new one');
    if (otp !== code)
      throw new HttpError(401, 'Invalid code, please try again');

    await Promise.all([
      this.userRepository.delVerificationCode(String(userId)),
      this.userRepository.updateById(userId, {
        $set: { verified: true },
        $unset: { verificationExpiry: 1 },
      }),
    ]);
  }

  async updateUserPassword(
    userId: Types.ObjectId | string,
    jti: string,
    {
      old_password,
      new_password,
    }: { old_password: string; new_password: string },
  ): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'Account does not exist');

    if (user.provider === AuthProviderEnum.Google) return;

    const passwordsMatch = await compare(old_password, user.password);
    if (!passwordsMatch) throw new HttpError(401, 'Invalid credentials');

    const newHashedPassword = await hash(new_password, SALT_ROUNDS);

    await Promise.all([
      this.userRepository.updatePassword(String(userId), newHashedPassword),
      this.authRepository.blacklistToken(jti),
    ]);
  }

  async getAvatarUploadUrl({
    fileType,
  }: AvatarUploadDTO['body']): Promise<string> {
    const key = `uploads/avatars/${Date.now()}_${randomUUID()}.${fileType}`;
    return this._r2bucketService.generateUploadUrl(key, fileType);
  }

  async deleteUserAvatar(userId: Types.ObjectId | string): Promise<void> {
    const user = await this.userRepository.findById(userId, 'avatar');
    if (!user) throw new HttpError(404, 'Account does not exist');
    if (!user.avatar) throw new HttpError(404, 'No avatar to delete');

    await Promise.all([
      this._r2bucketService.deleteFile(user.avatar),
      this.userRepository.updateById(userId, { $set: { avatar: null } }),
    ]);
  }

  async deleteAccount({ userId }: ParamIDDTO['params']): Promise<void> {
    const { deletedCount } = await this.userRepository.deleteById(userId);
    if (deletedCount < 1) throw new HttpError(404, 'Account does not exist');
  }
}

export default new UserService(AuthRepository, UserRepository, r2bucketService);
