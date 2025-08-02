import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Ensure global.mongoose is defined (only for development mode)
global.mongoose = global.mongoose || { conn: null, bucket: null, promise: null };

export async function connectToDatabase() {
  if (global.mongoose.conn) return { db: global.mongoose.conn, bucket: global.mongoose.bucket };

  if (!global.mongoose.promise) {
    global.mongoose.promise = mongoose.connect(MONGODB_URI, {}).then((mongoose) => {
      const bucket = new GridFSBucket(mongoose.connection.db, {
        bucketName: "uploads",
      });
      return { db: mongoose.connection, bucket };
    });
  }

  const { db, bucket } = await global.mongoose.promise;
  global.mongoose.conn = db;
  global.mongoose.bucket = bucket;

  return { db, bucket };
}
