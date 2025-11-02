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
    <div className="relative flex min-h-screen flex-col bg-background/70 md:flex-row">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-2xl" />
        <div className="absolute right-[-10%] top-[35%] h-64 w-64 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute left-[-10%] bottom-[15%] h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
      </div>
      <Sidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-6 sm:px-6 lg:px-10">
            <div className="rounded-3xl border border-white/40 bg-white/70 p-4 shadow-soft backdrop-blur dark:border-white/10 dark:bg-background/70 sm:p-6 dark:shadow-none">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
