import mongoose from 'mongoose';

/**
 * MongoDB connection using Mongoose
 */
export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tripoli_healthpulse';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to external Mongo instance. Running with in-memory/hybrid state. Details: ${error.message}`);
    return null;
  }
};
