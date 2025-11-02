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
    ? 'flex h-full w-full flex-col bg-gradient-to-b from-background via-background/95 to-background/90 text-foreground'
    : 'hidden md:flex md:w-[260px] lg:w-[280px] flex-col border-r border-black/5 bg-white/90 backdrop-blur-xl dark:border-white/5 dark:bg-[#080d18]/85'

  const contentClasses = isMobile
    ? 'flex h-full flex-col overflow-y-auto px-5 pb-10 pt-8'
    : 'sticky top-0 flex h-screen flex-col px-3 pb-6 pt-8'

  return (
    <aside className={containerClasses}>
      <div className={contentClasses}>
        <div className="flex items-center gap-3 rounded-2xl border border-black/5 bg-white/95 px-5 py-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-[#0f1424]/85">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-glow">
            <TrendingUp className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_3px] shadow-white/80 dark:shadow-[#05070c]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
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
                      : 'text-muted-foreground hover:bg-white/95 hover:text-foreground dark:text-muted-foreground dark:hover:bg-[#111833] dark:hover:text-foreground',
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
                    <div className="ml-auto h-2 w-2 rounded-full bg-white/90" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {!isMobile && (
          <div className="mt-6 rounded-2xl border border-black/5 bg-gradient-to-br from-white/95 to-white/80 p-4 shadow-inner dark:border-white/10 dark:from-[#0f1424]/80 dark:to-[#101831]/70">
            <div className="flex items-start gap-3">
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
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
