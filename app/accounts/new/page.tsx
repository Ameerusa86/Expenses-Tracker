import { createAccount } from '@/app/actions/accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default function NewAccountPage() {
  async function action(formData: FormData) {
    'use server'
    await createAccount({
      name: String(formData.get('name')),
      type: String(formData.get('type')) as
        | 'cash'
        | 'bank'
        | 'credit'
        | 'investment',
      institution: String(formData.get('institution') || ''),
      currency: String(formData.get('currency') || 'USD'),
    })
    redirect('/accounts')
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold">New Account</h1>
        <p className="text-muted-foreground">
          Add a bank, cash, credit, or investment account to start tracking
          transactions.
        </p>
      </div>

      <Card className="p-6">
        <form action={action} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Account name</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Checking, Cash Wallet"
            />
            <p className="text-sm text-muted-foreground">
              A short, descriptive name for this account.
            </p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Account type</Label>
            <select
              id="type"
              name="type"
              defaultValue="bank"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="credit">Credit</option>
              <option value="investment">Investment</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Choose the type that best matches this account.
            </p>
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institution (optional)</Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g., Chase, Bank of America"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <select
              id="currency"
              name="currency"
              defaultValue="USD"
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
              <option value="AED">AED — UAE Dirham</option>
              <option value="EGP">EGP — Egyptian Pound</option>
            </select>
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Create account
            </Button>
            <a href="/accounts">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </a>
          </div>
        </form>
      </Card>
    </div>
  )
}
