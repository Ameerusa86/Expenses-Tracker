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

type UserLite = {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function Navbar({ user }: { user: UserLite | null }) {
  const initial = (user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()
  return (
    <header className="sticky top-0 z-40 mx-auto w-full max-w-[1500px] px-4 pt-4 sm:px-6 lg:px-10">
      <div className="flex h-16 items-center justify-between gap-3 rounded-2xl border border-black/5 bg-white/95 px-3 shadow-soft backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-white/10 dark:bg-[#0b0f1c]/85 dark:shadow-[0_20px_60px_-35px_rgba(0,0,0,0.9)] sm:px-5">
        <div className="flex flex-1 items-center gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl bg-white/90 text-foreground shadow-sm hover:bg-white dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 overflow-hidden border-r border-black/5 bg-gradient-to-b from-background via-background/95 to-background/90 p-0 shadow-2xl backdrop-blur dark:border-white/5 dark:from-[#07090f] dark:via-[#04060c] dark:to-[#03040a]"
            >
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2.5 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">
              ExpenseFlow
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-end lg:flex">
            <div className="relative flex w-full max-w-md items-center rounded-2xl border border-black/5 bg-white/90 px-4 py-2 shadow-inner focus-within:ring-2 focus-within:ring-ring dark:border-white/10 dark:bg-[#0f162a]/80">
              <Search className="mr-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search your finances..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/80"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden rounded-xl bg-white/90 text-foreground shadow-sm hover:bg-white dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl bg-white/90 text-foreground shadow-sm hover:bg-white dark:bg-white/10 dark:text-foreground dark:hover:bg-white/15"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-[0_0_0_2px] shadow-background" />
          </Button>

          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full border border-black/5 p-0.5 transition hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:ring-offset-2 focus:ring-offset-background dark:border-white/10">
                  <Avatar className="h-9 w-9 border border-transparent shadow-sm">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 rounded-2xl border border-black/5 bg-white/95 p-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#0f1424]/90"
              >
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-black/5 dark:border-white/10">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? 'User'}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
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
                  className="cursor-pointer rounded-lg py-2 text-red-600 focus:bg-red-50 focus:text-red-600 dark:text-red-400 dark:focus:bg-red-950/40"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                size="sm"
                className="ml-1 rounded-xl px-4"
              >
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
