import { randomUUID } from 'node:crypto';
import r2bucketService from '../../common/services/r2bucket.service.js';
import type { AvatarUploadDTO } from '../../common/validation/avatar-upload.schema.js';

class UserService {
  constructor(private _r2bucketService: typeof r2bucketService) {}

  async getAvatarUploadUrl({ fileType }: AvatarUploadDTO['body']) {
    const key = `uploads/avatars/${Date.now()}_${randomUUID()}.${fileType}`;
    return await this._r2bucketService.generateUploadUrl(key, fileType);
  }
}

export default new UserService(r2bucketService);
