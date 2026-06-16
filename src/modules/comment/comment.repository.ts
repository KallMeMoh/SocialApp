import { CommentModel } from '../../database/models/comment.model.js';
import type { IComment } from '../../common/types/comment.type.js';
import type { Types } from 'mongoose';

export class CommentRepository {
  async exists(commentId: Types.ObjectId) {
    return (
      (await CommentModel.exists({ _id: commentId, deletedAt: null })) !== null
    );
  }

  async findOne(commentId: Types.ObjectId, authorId: Types.ObjectId) {
    return CommentModel.findOne({
      _id: commentId,
      author: authorId,
      deletedAt: null,
    });
  }

  async findByPostId(postId: Types.ObjectId) {
    return CommentModel.find({ post: postId, deletedAt: null });
  }

  async findByCommentId(commentId: Types.ObjectId) {
    return CommentModel.find({ comment: commentId, deletedAt: null });
  }

  async create(comment: IComment) {
    return CommentModel.create(comment);
  }

  async softDelete(commentId: Types.ObjectId, authorId: Types.ObjectId) {
    return CommentModel.updateOne(
      { _id: commentId, author: authorId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
  }
}

const commentRepository = new CommentRepository();
export default commentRepository;
