import {
  ADMIN_ACCESS_SIGNATURE,
  ADMIN_REFRESH_SIGNATURE,
  PENDING_AUTH_SIGNATURE,
  USER_ACCESS_SIGNATURE,
  USER_REFRESH_SIGNATURE,
} from '../../../config/index.js';
import { UserRoleEnum } from '../../types/user.type.js';

export const getSignature = (userRole = UserRoleEnum.User) => {
  let accessSignature = '';
  let refreshSignature = '';

  switch (userRole) {
    case UserRoleEnum.User:
      accessSignature = USER_ACCESS_SIGNATURE;
      refreshSignature = USER_REFRESH_SIGNATURE;
      break;
    case UserRoleEnum.Admin:
      accessSignature = ADMIN_ACCESS_SIGNATURE;
      refreshSignature = ADMIN_REFRESH_SIGNATURE;
      break;
  }

  return {
    accessSignature,
    refreshSignature,
    pendingSignature: PENDING_AUTH_SIGNATURE,
  };
};
