import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
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
import { UserModel } from '../../database/models/user.model.js';
import { RedisClient } from '../../database/redis.connection.js';
import { generateTokens } from '../../common/utils/auth/generate-token.js';
import { sendOTPEmail } from '../../common/utils/email/send-otp-email.js';
import { sendPasswordResetEmail } from '../../common/utils/email/send-password-reset-email.js';

export const signup = async ({
  username,
  email,
  password,
}: {
  username: string;
  email: string;
  password: string;
}) => {
  const userExists = await UserModel.exists({ email });

  if (userExists) throw new HttpError(409, 'User already exists');

  const data = {
    username,
    email,
    hashed_password: await hash(password, SALT_ROUNDS),
    provider: AuthProvider.System,
  };

  const user = await UserModel.create(data);

  sendOTPEmail(
    `otp:signup:${user._id}`,
    user,
    'Verify your SocialApp account',
    'complete your registration',
  ).catch((err: unknown) => console.error('Failed to email OTP: ', err));

  return user;
};

export const login = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  let user = await UserModel.findOne({ email });

  if (!user) throw new HttpError(404, 'Account does not exist');

  const tries = await RedisClient.get(`auth:login-counter:${user._id}`);
  if (tries && parseInt(tries) > 5)
    throw new HttpError(401, 'Account temporarily banned, try again later');

  const matchedPassword = await compare(password, user.hashed_password!);
  if (!matchedPassword) {
    const loginCounter = await RedisClient.incr(
      `auth:login-counter:${user._id}`,
    );
    if (loginCounter === 1)
      RedisClient.expire(`auth:login-counter:${user._id}`, 1800);
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
  } else return generateTokens(user._id, user.role);
};

export const confirmLogin = async ({
  otp,
  token,
}: {
  otp: string;
  token: string;
}) => {
  const { sub = undefined } = jwt.verify(token, PENDING_AUTH_SIGNATURE);

  const [user, code] = await Promise.all([
    UserModel.findById(sub),
    RedisClient.get(`auth:login-2fa:${sub}`),
  ]);

  if (!user) throw new HttpError(404, 'Account does not exist');
  if (!code) throw new HttpError(404, 'OTP Expired, please login again');

  const tries = await RedisClient.get(`auth:login-counter:${user._id}`);

  if (tries && parseInt(tries) > 5)
    throw new HttpError(401, 'Account temporarily banned, try again later');

  if (otp !== code) {
    const loginCounter = await RedisClient.incr(
      `auth:login-counter:${user._id}`,
    );
    if (loginCounter === 1)
      RedisClient.expire(`auth:login-counter:${user._id}`, 1800);
    throw new HttpError(401, 'Invalid credentials');
  }

  return generateTokens(user._id, user.role);
};

const client = new OAuth2Client();
export const googleSignup = async (idToken: string) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new HttpError(400, 'bad request');
  const { given_name, email, picture, email_verified } = payload;

  const user = await UserModel.findOne({ email });

  if (user) throw new HttpError(409, 'Account already exists');

  await UserModel.create({
    username: given_name,
    email,
    verified: email_verified,
    avatar: picture,
    provider: AuthProvider.Google,
  });
};

export const googleLogin = async ({ idToken }: { idToken: string }) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload) throw new HttpError(400, 'bad request');

  const user = await UserModel.findOne({
    email: payload.email,
    provider: AuthProvider.Google,
  });

  if (!user) throw new HttpError(401, 'Invalid credentials');

  return generateTokens(user._id, user.role);
};

export const rotateToken = async (userId: string, jti: string) => {
  const user = await UserModel.findById(userId);

  if (!user) throw new HttpError(404, 'Account does not exist');

  const { accessToken: newAccessToken } = generateTokens(
    user._id,
    user.role,
    jti,
  );

  return newAccessToken;
};

export const resetPassword = async (email: string) => {
  const user = await UserModel.findOne({ email });

  if (!user) return;

  const token = randomBytes(32).toString('hex');
  await RedisClient.set(`auth:password-reset:${token}`, `${user._id}`, {
    expiration: {
      type: 'EX',
      value: 900,
    },
  });
  await sendPasswordResetEmail(
    user.email,
    `${FRONTEND_URL}/reset-password?token=${token}`,
  );
};

export const verifyResetPassword = async (
  token: string,
  new_password: string,
) => {
  console.log(new_password, token);
  const userId = await RedisClient.get(`auth:password-reset:${token}`);
  const user = await UserModel.findById(userId);

  if (!user) throw new HttpError(404, 'Account does not exist');

  user.hashed_password = await hash(new_password, SALT_ROUNDS);
  await user.save();
};

export const blacklistToken = async (jti: string) => {
  const ttl = 365 * 24 * 60 * 60;
  await RedisClient.set(`jwt:blacklist:${jti}`, '1', {
    expiration: {
      type: 'EX',
      value: ttl,
    },
  });
};
