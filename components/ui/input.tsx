import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-background/70 border border-white/60 h-11 w-full min-w-0 rounded-xl bg-white/80 px-4 text-sm shadow-soft transition-[color,box-shadow] outline-none file:inline-flex file:h-8 file:border-0 file:bg-transparent file:px-3 file:text-xs file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60',
        'focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
