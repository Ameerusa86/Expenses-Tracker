import { auth } from '@/lib/auth'

// Expose Better Auth API routes at /api/auth/*
export const GET = auth.handler
export const POST = auth.handler
