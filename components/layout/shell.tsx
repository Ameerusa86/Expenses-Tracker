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
    <div className="relative flex min-h-screen flex-col bg-background md:flex-row">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Decorative overlay removed for flat design */}
        <div className="absolute right-[-12%] top-[32%] h-72 w-72 rounded-full bg-accent/22 blur-3xl" />
        <div className="absolute left-[-14%] bottom-[12%] h-80 w-80 rounded-full bg-secondary/18 blur-[110px]" />
      </div>
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-6 sm:px-6 lg:px-10">
            <div className="rounded-xl border bg-background p-4 sm:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
