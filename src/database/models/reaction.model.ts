import { model, Schema } from 'mongoose';
import {
  ReactionEnum,
  type IReaction,
} from '../../common/types/reaction.type.js';

const reactionSchema = new Schema<IReaction>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emoji: { type: String, enum: Object.values(ReactionEnum), required: true },

    post: { type: Schema.Types.ObjectId, ref: 'Post', default: null },
    comment: { type: Schema.Types.ObjectId, ref: 'Comment', default: null },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

reactionSchema.index(
  { author: 1, emoji: 1, post: 1 },
  { unique: true, sparse: true },
);
reactionSchema.index(
  { author: 1, emoji: 1, comment: 1 },
  { unique: true, sparse: true },
);

export const ReactionModel = model('Reaction', reactionSchema);
