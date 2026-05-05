import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // If no URI or default local URI, use MongoMemoryServer for preview environment
    if (!uri || uri.includes('localhost') || uri.includes('127.0.0.1')) {
      console.log('Starting in-memory MongoDB for development...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Fallback to memory server if first attempt failed and it wasn't already a memory server
    if (!mongod) {
       try {
         console.log('Attempting fallback to in-memory MongoDB...');
         mongod = await MongoMemoryServer.create();
         const fallbackUri = mongod.getUri();
         await mongoose.connect(fallbackUri);
         console.log('Connected to fallback in-memory MongoDB');
       } catch (fallbackError) {
         console.error('Final fallback failed:', fallbackError);
       }
    }
  }
};

export default connectDB;
