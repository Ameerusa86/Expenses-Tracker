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
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        {/* Animated Header with gradient */}
        <div className="relative bg-linear-to-br from-primary via-primary to-primary/90 px-6 sm:px-8 py-10 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <DialogHeader className="relative space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm ring-4 ring-white/30">
              <Receipt className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-3xl font-bold text-white">
              Add Transaction
            </DialogTitle>
            <p className="text-white/90 text-base">
              Record a new transaction for your accounts
            </p>
          </DialogHeader>
        </div>

        {/* Form content */}
        <div className="p-6 sm:p-8 bg-background">
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
