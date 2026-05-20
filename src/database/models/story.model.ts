import { model, Schema } from 'mongoose';
import { StoryTypeEnum, type IStory } from '../../common/types/story.type.js';

const storySchema = new Schema<IStory>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    type: { type: String, enum: Object.values(StoryTypeEnum), required: true },
    text: { type: String },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
storySchema.index({ author: 1, createdAt: -1 });

export const StoryModel = model('Story', storySchema);
