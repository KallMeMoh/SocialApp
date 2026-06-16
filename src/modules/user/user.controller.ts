import { Router } from 'express';

import { chatRouter } from '../conversation/conversation.controller.js';
import userService from './user.service.js';
import { validate } from '../../middlewares/validation.js';
import {
  avatarUploadSchema,
  changePasswordSchema,
  oneTimePasswordSchema,
  updateUserSchema,
  userIdSchema,
  userProfileSchema,
} from './user.dto.js';

export const userRouter = Router();

userRouter.use('/:userId/chat', chatRouter);

userRouter.get('/:id', validate(userIdSchema), async (req, res) => {
  const user = await userService.getUserProfile(req.params);
  return res.status(200).json(user);
});

userRouter.get('/:username', validate(userProfileSchema), async (req, res) => {
  const user = await userService.getUserByUsername(req.params);
  return res.status(200).json(user);
});

userRouter.put('/', validate(updateUserSchema), async (req, res) => {
  const user = await userService.updateUser(req.userId!, req.body);
  return res.status(200).json(user);
});

// note to self: These 2 are for enabling 2FA service
userRouter.post('/2fa/enable', async (req, res) => {
  await userService.request2FAActivation(req.userId!);
  return res.status(200).json({ message: 'Please check your inbox' });
});

userRouter.post(
  '/2fa/verify',
  validate(oneTimePasswordSchema),
  async (req, res) => {
    await userService.activate2FA(req.userId!, req.body.otp);
    return res
      .status(200)
      .json({ message: 'Account has been verified successfully' });
  },
);

// note to self: These 2 are for flipping the verified account flag (user.verified)
userRouter.post('/verification/resend', async (req, res) => {
  await userService.requestVerificationCode(req.userId!);
  return res.status(200).json({ message: 'OTP code emailed successfully' });
});

userRouter.post(
  '/verify',
  validate(oneTimePasswordSchema),
  async (req, res) => {
    await userService.verifyUserAccount(req.userId!, req.body.otp);
    return res
      .status(200)
      .json({ message: 'Account has been verified successfully' });
  },
);

userRouter.post(
  '/password/update',
  validate(changePasswordSchema),
  async (req, res) => {
    await userService.updateUserPassword(req.userId!, req.tokenId!, req.body);
    return res.status(200).json({ message: 'Password updated successfully' });
  },
);

userRouter.get(
  '/avatar-upload-url',
  validate(avatarUploadSchema),
  async (req, res) => {
    const url = await userService.getAvatarUploadUrl(req.body);
    return res.status(200).json({ url });
  },
);

userRouter.delete('/', async (req, res) => {
  await userService.deleteAccount(req.userId!, req.tokenId!);
  return res.status(200).json({ message: 'Account deleted successfully' });
});
