'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { Github, Loader2, UserRound, Lock, Chrome, Mail } from 'lucide-react'
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

export default function RegisterPage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  const signUpWith = async (provider: 'google' | 'github') => {
    setPending(true)
    try {
      await authClient.signIn.social({ provider, callbackURL: '/' })
      // Social sign-in redirects to provider, no finally needed here
    } catch (error) {
      console.error(error)
      toast.error('Failed to sign up with provider')
      setPending(false)
    }
  }

  const onEmailPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem('name') as HTMLInputElement)?.value
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      ?.value

    setPending(true)
    try {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/',
      })
      if (authError) {
        toast.error('Failed to create account', {
          description:
            authError.message || 'Please check your information and try again.',
        })
      } else {
        toast.success('Account created successfully!', {
          description: 'Redirecting...',
        })
        router.push('/')
      }
    } catch (error) {
      console.error(error)
      toast.error('Sign up failed', {
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
          <h1 className="text-3xl font-bold tracking-tight">
            Create an account
          </h1>
          <p className="text-muted-foreground">
            Get started with your expense tracking journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>
              Choose your preferred registration method
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* OAuth Providers */}
            <div className="grid gap-3">
              <Button
                variant="outline"
                onClick={() => signUpWith('google')}
                disabled={pending}
                className="w-full"
              >
                <Chrome className="mr-2 size-4" />
                Continue with Google
              </Button>
              <Button
                variant="outline"
                onClick={() => signUpWith('github')}
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
                or sign up with email
              </span>
            </div>

            {/* Email + Password Form */}
            <form onSubmit={onEmailPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="John Doe"
                    className="pl-9"
                    disabled={pending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="pl-9"
                    disabled={pending}
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  )
}
