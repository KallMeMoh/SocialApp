import { compare, hash } from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';

import {
  CLIENT_ID,
  FRONTEND_URL,
  PENDING_AUTH_SIGNATURE,
  SALT_ROUNDS,
} from '../../config/index.js';
import { HttpError } from '../../common/errors/http-error.js';
import { AuthProvider, TokenType } from '../../common/types/auth.types.js';
import { generateTokens } from '../../common/utils/auth/generate-token.js';
import { sendOTPEmail } from '../../common/utils/email/send-otp-email.js';
import { sendPasswordResetEmail } from '../../common/utils/email/send-password-reset-email.js';
import AuthCacheRepository from '../../database/repository/auth-cache.repository.js';
import UserRepository from '../../database/repository/user.repository.js';
import type { User } from '../../common/types/user.type.js';

class AuthService {
  client = new OAuth2Client();

  constructor(
    private userRepository: typeof UserRepository,
    private authCacheRepository: typeof AuthCacheRepository,
  ) {}

  async signup({
    username,
    email,
    password,
  }: {
    username: string;
    email: string;
    password: string;
  }) {
    const userExists = await this.userRepository.existsByEmail(email);

    if (userExists) throw new HttpError(409, 'User already exists');

    const data: User = {
      username,
      email,
      hashed_password: await hash(password, SALT_ROUNDS),
      provider: AuthProvider.System,
    };

    const user = await this.userRepository.create(data);

    sendOTPEmail(
      `otp:signup:${user._id}`,
      user,
      'Verify your SocialApp account',
      'complete your registration',
    ).catch((err: unknown) => console.error('Failed to email OTP: ', err));

    return user;
  }

  async login({ email, password }: { email: string; password: string }) {
    let user = await this.userRepository.findByEmail(email);

    if (!user) throw new HttpError(404, 'Account does not exist');

    const loginAttempts = await this.authCacheRepository.getLoginAttempts(
      user._id,
    );
    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new HttpError(401, 'Account temporarily banned, try again later');

    const matchedPassword = await compare(password, user.hashed_password!);
    if (!matchedPassword) {
      const loginCounter =
        await this.authCacheRepository.incrementLoginAttempts(user._id);
      if (loginCounter === 1)
        this.authCacheRepository.expireLoginAttempts(user._id);
      throw new HttpError(401, 'Invalid credentials');
    }

    if (user.has2FA) {
      const token = jwt.sign({ sub: user._id }, PENDING_AUTH_SIGNATURE, {
        audience: [`${TokenType.PendingAuth}`],
        expiresIn: '10m',
      });

      await sendOTPEmail(
        `auth:login-2fa:${user._id}`,
        user,
        'Your SocialApp login confirmation code',
        'confirm your login attempt',
      );

      return {
        requires2FA: true,
        token,
      };
    } else return generateTokens(user._id, user.role!);
  }

  async confirmLogin({ otp, token }: { otp: string; token: string }) {
    const { sub = undefined } = jwt.verify(
      token,
      PENDING_AUTH_SIGNATURE,
    ) as JwtPayload;

    const [user, code] = await Promise.all([
      this.userRepository.findById(sub ?? ''),
      this.authCacheRepository.get2FACode(sub ?? ''),
    ]);

    if (!user) throw new HttpError(404, 'Account does not exist');
    if (!code) throw new HttpError(404, 'OTP Expired, please login again');

    const loginAttempts = await this.authCacheRepository.getLoginAttempts(
      user._id,
    );

    if (loginAttempts && parseInt(loginAttempts) > 5)
      throw new HttpError(401, 'Account temporarily banned, try again later');

    if (otp !== code) {
      const loginCounter =
        await this.authCacheRepository.incrementLoginAttempts(user._id);
      if (loginCounter === 1)
        this.authCacheRepository.expireLoginAttempts(user._id);
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
      verified: email_verified,
      avatar: picture,
      provider: AuthProvider.Google,
    });
  }

  async googleLogin({ idToken }: { idToken: string }) {
    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new HttpError(400, 'bad request');

    const user = await this.userRepository.findByEmailAndProvider(
      payload.email ?? '',
      AuthProvider.Google,
    );

    if (!user) throw new HttpError(401, 'Invalid credentials');

    return generateTokens(user._id, user.role!);
  }

  async rotateToken(userId: string, jti: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) throw new HttpError(404, 'Account does not exist');

    const { accessToken: newAccessToken } = generateTokens(
      user._id,
      user.role!,
      jti,
    );

    return newAccessToken;
  }

  async resetPassword(email: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) return;

    const token = randomBytes(32).toString('hex');
    await this.authCacheRepository.setPasswordResetToken(token, user._id);
    await sendPasswordResetEmail(
      user.email,
      `${FRONTEND_URL}/reset-password?token=${token}`,
    );
  }

  async verifyResetPassword(token: string, new_password: string) {
    console.log(new_password, token);
    const userId = await this.authCacheRepository.getPasswordResetToken(token);
    const user = await this.userRepository.findById(userId ?? '');

    if (!user) throw new HttpError(404, 'Account does not exist');

    user.hashed_password = await hash(new_password, SALT_ROUNDS);
    await user.save();
  }

  async blacklistToken(jti: string) {
    await this.authCacheRepository.blacklistToken(jti);
  }
}

export default new AuthService(UserRepository, AuthCacheRepository);
