import type { Types } from 'mongoose';
import { FollowModel } from '../../database/models/follow.model.js';

export class FollowRepository {
  async followUser(follower: Types.ObjectId, followee: Types.ObjectId) {
    return FollowModel.findOneAndUpdate(
      {
        follower,
        followee,
      },
      { deletedAt: null },
      { upsert: true, new: true },
    ).lean();
  }

  async unfollowUser(follower: Types.ObjectId, followee: Types.ObjectId) {
    return FollowModel.findOneAndUpdate(
      {
        follower,
        followee,
        deletedAt: null,
      },
      { deletedAt: new Date() },
      { new: true },
    ).lean();
  }

  async getFollowers(followee: Types.ObjectId) {
    return FollowModel.find({
      followee,
      deletedAt: null,
    })
      .populate('follower', 'username avatar role verified')
      .lean();
  }

  async getFollowedUsers(follower: Types.ObjectId) {
    return FollowModel.find({
      follower,
      deletedAt: null,
    })
      .populate('followee', 'username avatar role verified')
      .lean();
  }

  async getFollowedUsersIds(follower: Types.ObjectId) {
    return FollowModel.find(
      {
        follower,
        deletedAt: null,
      },
      '+_id',
    );
  }
}

const followRepository = new FollowRepository();
export default followRepository;
