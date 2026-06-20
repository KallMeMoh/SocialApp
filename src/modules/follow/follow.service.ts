import type { Types } from 'mongoose';
import type { FollowDTO } from './follow.dto.js';
import followRepository, {
  type FollowRepository,
} from './follow.repository.js';
import userRepository, {
  type UserRepository,
} from '../user/user.repository.js';
import { HttpError } from '../../common/errors/http-error.js';

export class FollowService {
  constructor(
    private readonly followRepository: FollowRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async followUser(
    follower: Types.ObjectId,
    { userId: followee }: FollowDTO['params'],
  ) {
    if (follower.equals(followee))
      throw new HttpError(409, 'You are not that populare');

    const userExists = await this.userRepository.findById(followee);

    if (!userExists) throw new HttpError(404, 'Account does not exist');

    await this.followRepository.followUser(follower, followee);
  }

  async unfollowUser(
    follower: Types.ObjectId,
    { userId: followee }: FollowDTO['params'],
  ) {
    if (follower.equals(followee))
      throw new HttpError(409, 'You are not that populare');

    const userExists = await this.userRepository.findById(followee);

    if (!userExists) throw new HttpError(404, 'Account does not exist');

    await this.followRepository.unfollowUser(follower, followee);
  }

  async getUserFollowers({ userId }: FollowDTO['params']) {
    const userExists = await this.userRepository.findById(userId);

    if (!userExists) throw new HttpError(404, 'Account does not exist');

    await this.followRepository.getFollowers(userId);
  }

  async getUserFollowing({ userId }: FollowDTO['params']) {
    const userExists = await this.userRepository.findById(userId);

    if (!userExists) throw new HttpError(404, 'Account does not exist');

    await this.followRepository.getFollowedUsers(userId);
  }
}

const followService = new FollowService(followRepository, userRepository);
export default followService;
