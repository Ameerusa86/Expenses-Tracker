import { Navbar } from './navbar'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { Sidebar } from './sidebar'

export async function Shell({ children }: { children: React.ReactNode }) {
  type UserLite = {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  const session = (await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  })) as { user?: UserLite | null } | null
  const user = session?.user ?? null
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
