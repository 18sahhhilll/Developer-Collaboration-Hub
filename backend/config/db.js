import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let memoryServer = null;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return;
  } catch (error) {
    console.warn(
      `MongoDB connection to ${process.env.MONGODB_URI} failed (${error.message}). ` +
        `Falling back to in-memory MongoDB for local development.`
    );
  }

  try {
    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri('dev-collab-hub');
    const conn = await mongoose.connect(uri);
    console.log(`In-memory MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`In-memory MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export const stopMemoryServer = async () => {
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
};

export default connectDB;
