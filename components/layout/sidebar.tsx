'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
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
    ? 'flex w-full flex-col bg-background/95'
    : 'hidden md:flex md:w-[260px] lg:w-[280px] flex-col border-r border-border/60 bg-surface/88 backdrop-blur-2xl dark:border-border/60 dark:bg-surface/65'

  const contentClasses = isMobile
    ? 'flex h-full flex-col'
    : 'sticky top-0 flex h-screen flex-col px-3 pb-6 pt-8'

  return (
    <aside className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/90 px-5 py-4 shadow-soft backdrop-blur-lg dark:border-border/60 dark:bg-surface/65">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/75 text-primary-foreground shadow-glow">
            <TrendingUp className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(255,255,255,0.85)] dark:shadow-[0_0_0_3px_rgba(15,23,42,0.85)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              ExpenseFlow
            </h1>
            <p className="text-xs text-muted-foreground">
              Command your cashflow
            </p>
          </div>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            {links.map(({ name, icon: Icon, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={name}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-surface/75 hover:text-foreground dark:hover:bg-surface/60',
                  )}
                >
                  {active && (
                    <div className="absolute -left-2 h-10 w-10 rounded-full bg-primary/30 blur-xl" />
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
                    <div className="ml-auto h-2 w-2 rounded-full bg-primary-foreground/80" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {!isMobile && (
          <div className="mt-6 rounded-2xl border border-border/60 bg-surface/88 p-4 shadow-inner dark:border-border/60 dark:bg-surface/60">
            {/* <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <PieChart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Need help?
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Browse our guides and best practices
                </p>
                <Link
                  href="/docs"
                  className="mt-3 inline-flex text-xs font-medium text-primary hover:underline"
                >
                  View docs
                </Link>
              </div>
            </div> */}
          </div>
        )}
      </div>
    </aside>
  )
}
