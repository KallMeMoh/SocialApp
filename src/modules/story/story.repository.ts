import type { Types } from 'mongoose';
import type { IStory } from '../../common/types/story.type.js';
import { StoryModel } from '../../database/models/story.model.js';

export class StoryRepository {
  async getUserStories(userId: Types.ObjectId) {
    return StoryModel.find({ author: userId, deletedAt: null })
      .populate('author', 'username avatar')
      .lean();
  }

  async getFollowedUsersStory(followedUsersId: Types.ObjectId[], page: number) {
    return StoryModel.aggregate([
      {
        $match: {
          author: { $in: followedUsersId },
          deletedAt: null,
          expiresAt: { $gt: new Date() },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$author',
          latestCreatedAt: { $first: '$createdAt' },
        },
      },
      { $sort: { latestCreatedAt: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
    ]);
  }

  async createStory(story: IStory) {
    return StoryModel.create(story);
  }

  async deleteStory(storyId: Types.ObjectId, authorId: Types.ObjectId) {
    return StoryModel.updateOne(
      { _id: storyId, author: authorId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
  }
}

const storyRepository = new StoryRepository();
export default storyRepository;
