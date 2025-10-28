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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1920px] mx-auto">
        {/* Left Section - Mobile Menu + Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:bg-muted/50"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>

          {/* Logo - Only show on mobile when sidebar is hidden */}
          <Link href="/" className="flex items-center gap-2.5 md:hidden group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">ExpenseFlow</span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search transactions..."
                className="w-64 xl:w-80 h-9 pl-9 pr-4 rounded-lg border bg-muted/30 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Actions + User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Search Button - Mobile only */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-muted/50"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-muted/50"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background">
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-muted hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={user.name ?? 'User'}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2">
                <DropdownMenuLabel className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-muted">
                      <AvatarImage
                        src={user.image ?? undefined}
                        alt={user.name ?? 'User'}
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
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
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/profile" className="flex items-center py-2">
                    <User className="mr-3 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
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
                  className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer py-2"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm" className="ml-2">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
