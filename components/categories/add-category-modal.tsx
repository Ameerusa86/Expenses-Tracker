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
import { createCategory } from '@/app/actions/categories'
import { useRouter } from 'next/navigation'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import {
  Plus,
  Loader2,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Check,
  Sparkles,
} from 'lucide-react'

const categoryTypes = [
  {
    value: 'income',
    label: 'Income',
    icon: TrendingUp,
    description: 'Money received',
    color: 'from-green-500 to-emerald-600',
  },
  {
    value: 'expense',
    label: 'Expense',
    icon: TrendingDown,
    description: 'Money spent',
    color: 'from-red-500 to-rose-600',
  },
  {
    value: 'transfer',
    label: 'Transfer',
    icon: ArrowLeftRight,
    description: 'Between accounts',
    color: 'from-blue-500 to-cyan-600',
  },
]

export function AddCategoryModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedType, setSelectedType] = useState('expense')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    setIsSubmitting(true)
    try {
      await createCategory({
        name: String(formData.get('name')),
        type: selectedType as 'expense' | 'income' | 'transfer',
        icon: String(formData.get('icon') || ''),
        color: String(formData.get('color') || ''),
      })
      toast.success('🎉 Category created successfully!')
      setIsOpen(false)
      router.refresh()
      // Reset form
      setSelectedType('expense')
    } catch (error) {
      toast.error('❌ Failed to create category')
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
          <span>Add Category</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border bg-background shadow-sm">
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
              Create New Category
            </DialogTitle>
            <p className="text-primary-foreground/85 text-base">
              Organize your transactions with custom categories
            </p>
          </DialogHeader>
        </div>

        {/* Form content with enhanced styling */}
        <form
          onSubmit={handleSubmit}
          className="space-y-7 bg-surface p-6 sm:p-8"
        >
          {/* Category Name */}
          <div className="space-y-3">
            <Label
              htmlFor="name"
              className="text-base font-semibold flex items-center gap-2"
            >
              Category Name
              <span className="text-xs text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Groceries, Salary, Rent"
              className="h-12 text-base"
            />
          </div>

          {/* Category Type - Enhanced Visual Cards */}
          <div className="space-y-3">
            <Label className="text-base font-semibold flex items-center gap-2">
              Category Type
              <span className="text-xs text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {categoryTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.value
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedType(type.value)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                        : 'border-border hover:border-primary/40 hover:bg-muted/50'
                    }`}
                  >
                    {/* Check indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}

                    {/* Icon with gradient */}
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        isSelected ? `border bg-background` : 'bg-muted'
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSelected ? 'text-white' : ''}`}
                      />
                    </div>

                    <div className="text-center">
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

          {/* Icon */}
          <div className="space-y-3">
            <Label
              htmlFor="icon"
              className="text-base font-semibold flex items-center gap-2"
            >
              Icon
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (Optional)
              </span>
            </Label>
            <Input
              id="icon"
              name="icon"
              placeholder="e.g., 🍔, 💰, 🏠, 🚗"
              maxLength={2}
              className="h-12 text-2xl"
            />
            <p className="text-xs text-muted-foreground">
              Use any emoji to represent this category
            </p>
          </div>

          {/* Color */}
          <div className="space-y-3">
            <Label
              htmlFor="color"
              className="text-base font-semibold flex items-center gap-2"
            >
              Color
              <span className="text-xs text-muted-foreground font-normal ml-1">
                (Optional)
              </span>
            </Label>
            <div className="flex gap-3">
              <Input
                id="color"
                name="color"
                type="color"
                className="h-12 w-20 cursor-pointer"
                defaultValue="#000000"
              />
              <div className="flex-1 flex items-center text-sm text-muted-foreground">
                Choose a color to identify this category
              </div>
            </div>
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
                  Create Category
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
