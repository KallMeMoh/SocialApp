import { randomUUID } from 'node:crypto';
import r2bucketService from '../../common/services/r2bucket.service.js';
import UserRepository from './user.repository.js';
import { HttpError } from '../../common/errors/http-error.js';
import { compare, hash } from 'bcrypt';
import { SALT_ROUNDS } from '../../config/index.js';
import { AuthProviderEnum } from '../../common/types/auth.type.js';
import AuthRepository from '../auth/auth.repository.js';
import { transporter } from '../../common/utils/email/transporter.js';
import { randomInt } from 'node:crypto';
import { otpTemplate } from '../../common/utils/email/templates/otp.js';
import type { Types } from 'mongoose';
import type { AvatarUploadDTO, UserIdDTO } from './user.dto.js';

class UserService {
  constructor(
    private readonly _authRepository: typeof AuthRepository,
    private readonly _userRepository: typeof UserRepository,
    private readonly _r2bucketService: typeof r2bucketService,
  ) {}

  async getUserProfile({ userId }: UserIdDTO['params']) {
    const user = await this._userRepository.findById(
      userId,
      '-password -provider -updatedAt -__v',
    );
    if (!user) throw new HttpError(404, "User doesn't exist");
    return user;
  }

  async request2FAActivation(userId: Types.ObjectId) {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');

    const codeExists =
      await this._userRepository.twoFAActivationCodeExists(userId);
    if (codeExists)
      throw new HttpError(
        429,
        'A code was already sent, please wait before requesting a new one',
      );

    const code = String(randomInt(100000, 999999));
    await this._userRepository.set2FAActivationCode(userId, code);

    await transporter.sendMail({
      to: user.email,
      subject: 'Your SarahaClone 2FA setup code',
      html: otpTemplate(code, 'enable two-factor authentication'),
    });
  }

  async activate2FA(userId: Types.ObjectId, code: string) {
    const [user, otp] = await Promise.all([
      this._userRepository.findById(userId),
      this._userRepository.get2FAActivationCode(userId),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (!otp)
      throw new HttpError(401, 'Code expired, please request a new one');
    if (otp !== code)
      throw new HttpError(401, 'Invalid Code, please try again later');

    await Promise.all([
      this._userRepository.del2FAActivationCode(userId),
      this._userRepository.updateById(userId, { $set: { has2FA: true } }),
    ]);
  }

  async requestVerificationCode(userId: Types.ObjectId) {
    const [user, otpExists] = await Promise.all([
      this._userRepository.findById(userId),
      this._userRepository.verificationCodeExists(userId),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (otpExists)
      throw new HttpError(
        429,
        'A code was already sent, please wait before requesting a new one',
      );

    const code = String(randomInt(100000, 999999));
    await this._userRepository.setVerificationCode(userId, code);

    await transporter.sendMail({
      to: user.email,
      subject: 'Your Account Verification Code',
      html: otpTemplate(code, 'verify your email address'),
    });
  }

  async verifyUserAccount(userId: Types.ObjectId, code: string) {
    const [user, otp] = await Promise.all([
      this._userRepository.findById(userId),
      this._userRepository.getVerificationCode(userId),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (user.verified) throw new HttpError(409, 'Account already verified');
    if (!otp)
      throw new HttpError(401, 'Code expired, please request a new one');
    if (otp !== code)
      throw new HttpError(401, 'Invalid code, please try again');

    await Promise.all([
      this._userRepository.delVerificationCode(userId),
      this._userRepository.updateById(userId, {
        $set: { verified: true },
        $unset: { verificationExpiry: 1 },
      }),
    ]);
  }

  async updateUserPassword(
    userId: Types.ObjectId,
    jti: string,
    {
      old_password,
      new_password,
    }: { old_password: string; new_password: string },
  ) {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'Account does not exist');

    if (user.provider === AuthProviderEnum.Google) return;

    const passwordsMatch = await compare(old_password, user.password);
    if (!passwordsMatch) throw new HttpError(401, 'Invalid credentials');

    const newHashedPassword = await hash(new_password, SALT_ROUNDS);

    await Promise.all([
      this._userRepository.updatePassword(userId, newHashedPassword),
      this._authRepository.blacklistToken(jti),
    ]);
  }

  async getAvatarUploadUrl({ fileType }: AvatarUploadDTO['body']) {
    const key = `avatars/${Date.now()}_${randomUUID()}.${fileType}`;
    return this._r2bucketService.generateUploadUrl(key, fileType);
  }

  async deleteUserAvatar(userId: Types.ObjectId) {
    const user = await this._userRepository.findById(userId, 'avatar');
    if (!user) throw new HttpError(404, 'Account does not exist');
    if (!user.avatar) throw new HttpError(404, 'No avatar to delete');

    await Promise.all([
      this._r2bucketService.deleteFile(user.avatar),
      this._userRepository.updateById(userId, { $set: { avatar: null } }),
    ]);
  }

  async deleteAccount(userId: Types.ObjectId, tokenId: string) {
    const { modifiedCount } = await this._userRepository.deleteById(userId);
    await this._authRepository.blacklistToken(tokenId);
    if (modifiedCount < 1) throw new HttpError(404, 'Account does not exist');
  }
}

export default new UserService(AuthRepository, UserRepository, r2bucketService);
