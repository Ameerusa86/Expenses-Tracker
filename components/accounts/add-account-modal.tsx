'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { createAccount } from '@/app/actions/accounts'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import {
  Plus,
  Loader2,
  Wallet,
  CreditCard,
  TrendingUp,
  Banknote,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react'

const accountTypes = [
  {
    value: 'cash',
    label: 'Cash',
    icon: Banknote,
    description: 'Physical money',
    color: 'from-green-500 to-emerald-600',
  },
  {
    value: 'bank',
    label: 'Bank Account',
    icon: Wallet,
    description: 'Checking or Savings',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    value: 'credit',
    label: 'Credit Card',
    icon: CreditCard,
    description: 'Credit line',
    color: 'from-purple-500 to-pink-600',
  },
  {
    value: 'investment',
    label: 'Investment',
    icon: TrendingUp,
    description: 'Stocks & Bonds',
    color: 'from-orange-500 to-red-600',
  },
]

const currencies = [
  { value: 'USD', label: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { value: 'EUR', label: 'Euro', symbol: '€', flag: '🇪🇺' },
  { value: 'GBP', label: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { value: 'JPY', label: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { value: 'SAR', label: 'Saudi Riyal', symbol: 'SR', flag: '🇸🇦' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { value: 'EGP', label: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
]

export function AddAccountModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('bank')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set('type', selectedType)

    setIsSubmitting(true)
    try {
      await createAccount({
        name: String(formData.get('name')),
        type: selectedType as 'cash' | 'bank' | 'credit' | 'investment',
        institution: String(formData.get('institution') || ''),
        currency: String(formData.get('currency') || 'USD'),
      })
      toast.success('🎉 Account created successfully!')
      setIsOpen(false)
      router.refresh()
      // Reset form
      setSelectedType('bank')
    } catch (error) {
      toast.error('❌ Failed to create account')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden border bg-background shadow-sm">
        {/* Animated Header with gradient */}
        <div className="relative border-b bg-muted/40 px-6 py-6 sm:px-8">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-foreground/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/15 blur-2xl" />

          <DialogHeader className="relative space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <DialogTitle className="text-3xl font-bold text-primary-foreground">
              Create New Account
            </DialogTitle>
            <p className="text-primary-foreground/85 text-base">
              Set up your financial account in just a few steps
            </p>
          </DialogHeader>
        </div>

        {/* Form content with enhanced styling */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7 bg-surface p-6 sm:p-8"
        >
          {/* Account Name with icon */}
          <div className="space-y-3">
            <Label
              htmlFor="name"
              className="text-base font-semibold flex items-center gap-2"
            >
              Account Name
              <span className="text-xs text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g., Main Checking, Emergency Fund"
                className="h-12 pl-4 text-base"
              />
            </div>
          </div>

          {/* Account Type - Enhanced Visual Cards */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              Account Type
              <span className="text-xs text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {accountTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`relative flex flex-col items-start gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    {/* Check indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}

                    {/* Icon with gradient */}
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isSelected ? `border bg-background` : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSelected ? 'text-white' : ''}`}
                      />
                    </div>

                    <div className="text-left">
                      <div className="text-sm font-semibold">{type.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {type.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Institution with icon */}
          <div className="space-y-3">
            <Label
              htmlFor="institution"
              className="text-base font-semibold flex items-center gap-2"
            >
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Institution
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (Optional)
              </span>
            </Label>
            <Input
              id="institution"
              name="institution"
              placeholder="e.g., Chase, Bank of America, Wells Fargo"
              className="h-12 text-base"
            />
          </div>

          {/* Currency with enhanced select */}
          <div className="space-y-3">
            <Label
              htmlFor="currency"
              className="text-base font-semibold flex items-center gap-2"
            >
              Currency
              <span className="text-xs text-destructive">*</span>
            </Label>
            <select
              id="currency"
              name="currency"
              defaultValue="USD"
              className="flex h-12 w-full rounded-lg border-2 border-input bg-background px-4 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              required
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.flag} {currency.symbol} {currency.value} —{' '}
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons - Enhanced */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 gap-2 text-base font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
