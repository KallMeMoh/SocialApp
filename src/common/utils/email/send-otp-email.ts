import { randomInt } from 'node:crypto';
import { otpTemplate } from './templates/otp.js';
import { transporter } from './transporter.js';
import type { User } from '../../types/user.type.js';
import { RedisClient } from '../../../database/redis.connection.js';

export const sendOTPEmail = async (
  key: string,
  user: User,
  subject: string,
  reason: string,
) => {
  const code = randomInt(100_000, 999_999).toString();
  await RedisClient.set(`${key}`, `${code}`, {
    expiration: {
      type: 'EX',
      value: 300,
    },
  });

  await transporter.sendMail({
    from: 'onboarding@resend.dev',
    to: user.email,
    subject,
    html: otpTemplate(code, reason),
  });
};
