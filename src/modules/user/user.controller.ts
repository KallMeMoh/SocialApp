import { Router } from 'express';
import UserService from './user.service.js';
import { authenticate } from '../../middlewares/authentication.js';
import { avatarUploadSchema } from '../../common/validation/avatar-upload.schema.js';
import { validate } from '../../middlewares/validation.js';

export const userRouter = Router();

userRouter.get(
  '/avatar-upload-url',
  validate(avatarUploadSchema),
  authenticate(),
  async (req, res) => {
    const url = await UserService.getAvatarUploadUrl(req.body);
    return res.status(200).json({ url });
  },
);
