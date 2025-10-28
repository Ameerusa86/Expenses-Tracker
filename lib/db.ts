import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI as string
if (!MONGODB_URI) throw new Error('Missing MONGODB_URI env var')

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached = global.mongoose as MongooseCache

if (!cached) {
  cached = { conn: null, promise: null }
  global.mongoose = cached
}

export async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'expenseflow',
      bufferCommands: false,
      // Optional tuning for serverless
      maxPoolSize: 10,
    })
  }
  cached.conn = await cached.promise
  return cached.conn
}
