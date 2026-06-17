import mongoose from 'mongoose';

export async function runInTransaction(
  work: (session: mongoose.mongo.ClientSession) => Promise<void>,
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await work(session);
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    session.endSession();
  }
}
