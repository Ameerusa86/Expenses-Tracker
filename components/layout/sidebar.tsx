'use client'

import Link from 'next/link'
import {
  Home,
  PieChart,
  Settings,
  Receipt,
  Briefcase,
  Tags,
} from 'lucide-react'

const links = [
  { name: 'Dashboard', icon: Home, href: '/dashboard' },
  { name: 'Transactions', icon: Receipt, href: '/transactions' },
  { name: 'Accounts', icon: Briefcase, href: '/accounts' },
  { name: 'Categories', icon: Tags, href: '/categories' },
  { name: 'Reports', icon: PieChart, href: '/reports' },
  { name: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 flex-col border-r bg-background p-4">
      <h1 className="mb-4 text-xl font-bold">Expense Tracker</h1>
      <nav className="flex flex-col gap-2">
        {links.map(({ name, icon: Icon, href }) => (
          <Link
            key={name}
            href={href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
          >
            <Icon className="h-4 w-4" />
            {name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
