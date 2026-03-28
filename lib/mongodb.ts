import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in .env.local'
  );
}

/**
 * Represents the shape of the cached Mongoose connection object.
 * - `conn`: the active Mongoose instance once connected.
 * - `promise`: the in-flight connection promise to avoid duplicate attempts.
 */
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

/**
 * Augment the NodeJS global type so TypeScript recognises `global.mongoose`.
 * This is necessary because Next.js hot-reloads modules in development,
 * but the `global` object persists across reloads — making it the ideal
 * place to cache the connection.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// Reuse an existing cache from a previous hot reload, or start fresh.
const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

// Persist the cache object on `global` so it survives hot reloads.
global.mongoose = cached;

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * - In development, the connection is cached on `global` to survive
 *   Next.js hot reloads and avoid exhausting the connection pool.
 * - In production, module-level state persists for the lifetime of the
 *   server, so the cached value is equally effective.
 *
 * @returns A promise that resolves to the connected Mongoose instance.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return immediately if a connection is already established.
  if (cached.conn) {
    return cached.conn;
  }

  // If no connection attempt is in progress, start one.
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Disable buffering so operations fail fast instead of queuing
      // indefinitely when the database is unreachable.
      bufferCommands: false,
    });
  }

  // Wait for the connection to resolve, then store and return it.
  cached.conn = await cached.promise;

  return cached.conn;
}
