import { Types } from 'mongoose';
import { HttpError } from '../../common/errors/http-error.js';
import type { CreatePostDTO } from '../../common/validation/create-post.schema.js';
import type { PostIdDTO } from '../../common/validation/post-id.schema.js';
import type { UpdatePostDTO } from '../../common/validation/update-post.schema.js';
import UserRepository from '../user/user.repository.js';
import PostRepository from './post.repository.js';
import CommentRepository from '../comment/comment.repository.js';
import { PostStatusEnum } from '../../common/types/post.type.js';
import R2BucketService from '../../common/services/r2bucket.service.js';
import { randomUUID } from 'node:crypto';

class PostService {
  constructor(
    private readonly _r2BucketService: typeof R2BucketService,
    private readonly _userRepository: typeof UserRepository,
    private readonly _postRepository: typeof PostRepository,
    private readonly _commentRepository: typeof CommentRepository,
  ) {}

  async getAllPosts() {
    const posts = await this._postRepository.findAll();
    return posts;
  }

  async getPost({ postId }: PostIdDTO['params']) {
    const post = await this._postRepository.findById(postId);

    if (!post) throw new HttpError(404, 'Post not found');

    return post;
  }

  async getPostComments({ postId }: PostIdDTO['params']) {
    const comments = await this._commentRepository.findComments(
      new Types.ObjectId(postId),
    );

    return comments;
  }

  async createPost(userId: Types.ObjectId, body: CreatePostDTO['body']) {
    const postMedia = await Promise.all(
      body.media.map(async (m) => {
        const key = `posts/${Date.now()}_${randomUUID()}.${m.mimeType.split('/')[1]}`;
        const uploadUrl = await this._r2BucketService.generateUploadUrl(
          key,
          m.mimeType,
        );
        return {
          key,
          uploadUrl,
          mimeType: m.mimeType,
        };
      }),
    );

    const post = await this._postRepository.create({
      author: userId,
      content: {
        text: body.text,
        media: postMedia.map(({ key, mimeType }) => ({ key, mimeType })),
      },
      quotedPostId: null,
      hashtags: [],
      mentions: [],
      stats: {
        commentCount: 0,
        quoteCount: 0,
        reactionCounts: {
          '❤️': 0,
          '👍': 0,
          '😂': 0,
          '😡': 0,
          '😢': 0,
          '😮': 0,
        },
      },
      status:
        postMedia.length > 0 ? PostStatusEnum.Draft : PostStatusEnum.Published,
      deletedAt: null,
    });

    return { post, media: postMedia.map(({ uploadUrl }) => uploadUrl) };
  }

  async confirmPostCreation(
    userId: Types.ObjectId,
    { postId }: PostConfirmationDTO['params'],
  ) {
    const post = await this._postRepository.findById(postId);
    if (!post || !userId.equals(post.author._id))
      throw new HttpError(404, 'Post not found');

    if (post.status === PostStatusEnum.Published)
      throw new HttpError(409, 'Post already published');

    const results = await Promise.all(
      post.content.media.map((m) => this._r2BucketService.fileExists(m.key)),
    );
    const allUploaded = results.every(Boolean);

    if (allUploaded) {
      const updatedPost = await this._postRepository.updateById(postId, {
        status: PostStatusEnum.Published,
      });
      return updatedPost;
    } else {
      await Promise.all(
        post.content.media
          .filter((_, i) => results[i])
          .map((m) => this._r2BucketService.deleteFile(m.key)),
      );
      await this._postRepository.deleteById(postId);
      throw new HttpError(422, 'Some files failed to upload, please try again');
    }
  }

  async updatePost(
    params: UpdatePostDTO['params'],
    body: UpdatePostDTO['body'],
  ) {
    const postId = new Types.ObjectId(params.postId);

    await this._postRepository.updateById(postId, body);
    const post = await this._postRepository.findById(postId);

    return post;
  }

  async softDeletePost(userId: Types.ObjectId, params: PostIdDTO['params']) {
    const user = await this._userRepository.findById(userId);
    if (!user) throw new HttpError(404, 'User does not exist');

    const postId = new Types.ObjectId(params.postId);
    const post = await this._postRepository.findById(postId);
    if (!post) throw new HttpError(404, 'Post does not exist');

    if (user._id.toString() !== post.author.toString())
      throw new HttpError(401, 'Unauthorized');

    await this._postRepository.softDelete(postId);
    return post;
  }

  async deletePost(params: PostIdDTO['params']) {
    const postId = new Types.ObjectId(params.postId);
    const post = await this._postRepository.findById(postId);
    if (!post) throw new HttpError(404, 'Post does not exist');

    await this._postRepository.deleteById(postId);
    return post;
  }
}

export default new PostService(
  R2BucketService,
  UserRepository,
  PostRepository,
  CommentRepository,
);
