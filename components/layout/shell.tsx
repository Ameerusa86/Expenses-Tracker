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
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-[1600px] 2xl:max-w-[1800px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
