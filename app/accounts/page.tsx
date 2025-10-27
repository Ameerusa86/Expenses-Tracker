import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { getUserId } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default async function AccountsPage() {
  await dbConnect()
  const userId = await getUserId()

  const accounts = await Account.find({ userId }).sort({ name: 1 }).lean()
  const serializedAccounts = JSON.parse(JSON.stringify(accounts))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your financial accounts
          </p>
        </div>
        <Link href="/accounts/new">
          <Button>Add Account</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {serializedAccounts.length === 0 ? (
          <Card className="col-span-full p-8 text-center">
            <p className="text-muted-foreground">
              No accounts yet. Click &quot;Add Account&quot; to get started.
            </p>
          </Card>
        ) : (
          serializedAccounts.map(
            (account: {
              _id: string
              name: string
              type: string
              institution?: string
              currency: string
            }) => (
              <Card key={account._id} className="p-6">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{account.name}</h3>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {account.type}
                    </span>
                  </div>
                  {account.institution && (
                    <p className="text-sm text-muted-foreground">
                      {account.institution}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-muted-foreground">
                      {account.currency}
                    </span>
                    <Link href={`/accounts/${account._id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ),
          )
        )}
      </div>
    </div>
  )
}
