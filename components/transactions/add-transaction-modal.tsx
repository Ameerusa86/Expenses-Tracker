'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TransactionForm } from './transaction-form'
import { Button } from '../ui/button'
import { Plus, Receipt } from 'lucide-react'

interface Account {
  _id: string
  name: string
  type: string
}

interface Category {
  _id: string
  name: string
  type: string
}

interface AddTransactionModalProps {
  accounts: Account[]
  categories: Category[]
}

export function AddTransactionModal({
  accounts,
  categories,
}: AddTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-md hover:shadow-lg transition-all">
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border border-border/60 bg-surface/95 shadow-elevated">
        {/* Animated Header with gradient */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/90 px-6 py-10 sm:px-8 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary-foreground/15 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-primary-foreground/15 blur-2xl" />

          <DialogHeader className="relative space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-foreground/20 backdrop-blur-sm ring-4 ring-primary-foreground/30">
              <Receipt className="h-7 w-7 text-primary-foreground" />
            </div>
            <DialogTitle className="text-3xl font-bold text-primary-foreground">
              Add Transaction
            </DialogTitle>
            <p className="text-primary-foreground/85 text-base">
              Record a new transaction for your accounts
            </p>
          </DialogHeader>
        </div>

        {/* Form content */}
        <div className="bg-surface p-6 sm:p-8">
          <TransactionForm
            accounts={accounts}
            categories={categories}
            onSuccess={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
