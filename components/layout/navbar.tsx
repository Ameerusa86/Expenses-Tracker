'use client'

import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import {
  Menu,
  TrendingUp,
  LogOut,
  User,
  Settings as SettingsIcon,
  Bell,
  Search,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Sidebar } from './sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'
import { DensityToggle } from '@/components/density-toggle'

type UserLite = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function Navbar({ user }: { user: UserLite | null }) {
  const initial = (user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()
  return (
    <header className="sticky top-0 z-40 w-full bg-sidebar border-b border-sidebar-border">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <div className="flex flex-1 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 overflow-hidden bg-background p-0"
            >
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-foreground/15 text-sidebar-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
              ExpenseFlow
            </span>
          </Link>

          <Link href="/" className="hidden items-center gap-2.5 md:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-foreground/15 text-sidebar-foreground">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-base font-bold tracking-tight text-sidebar-foreground">
              ExpenseFlow
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-end lg:flex">
            <div className="relative flex w-full max-w-md items-center rounded-lg bg-sidebar-accent/50 px-4 py-2 border border-sidebar-border">
              <Search className="mr-3 h-4 w-4 text-sidebar-foreground/70" />
              <input
                type="search"
                placeholder="Search your finances..."
                className="w-full bg-transparent text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/60 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sidebar-primary ring-2 ring-sidebar" />
          </Button>

          <DensityToggle />
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full border border-sidebar-border p-0.5 transition hover:bg-sidebar-accent focus:outline-none focus:ring-2 focus:ring-sidebar-primary">
                  <Avatar className="h-9 w-9 border border-transparent">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? 'User'}
                    />
                    <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-lg border bg-card p-2 shadow-lg text-foreground"
              >
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/60">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? 'User'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-sm font-semibold leading-none">
                        {user.name ?? 'User'}
                      </span>
                      {user.email ? (
                        <span className="text-xs text-muted-foreground leading-none">
                          {user.email}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/profile" className="flex items-center py-2">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
                  <Link href="/settings" className="flex items-center py-2">
                    <SettingsIcon className="mr-3 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = '/login'
                        },
                      },
                    })
                  }}
                  className="cursor-pointer rounded-lg py-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="ml-1 px-4">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
