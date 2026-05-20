import { Router } from 'express';

import AuthService from './auth.service.js';
import { validate } from '../../middlewares/validation.js';
import { TokenTypeEnum } from '../../common/types/auth.type.js';
import { authenticate } from '../../middlewares/authentication.js';
import {
  confirmationSchema,
  forgetPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from './auth.dto.js';

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
  authenticate(TokenTypeEnum.Refresh),
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
    await AuthService.resetPassword(req.body);
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
    await AuthService.verifyResetPassword(req.params, req.body);
    res.status(200).json({ message: 'Password reset successfully' });
  },
);

authRouter.post('/logout', authenticate(), async (req, res) => {
  await AuthService.blacklistToken(req.tokenId!);
  return res.status(200).json({ message: 'Token revoked successfully' });
});

export default authRouter;
