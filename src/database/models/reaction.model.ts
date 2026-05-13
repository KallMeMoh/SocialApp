import { model, Schema } from 'mongoose';
import {
  ReactionEnum,
  type IReaction,
} from '../../common/types/reaction.type.js';

const reactionSchema = new Schema<IReaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, enum: Object.values(ReactionEnum), required: true },

    postId: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    commentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true },
);

reactionSchema.index(
  { userId: 1, emoji: 1, postId: 1 },
  { unique: true, sparse: true },
);
reactionSchema.index(
  { userId: 1, emoji: 1, commentId: 1 },
  { unique: true, sparse: true },
);

export const ReactionModel = model('Reaction', reactionSchema);
