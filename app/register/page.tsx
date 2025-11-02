'use client'

import Link from 'next/link'
import { useState, FormEvent } from 'react'
import { Github, Loader2, UserRound, Lock, Chrome, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Card,
  CardHeader,
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
      <div className="grid w-full max-w-5xl gap-6 rounded-[2.5rem] border border-border/60 bg-surface/95 p-6 shadow-elevated backdrop-blur-2xl dark:border-border/60 dark:bg-surface/70 sm:p-8 lg:grid-cols-[1fr_1.1fr] lg:p-12">
        <div className="relative hidden overflow-hidden rounded-[2rem] border border-primary/35 bg-gradient-to-br from-primary/90 via-primary/78 to-indigo-500 p-10 text-primary-foreground shadow-[0_40px_100px_-45px_rgba(58,16,149,0.7)] lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-x-10 top-8 h-44 rounded-full bg-primary-foreground/15 blur-3xl" />
          <div className="relative space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
              Start smarter
            </span>
            <h2 className="text-3xl font-semibold tracking-tight">
              Everything you need to get ahead of your finances.
            </h2>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-foreground/80" />{' '}
                Custom categories and smart tags
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-foreground/80" />{' '}
                Powerful insights with live dashboards
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary-foreground/80" />{' '}
                Forecast tools for confident planning
              </li>
            </ul>
          </div>
          <div className="relative mt-8 rounded-2xl border border-primary-foreground/25 bg-primary-foreground/15 p-5 text-sm text-primary-foreground/80 backdrop-blur">
            <p className="font-medium">
              “Creating an account took minutes and immediately simplified our
              monthly reporting.”
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
              — Daniel, Operations
            </p>
          </div>
        </div>

        <Card className="h-full border border-border/60 bg-surface/95 px-6 py-8 shadow-soft dark:border-border/60 dark:bg-surface/70 sm:px-8">
          <CardHeader className="space-y-4 border-none px-0">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create your account
              </h1>
              <CardDescription className="text-sm text-muted-foreground">
                Join ExpenseFlow and start tracking in under a minute
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-0">
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
              <Separator className="bg-muted" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/95 px-3 py-1 text-xs text-muted-foreground shadow-sm dark:bg-surface/70">
                or sign up with email
              </span>
            </div>

            <form onSubmit={onEmailPassword} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Full name
                </Label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Jordan Lee"
                    className="pl-11"
                    disabled={pending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="pl-11"
                    disabled={pending}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-[0.25em] text-muted-foreground"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    placeholder="••••••••"
                    className="pl-11"
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

          <CardFooter className="flex flex-col gap-4 border-none px-0 text-xs text-muted-foreground">
            <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3 text-xs">
              <span className="font-medium text-foreground">
                Already registered?
              </span>
              <Link
                href="/login"
                className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
            <p className="text-center text-[11px] text-muted-foreground">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="underline">
                Privacy Policy
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
