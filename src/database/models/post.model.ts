import { model, Schema } from 'mongoose';
import type { IPost } from '../../common/types/post.type.js';
import { ReactionEnum } from '../../common/types/reaction.type.js';

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      text: { type: String, maxlength: 280 },
      media: [
        {
          url: { type: String },
          type: { type: String, enum: ['image', 'video', 'gif'] },
          altText: { type: String },
        },
      ],
    },

    quotedPostId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      default: null,
    },

    stats: {
      reactionCounts: Object.fromEntries(
        Object.values(ReactionEnum).map((e) => [
          e,
          { type: Number, default: 0 },
        ]),
      ),
      commentCount: { type: Number, default: 0 },
      quoteCount: { type: Number, default: 0 },
    },

    hashtags: [{ type: String }],
    mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    isDeleted: { type: Date, default: null },
  },
  { timestamps: true },
);

postSchema.index({ authorId: 1, createdAt: -1 });

export const PostModel = model('Post', postSchema);
