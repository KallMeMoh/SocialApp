import { model, Schema } from 'mongoose';
import { ReactionEnum } from '../../common/types/reaction.type.js';
import type { IComment } from '../../common/types/comment.type.js';

const commentSchema = new Schema<IComment>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: { type: String, maxlength: 280, required: true },

    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    stats: {
      reactionCounts: Object.fromEntries(
        Object.values(ReactionEnum).map((e) => [
          e,
          { type: Number, default: 0 },
        ]),
      ),
      replyCount: { type: Number, default: 0 },
    },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

commentSchema.index({ rootPost: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: -1 });

export const CommentModel = model('Comment', commentSchema);
