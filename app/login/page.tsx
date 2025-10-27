'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { Github, Loader2, UserRound, Lock, Chrome } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { authClient } from '@/lib/auth-client'

export default function LoginPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const signInWith = async (provider: 'google' | 'github') => {
    setPending(true)
    try {
      await authClient.signIn.social({
        provider,
        callbackURL: '/',
      })
      // Social sign-in redirects to provider, no finally needed here
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign in with provider')
      setPending(false)
    }
  }

  const onEmailPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      ?.value

    setPending(true)
    try {
      const { error: authError } = await authClient.signIn.email({
        email,
        password,
        callbackURL: '/',
      })
      if (authError) {
        toast.error('No account found', {
          description:
            'Invalid email or password. Please check your credentials and try again.',
        })
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      toast.error('Sign in failed', {
        description: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Choose your preferred sign-in method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* OAuth Providers */}
            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={() => signInWith('google')}
                disabled={pending}
                className="w-full"
              >
                <Chrome className="mr-2 size-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => signInWith('github')}
                disabled={pending}
                className="w-full"
              >
                <Github className="mr-2 size-4" />
                Continue with GitHub
              </Button>
            </div>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with email
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={onEmailPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="pl-9"
                    disabled={pending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="pl-9"
                    disabled={pending}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                className="font-medium text-primary hover:underline underline-offset-2"
              >
                Sign up
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
