//lib/db.ts
import mongoose from "mongoose";

// Global caching için type declaration
declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI;
console.log("Connecting to MongoDB at:", process.env.MONGODB_URI);

// Sadece server-side'da environment check yap
if (!MONGODB_URI && typeof window === 'undefined') {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  // don't allow on client side
  if (typeof window !== 'undefined') {
    return;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("MongoDB connected");
      return mongoose;
    }).catch((error) => {
      console.log("MongoDB connection error:", error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.log("Database connection failed:", error);
    throw error;
  }
};
