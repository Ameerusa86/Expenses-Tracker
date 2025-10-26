import { betterAuth } from 'better-auth'
import { MongoClient } from 'mongodb'
import { mongodbAdapter } from 'better-auth/adapters/mongodb'

const client = new MongoClient(
  process.env.DATABASE_URL ||
    'mongodb+srv://ameerhasandev:CWFMZPteIWfx1u3N@cluster.nkwzzmi.mongodb.net/',
)

const db = client.db('expenseflow')

// Initialize Better Auth for Next.js with MongoDB connection
export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
})
