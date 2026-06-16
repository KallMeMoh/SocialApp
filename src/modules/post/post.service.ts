import { Types } from 'mongoose';
import { HttpError } from '../../common/errors/http-error.js';
import postRepository, { PostRepository } from './post.repository.js';
import commentRepository, {
  CommentRepository,
} from '../comment/comment.repository.js';
import r2bucketService, {
  R2BucketService,
} from '../../common/services/r2bucket.service.js';
import { PostStatusEnum } from '../../common/types/post.type.js';
import { randomUUID } from 'node:crypto';
import type { CreatePostDTO, PostIdDTO, UpdatePostDTO } from './post.dto.js';

export class PostService {
  constructor(
    private readonly r2BucketService: R2BucketService,
    private readonly postRepository: PostRepository,
    private readonly commentRepository: CommentRepository,
  ) {}

  async getAllPosts() {
    const posts = await this.postRepository.findAll();
    return posts;
  }

  async getPost({ postId }: PostIdDTO['params']) {
    const post = await this.postRepository.findById(postId);

    if (!post) throw new HttpError(404, 'Post not found');

    return post;
  }

  async getPostComments({ postId }: PostIdDTO['params']) {
    const comments = await this.commentRepository.findByPostId(
      new Types.ObjectId(postId),
    );

    return comments;
  }

  async createPost(authorId: Types.ObjectId, body: CreatePostDTO['body']) {
    const postMedia = await Promise.all(
      body.media.map(async (m) => {
        const key = `posts/${Date.now()}_${randomUUID()}.${m.mimeType.split('/')[1]}`;
        const uploadUrl = await this.r2BucketService.generateUploadUrl(
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

    const post = await this.postRepository.create({
      author: authorId,
      content: {
        text: body.text,
        media: postMedia.map(({ key, mimeType }) => ({ key, mimeType })),
      },
      quotedPost: body.quotedPost ?? null,
      hashtags: body.hashtags,
      mentions: body.mentions,
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
    { postId }: PostIdDTO['params'],
  ) {
    const post = await this.postRepository.findById(postId);
    if (!post || !userId.equals(post.author._id))
      throw new HttpError(404, 'Post not found');

    if (post.status === PostStatusEnum.Published)
      throw new HttpError(409, 'Post already published');

    const results = await Promise.all(
      post.content.media.map((m) => this.r2BucketService.fileExists(m.key)),
    );
    const allUploaded = results.every(Boolean);

    if (allUploaded) {
      const updatedPost = await this.postRepository.findByIdAndUpdate(postId, {
        status: PostStatusEnum.Published,
      });
      return updatedPost;
    } else {
      await Promise.all(
        post.content.media
          .filter((_, i) => results[i])
          .map((m) => this.r2BucketService.deleteFile(m.key)),
      );
      await this.postRepository.deleteById(postId);
      throw new HttpError(422, 'Some files failed to upload, please try again');
    }
  }

  async updatePost(
    userId: Types.ObjectId,
    body: UpdatePostDTO['body'],
    params: UpdatePostDTO['params'],
  ) {
    const postId = new Types.ObjectId(params.postId);

    const post = await this.postRepository.findById(postId);
    if (!post?.author.equals(userId))
      throw new HttpError(404, 'Post does not exit');

    const updatedPost = await this.postRepository.findByIdAndUpdate(
      postId,
      body,
    );
    return updatedPost;
  }

  async deletePost(userId: Types.ObjectId, params: PostIdDTO['params']) {
    const { modifiedCount } = await this.postRepository.softDelete(
      params.postId,
      userId,
    );
    if (modifiedCount < 1) throw new HttpError(404, 'Post does not exist');
  }
}

const postService = new PostService(
  r2bucketService,
  postRepository,
  commentRepository,
);
export default postService;
