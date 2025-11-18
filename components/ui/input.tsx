import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-10 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm transition-colors outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:px-3 file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
