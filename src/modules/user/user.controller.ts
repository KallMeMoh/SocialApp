import { Router } from 'express';

import UserService from './user.service.js';
import { validate } from '../../middlewares/validation.js';
import { UserRoleEnum } from '../../common/types/user.type.js';
import { authorize } from '../../middlewares/authorization.js';
import {
  avatarUploadSchema,
  changePasswordSchema,
  oneTimePasswordSchema,
  userIdSchema,
} from './user.dto.js';

export const userRouter = Router();

userRouter.get('/:id', validate(userIdSchema), async (req, res) => {
  const user = await UserService.getUserProfile(req.params);
  return res.status(200).json(user);
});

// note to self: These 2 are for enabling 2FA service
userRouter.post('/2fa/enable', async (req, res) => {
  await UserService.request2FAActivation(req.userId!);
  return res.status(200).json({ message: 'Please check your inbox' });
});

userRouter.post(
  '/2fa/verify',
  validate(oneTimePasswordSchema),
  async (req, res) => {
    await UserService.activate2FA(req.userId!, req.body.otp);
    return res
      .status(200)
      .json({ message: 'Account has been verified successfully' });
  },
);

// note to self: These 2 are for flipping the verified account flag (user.verified)
userRouter.post('/verification/resend', async (req, res) => {
  await UserService.requestVerificationCode(req.userId!);
  return res.status(200).json({ message: 'OTP code emailed successfully' });
});

userRouter.post(
  '/verify',
  validate(oneTimePasswordSchema),
  async (req, res) => {
    await UserService.verifyUserAccount(req.userId!, req.body.otp);
    return res
      .status(200)
      .json({ message: 'Account has been verified successfully' });
  },
);

userRouter.post(
  '/password/update',
  validate(changePasswordSchema),
  async (req, res) => {
    await UserService.updateUserPassword(req.userId!, req.tokenId!, req.body);
    return res.status(200).json({ message: 'Password updated successfully' });
  },
);

userRouter.get(
  '/avatar-upload-url',
  validate(avatarUploadSchema),
  async (req, res) => {
    const url = await UserService.getAvatarUploadUrl(req.body);
    return res.status(200).json({ url });
  },
);

userRouter.delete('/', async (req, res) => {
  await UserService.deleteAccount({ userId: req.userId! });
  return res.status(200).json({ message: 'Account deleted successfully' });
});

userRouter.delete(
  '/:userId',
  validate(userIdSchema),
  authorize(UserRoleEnum.Admin),
  async (req, res) => {
    await UserService.deleteAccount(req.params);
    return res.status(200).json({ message: 'Account deleted successfully' });
  },
);
