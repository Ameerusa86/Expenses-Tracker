import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export default async function DashboardPage() {
  const session = (await auth.api.getSession({
    headers: await headers(),
    asResponse: false,
  })) as {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    } | null
  } | null
  const name = session?.user?.name ?? session?.user?.email ?? 'there'
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Welcome back, {name} 👋</h1>
      <p className="text-muted-foreground">
        Track your expenses and see insights here.
      </p>
    </div>
  )
}
