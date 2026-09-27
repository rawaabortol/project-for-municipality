import mongoose from 'mongoose';

const DEFAULT_MONGO_URI = 'mongodb://localhost:27017/tripoli_healthpulse';

/**
 * MongoDB connection using Mongoose.
 * Throws when the database is unreachable: every route depends on it, so the
 * server must not start in a half-working state.
 */
export const connectDB = async () => {
  mongoose.set('bufferCommands', false);
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  const conn = await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  return conn;
};
