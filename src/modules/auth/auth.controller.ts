import { Router } from 'express';

import AuthService from './auth.service.js';
import { validate } from '../../middlewares/validation.js';
import { signupSchema } from '../../common/validation/signup.schema.js';
import { loginSchema } from '../../common/validation/login.schema.js';
import { confirmationSchema } from '../../common/validation/confirmation.schema.js';
import { TokenType } from '../../common/types/auth.types.js';
import { authenticate } from '../../middlewares/authentication.js';
import { resetPasswordSchema } from '../../common/validation/reset-password.schema.js';
import { forgetPasswordSchema } from '../../common/validation/forget-password.schema.js';

const authRouter = Router();

authRouter.post('/signup', validate(signupSchema), async (req, res) => {
  await AuthService.signup(req.body);
  return res.status(201).json({ message: 'Account created successfully' });
});

authRouter.post('/login', validate(loginSchema), async (req, res) => {
  const credentials = await AuthService.login(req.body);
  return res.status(200).json({
    message: credentials.requires2FA
      ? 'Please provide your 2FA OTP'
      : 'Logged in successfully',
    credentials,
  });
});

authRouter.post(
  '/login/confirm',
  validate(confirmationSchema),
  async (req, res) => {
    const credentials = await AuthService.confirmLogin(req.body);
    return res
      .status(200)
      .json({ message: 'Logged in successfully', credentials });
  },
);

authRouter.post('/oauth/signup/google', async (req, res) => {
  await AuthService.googleSignup(req.body.idToken);
  return res.status(201).json({ message: 'Account created successfully' });
});

authRouter.post('/oauth/login/google', async (req, res) => {
  const tokens = await AuthService.googleLogin(req.body.idToken);
  return res.status(201).json({ message: 'Logged in successfully', ...tokens });
});

authRouter.post(
  '/token/refresh',
  authenticate(TokenType.Refresh),
  async (req, res) => {
    const accessToken = await AuthService.rotateToken(
      req.userId!,
      req.tokenId!,
    );
    return res
      .status(200)
      .json({ message: 'Token refreshed successfully', accessToken });
  },
);

authRouter.post(
  '/forget-password',
  validate(forgetPasswordSchema),
  async (req, res) => {
    await AuthService.resetPassword(req.body.email);
    return res.status(200).json({
      message:
        'You will receive an email shortly if you had registered with us',
    });
  },
);

authRouter.post(
  '/reset-password/:token',
  validate(resetPasswordSchema),
  async (req, res) => {
    await AuthService.verifyResetPassword(
      req.params['token'] as string,
      req.body.new_password,
    );
    res.status(200).json({ message: 'Password reset successfully' });
  },
);

authRouter.post('/logout', authenticate(), async (req, res) => {
  await AuthService.blacklistToken(req.tokenId!);
  return res.status(200).json({ message: 'Token revoked successfully' });
});

export default authRouter;
