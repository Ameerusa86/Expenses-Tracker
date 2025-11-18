'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { PanelTopClose, PanelTopOpen } from 'lucide-react'

export function DensityToggle() {
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('density') : null
    const isCompact = stored === 'compact'
    setCompact(isCompact)
    if (isCompact) {
      document.documentElement.classList.add('density-compact')
    } else {
      document.documentElement.classList.remove('density-compact')
    }
  }, [])

  function toggle() {
    const next = !compact
    setCompact(next)
    if (next) {
      document.documentElement.classList.add('density-compact')
      localStorage.setItem('density', 'compact')
    } else {
      document.documentElement.classList.remove('density-compact')
      localStorage.setItem('density', 'cozy')
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={
        compact ? 'Switch to Cozy density' : 'Switch to Compact density'
      }
      title={compact ? 'Cozy density' : 'Compact density'}
      onClick={toggle}
    >
      {compact ? (
        <PanelTopOpen className="h-5 w-5" />
      ) : (
        <PanelTopClose className="h-5 w-5" />
      )}
    </Button>
  )
}
