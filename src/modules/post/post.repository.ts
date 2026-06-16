import type { QueryFilter, Types, UpdateQuery } from 'mongoose';
import { PostModel } from '../../database/models/post.model.js';
import type { IPost } from '../../common/types/post.type.js';

export class PostRepository {
  async exists(postId: Types.ObjectId) {
    return (await PostModel.exists({ _id: postId, deletedAt: null })) !== null;
  }

  async findAll(cursor?: Types.ObjectId) {
    const query: QueryFilter<IPost> = { deletedAt: null };
    if (cursor) {
      query['_id'] = { $lt: cursor };
    }

    return PostModel.find(query)
      .populate(['author', 'quotedPost'])
      .sort({ _id: -1 })
      .limit(10)
      .lean();
  }

  async findById(id: Types.ObjectId) {
    return PostModel.findById(id).populate(['author', 'quotedPost']).lean();
  }

  async create(post: IPost) {
    return PostModel.create(post);
  }

  async findByIdAndUpdate(id: Types.ObjectId, updates: UpdateQuery<IPost>) {
    return PostModel.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
    });
  }

  async softDelete(postId: Types.ObjectId, authorId: Types.ObjectId) {
    return PostModel.updateOne(
      { _id: postId, author: authorId, deletedAt: null },
      { $set: { deletedAt: new Date() } },
    );
  }

  async deleteById(id: Types.ObjectId) {
    const post = await PostModel.findByIdAndDelete(id);
    return post;
  }
}

const postRepository = new PostRepository();
export default postRepository;
