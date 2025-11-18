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
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Transactions', icon: Receipt, href: '/transactions' },
  { name: 'Accounts', icon: Wallet, href: '/accounts' },
  { name: 'Credit & Loans', icon: Wallet, href: '/credit-loans' },
  { name: 'Planner', icon: TrendingUp, href: '/planner' },
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
    if (href === '/' || href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const containerClasses = isMobile
    ? 'flex w-full flex-col bg-sidebar'
    : 'hidden md:flex md:w-[260px] lg:w-[280px] flex-col border-r border-sidebar-border bg-sidebar'

  const contentClasses = isMobile
    ? 'flex h-full flex-col'
    : 'sticky top-0 flex h-screen flex-col px-3 pb-6 pt-8'

  return (
    <aside className={containerClasses}>
      <div className={contentClasses}>
        <Link href="/" className="flex items-center gap-3 px-5 py-4">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-foreground/15 text-sidebar-foreground">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-sidebar-foreground">
              ExpenseFlow
            </h1>
            <p className="text-xs text-sidebar-foreground/70">Overview</p>
          </div>
        </Link>

        <nav className="mt-6 flex-1 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            {links.map(({ name, icon: Icon, href }) => {
              const active = isActive(href)
              return (
                <Link
                  key={name}
                  href={href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-none px-5 py-3 text-sm font-medium transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-0 h-full w-[3px] rounded-r bg-sidebar-primary" />
                  )}
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0',
                      active
                        ? 'text-sidebar-primary'
                        : 'group-hover:text-sidebar-primary',
                    )}
                  />
                  <span className="truncate">{name}</span>
                  {active && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-sidebar-primary" />
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {!isMobile && (
          <div className="mt-6 rounded-xl border border-sidebar-border bg-sidebar-accent/30 p-4">
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
