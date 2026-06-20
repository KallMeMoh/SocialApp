import type { Types } from 'mongoose';
import { randomUUID } from 'node:crypto';
import storyRepository, { type StoryRepository } from './story.repository.js';
import type {
  CreateStoryDTO,
  FollowedUsersStoriesDTO,
  DeleteStoryDTO,
} from './story.dto.js';
import followRepository, {
  type FollowRepository,
} from '../follow/follow.repository.js';

export class StoryService {
  constructor(
    private readonly storyRepository: StoryRepository,
    private readonly followRepository: FollowRepository,
  ) {}

  async getAuthorStories(authorId: Types.ObjectId) {
    return await this.storyRepository.getUserStories(authorId);
  }

  async getFollowedUsersStories(
    authorId: Types.ObjectId,
    { page }: FollowedUsersStoriesDTO['query'],
  ) {
    const followedUsersId =
      await this.followRepository.getFollowedUsersIds(authorId);

    const authorsPage = await this.storyRepository.getFollowedUsersStory(
      followedUsersId.map((user) => user._id),
      page,
    );
    return await Promise.all(
      authorsPage.map(this.storyRepository.getUserStories),
    );
  }

  async createStory(
    authorId: Types.ObjectId,
    { mimeType, text }: CreateStoryDTO['body'],
  ) {
    const story = await this.storyRepository.createStory({
      author: authorId,
      text,

      media: mimeType
        ? {
            mimeType,
            key: `stories/${Date.now()}_${randomUUID()}.${mimeType.split('/')[1]}`,
          }
        : null,
      expiresAt: new Date(),
      deletedAt: null,
    });

    return {
      story,
      key: mimeType
        ? `stories/${Date.now()}_${randomUUID()}.${mimeType.split('/')[1]}`
        : null,
    };
  }

  async deleteStory(
    authorId: Types.ObjectId,
    { storyId }: DeleteStoryDTO['params'],
  ) {
    await this.storyRepository.deleteStory(authorId, storyId);
  }
}

const storyService = new StoryService(storyRepository, followRepository);
export default storyService;
