import { compare, hash } from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes, randomInt } from 'node:crypto';

import {
  CLIENT_ID,
  FRONTEND_URL,
  PENDING_AUTH_SIGNATURE,
  SALT_ROUNDS,
} from '../../config/index.js';
import { HttpError } from '../../common/errors/http-error.js';
import {
  AuthProviderEnum,
  TokenTypeEnum,
} from '../../common/types/auth.type.js';
import { generateTokens } from '../../common/utils/auth/generate-token.js';
import { sendPasswordResetEmail } from '../../common/utils/email/send-password-reset-email.js';
import { transporter } from '../../common/utils/email/transporter.js';
import { otpTemplate } from '../../common/utils/email/templates/otp.js';
import AuthRepository from './auth.repository.js';
import UserRepository from '../user/user.repository.js';
import { UserRoleEnum } from '../../common/types/user.type.js';
import type { Types } from 'mongoose';
import type {
  ConfirmationDTO,
  ForgotPasswordDTO,
  LoginDTO,
  ResetPasswordDTO,
  SignupDTO,
} from './auth.dto.js';

class AuthService {
  client = new OAuth2Client();

  constructor(
    private userRepository: typeof UserRepository,
    private authRepository: typeof AuthRepository,
  ) {}

  async signup({ username, email, password }: SignupDTO['body']) {
    const userExists = await this.userRepository.existsByEmail(email);

    if (userExists) throw new HttpError(409, 'User already exists');

    const user = await this.userRepository.create({
      username,
      email,
      avatar: null,
      verified: false,
      has2FA: false,
      password,

      provider: AuthProviderEnum.System,
      role: UserRoleEnum.User,
      verificationExpiry: new Date(),
      deletedAt: null,
    });

    const code = randomInt(100_000, 999_999).toString();
    await this.userRepository.setVerificationCode(user._id.toString(), code);
    transporter
      .sendMail({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Verify your SocialApp account',
        html: otpTemplate(code, 'complete your registration'),
      })
      .catch((err: unknown) => console.error('Failed to email OTP: ', err));

    return user;
  }

  async login({ email, password }: LoginDTO['body']) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new HttpError(404, 'Account does not exist');

    if (user.provider === AuthProviderEnum.Google)
      throw new HttpError(
        400,
        'This account uses Google sign-in. Please continue with Google.',
      );

    const loginAttempts = await this.authRepository.getLoginAttempts(
      user._id.toString(),
    );
    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new HttpError(401, 'Account temporarily banned, try again later');

    const matchedPassword = await compare(password, user.password!);
    if (!matchedPassword) {
      await this.authRepository.incrementLoginAttempts(user._id.toString());
      throw new HttpError(401, 'Invalid credentials');
    }

    if (user.has2FA) {
      const token = jwt.sign({ sub: user._id }, PENDING_AUTH_SIGNATURE, {
        audience: [`${TokenTypeEnum.PendingAuth}`],
        expiresIn: '10m',
      });

      const code = randomInt(100_000, 999_999).toString();
      await this.authRepository.store2FACode(user._id.toString(), code);
      await transporter.sendMail({
        from: 'onboarding@resend.dev',
        to: user.email,
        subject: 'Your SocialApp login confirmation code',
        html: otpTemplate(code, 'confirm your login attempt'),
      });

      return { requires2FA: true, token } as const;
    }

    return generateTokens(user._id, user.role!);
  }

  async confirmLogin({ otp, token }: ConfirmationDTO['body']) {
    const { sub = undefined } = jwt.verify(
      token,
      PENDING_AUTH_SIGNATURE,
    ) as JwtPayload;

    const [user, code] = await Promise.all([
      this.userRepository.findById(sub ?? ''),
      this.authRepository.get2FACode(sub ?? ''),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (!code) throw new HttpError(404, 'OTP Expired, please login again');

    const loginAttempts = await this.authRepository.getLoginAttempts(
      user._id.toString(),
    );
    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new HttpError(401, 'Account temporarily banned, try again later');

    if (otp !== code) {
      await this.authRepository.incrementLoginAttempts(user._id.toString());
      throw new HttpError(401, 'Invalid credentials');
    }

    return generateTokens(user._id, user.role!);
  }

  async googleSignup(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new HttpError(400, 'bad request');
    const { given_name, email, picture, email_verified } = payload;

    const user = await this.userRepository.findByEmail(email ?? '');
    if (user) throw new HttpError(409, 'Account already exists');

    await this.userRepository.create({
      username: given_name!,
      email: email!,
      verified: email_verified ?? false,
      avatar: picture ?? null,
      provider: AuthProviderEnum.Google,
      has2FA: false,
      role: UserRoleEnum.User,
      verificationExpiry: null,
      deletedAt: null,
    });
  }

  async googleLogin(idToken: string) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new HttpError(400, 'bad request');

    const user = await this.userRepository.findByEmailAndProvider(
      payload.email ?? '',
      AuthProviderEnum.Google,
    );

    if (!user) throw new HttpError(401, 'Invalid credentials');

    if (user.provider !== AuthProviderEnum.Google)
      throw new HttpError(
        400,
        'This account uses password sign-in. Please log in with your password.',
      );

    return generateTokens(user._id, user.role!);
  }

  async rotateToken(userId: Types.ObjectId, jti: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new HttpError(404, 'Account does not exist');

    const { accessToken: newAccessToken } = generateTokens(
      user._id,
      user.role!,
      jti,
    );

    return newAccessToken;
  }

  async resetPassword({ email }: ForgotPasswordDTO['body']) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) return;

    const token = randomBytes(32).toString('hex');
    await this.authRepository.setPasswordResetToken(token, user._id.toString());
    await sendPasswordResetEmail(
      user.email,
      `${FRONTEND_URL}/reset-password?token=${token}`,
    );
  }

  async verifyResetPassword(
    { token }: ResetPasswordDTO['params'],
    { new_password }: ResetPasswordDTO['body'],
  ) {
    const userId = await this.authRepository.getPasswordResetToken(token);
    if (!userId) throw new HttpError(404, 'Invalid or expired reset token');

    const hashedPassword = await hash(new_password, SALT_ROUNDS);
    await this.userRepository.updatePassword(userId, hashedPassword);
  }

  async blacklistToken(jti: string) {
    await this.authRepository.blacklistToken(jti);
  }
}

export default new AuthService(UserRepository, AuthRepository);
