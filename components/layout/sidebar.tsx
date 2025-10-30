'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PieChart,
  Settings,
  Receipt,
  Tags,
  TrendingUp,
  LayoutDashboard,
  Wallet,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { name: 'Transactions', icon: Receipt, href: '/transactions' },
  { name: 'Accounts', icon: Wallet, href: '/accounts' },
  { name: 'Credit & Loans', icon: Wallet, href: '/credit-loans' },
  { name: 'Categories', icon: Tags, href: '/categories' },
  { name: 'Reports', icon: FileText, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

interface SidebarProps {
  isMobile?: boolean
}

export function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const containerClasses = isMobile
    ? 'flex w-full flex-col bg-background'
    : 'hidden md:flex md:w-64 lg:w-72 flex-col border-r bg-muted/30'

  const contentClasses = isMobile
    ? 'flex flex-col h-full'
    : 'sticky top-0 flex flex-col h-screen'

  return (
    <aside className={containerClasses}>
      <div className={contentClasses}>
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-3 px-6 py-6 border-b bg-background">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold leading-none tracking-tight">
              ExpenseFlow
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Manage your finances
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="flex flex-col gap-1.5">
            {links.map(({ name, icon: Icon, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={name}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary-foreground/40" />
                  )}
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform duration-200',
                      active
                        ? 'scale-110'
                        : 'group-hover:scale-110 group-hover:text-primary',
                    )}
                  />
                  <span className="truncate">{name}</span>
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground/60 animate-pulse" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Footer Section */}
        {!isMobile && (
          <div className="border-t bg-background px-3 py-4">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <PieChart className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Need Help?
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Check our documentation for guides
                  </p>
                  <Link
                    href="/docs"
                    className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    View Docs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
