import { dbConnect } from '@/lib/db'
import { Account } from '@/models/Account'
import { getUserId } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { updateAccount } from '@/app/actions/accounts'
import { DeleteAccountButton } from '@/components/accounts/delete-account-button'

export default async function EditAccountPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await dbConnect()
  const userId = await getUserId()

  const account = await Account.findOne({ _id: id, userId }).lean()
  if (!account) {
    notFound()
  }

  async function updateAction(formData: FormData) {
    'use server'
    const input = {
      name: String(formData.get('name') || ''),
      type: String(formData.get('type') || 'bank') as
        | 'cash'
        | 'bank'
        | 'credit'
        | 'investment',
      institution: String(formData.get('institution') || ''),
      currency: String(formData.get('currency') || 'USD'),
    }
    await updateAccount(id, input)
    redirect('/accounts')
  }

  const typed = account as unknown as {
    _id: string
    name: string
    type: 'cash' | 'bank' | 'credit' | 'investment'
    institution?: string
    currency: string
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">Edit Account</h1>
        <p className="text-muted-foreground">
          Update account details or delete this account.
        </p>
      </div>

      <Card className="p-6">
        <form action={updateAction} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account name</Label>
            <Input id="name" name="name" defaultValue={typed.name} required />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Account type</Label>
            <select
              id="type"
              name="type"
              defaultValue={typed.type}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="credit">Credit</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input
              id="institution"
              name="institution"
              defaultValue={typed.institution || ''}
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              defaultValue={typed.currency || 'USD'}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="JPY">JPY — Japanese Yen</option>
              <option value="CAD">CAD — Canadian Dollar</option>
              <option value="AUD">AUD — Australian Dollar</option>
              <option value="INR">INR — Indian Rupee</option>
              <option value="SAR">SAR — Saudi Riyal</option>
              <option value="AED">UAE Dirham</option>
              <option value="EGP">Egyptian Pound</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" className="flex-1">
              Save changes
            </Button>
            <Link href="/accounts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <DeleteAccountButton accountId={id} />
        </div>
      </Card>
    </div>
  )
}
