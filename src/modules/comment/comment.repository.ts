import type { Types } from 'mongoose';

class CommentRepository {
  async findComments(postId: Types.ObjectId) {}
}

export default new CommentRepository();
