import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
      console.log(`[Database] Connected to MongoDB Atlas / External: ${mongoose.connection.host}`);
      return;
    } catch (err) {
      console.error(`[Database] Failed to connect to MONGODB_URI: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`MongoDB Atlas Connection Failed: ${err.message}. Check Atlas IP whitelist (allow 0.0.0.0/0) and credentials.`);
      }
      console.warn(`[Database] Falling back to Memory Server for local development...`);
    }
  }

  // Graceful fallback to mongodb-memory-server for local SIH demo & offline runs
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memUri = mongod.getUri();
    await mongoose.connect(memUri);
    console.log(`[Database] Connected to In-Memory MongoDB (${memUri}) for seamless zero-setup demo.`);
  } catch (err) {
    console.error(`[Database] Critical: Could not connect to any MongoDB instance:`, err);
    process.exit(1);
  }
}
