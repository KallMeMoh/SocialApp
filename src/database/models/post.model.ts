import { model, Schema } from 'mongoose';
import { ReactionEnum } from '../../common/types/reaction.type.js';
import {
  MediaTypeEnum,
  PostStatusEnum,
  type IPost,
} from '../../common/types/post.type.js';

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      text: { type: String, maxlength: 280 },
      media: {
        type: [
          {
            url: { type: String },
            type: { type: String, enum: Object.values(MediaTypeEnum) },
            altText: { type: String },
          },
        ],
      },
    },

    quotedPostId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },

    stats: {
      reactionCounts: Object.fromEntries(
        Object.values(ReactionEnum).map((e) => [e, { type: Number }]),
      ),
      commentCount: { type: Number },
      quoteCount: { type: Number },
    },

    hashtags: { type: [String] },
    mentions: { type: [Schema.Types.ObjectId], ref: 'User' },

    status: {
      type: String,
      enum: Object.values(PostStatusEnum),
    },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

postSchema.index({ author: 1, createdAt: -1 });

export const PostModel = model('Post', postSchema);
