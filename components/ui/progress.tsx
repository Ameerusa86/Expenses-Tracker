'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

interface ProgressProps
  extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  showValue?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(
  (
    { className, value, variant = 'default', showValue = false, ...props },
    ref,
  ) => {
    const variantClasses = {
      default: 'bg-primary',
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      destructive: 'bg-rose-500',
    }

    return (
      <div className="space-y-1.5">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-2 w-full overflow-hidden rounded-full bg-muted',
            className,
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full w-full flex-1 transition-all duration-300 ease-in-out',
              variantClasses[variant],
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValue && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(value || 0)}%</span>
          </div>
        )}
      </div>
    )
  },
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
