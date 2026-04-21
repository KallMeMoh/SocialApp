import { transporter } from './transporter.js';
import { passwordResetTemplate } from './templates/password-reset.js';

export const sendPasswordResetEmail = async (email: string, link: string) => {
  await transporter.sendMail({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Reset your SocialApp password',
    html: passwordResetTemplate(link),
  });
};
