import type { Types } from 'mongoose';
import type {
  CommentIdDTO,
  CreateCommentDTO,
  PatchCommentDTO,
} from './comment.dto.js';
import CommentRepository from '../comment/comment.repository.js';
import { HttpError } from '../../common/errors/http-error.js';
import PostRepository from '../post/post.repository.js';

class CommentService {
  constructor(
    private readonly _postRepository: typeof PostRepository,
    private readonly _commentRepository: typeof CommentRepository,
  ) {}

  async createComment(
    authorId: Types.ObjectId,
    body: CreateCommentDTO['body'],
  ) {
    const postExists = await this._postRepository.exists(body.postId);
    if (!postExists) throw new HttpError(404, 'Post does not exist');

    if (
      body.commentId &&
      !(await this._commentRepository.exists(body.commentId))
    )
      throw new HttpError(404, 'Comment does not exist');

    const comment = await this._commentRepository.create({
      author: authorId,
      text: body.text,
      post: body.postId,
      comment: body.commentId ?? null,
      stats: {
        reactionCounts: {
          '❤️': 0,
          '👍': 0,
          '😂': 0,
          '😡': 0,
          '😢': 0,
          '😮': 0,
        },
        replyCount: 0,
      },
      deletedAt: null,
    });

    return comment;
  }

  async getCommentReplies({ commentId }: CommentIdDTO['params']) {
    const commentExists = await this._commentRepository.exists(commentId);
    if (!commentExists) throw new HttpError(404, 'Comment does not exist');

    const replies = await this._commentRepository.findByCommentId(commentId);
    return replies;
  }

  async editComment(
    authorId: Types.ObjectId,
    { commentId }: PatchCommentDTO['params'],
    { text }: PatchCommentDTO['body'],
  ) {
    const comment = await this._commentRepository.findOne(commentId, authorId);
    if (!comment) throw new HttpError(404, 'Comment does not exist');

    comment.text = text;
    return await comment.save();
  }

  async deleteComment(
    authorId: Types.ObjectId,
    { commentId }: CommentIdDTO['params'],
  ) {
    const { modifiedCount } = await this._commentRepository.softDelete(
      commentId,
      authorId,
    );
    if (modifiedCount < 1) throw new HttpError(404, 'Comment does not exist');
  }
}

export default new CommentService(PostRepository, CommentRepository);
