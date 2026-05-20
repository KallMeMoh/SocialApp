import type { QueryFilter, Types, UpdateQuery } from 'mongoose';
import { PostModel } from '../../database/models/post.model.js';
import type { IPost } from '../../common/types/post.type.js';

class PostRepository {
  async findAll(cursor?: Types.ObjectId) {
    const query: QueryFilter<IPost> = { deletedAt: null };
    if (cursor) {
      query['_id'] = { $lt: cursor };
    }

    return PostModel.find(query)
      .populate(['authorId', 'quotedPostId'])
      .sort({ _id: -1 })
      .limit(10)
      .lean();
  }

  async findById(id: Types.ObjectId) {
    return PostModel.findById(id).populate(['authorId', 'quotedPostId']).lean();
  }

  async create(post: IPost) {
    return PostModel.create(post);
  }

  async updateById(id: Types.ObjectId, updates: UpdateQuery<IPost>) {
    return await PostModel.findByIdAndUpdate(id, updates);
  }

  async softDelete(id: Types.ObjectId) {
    const post = await PostModel.findByIdAndDelete(id);
    return post;
  }

  async deleteById(id: Types.ObjectId) {
    const post = await PostModel.findByIdAndDelete(id);
    return post;
  }
}

export default new PostRepository();
