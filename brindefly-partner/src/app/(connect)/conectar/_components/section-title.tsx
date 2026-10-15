import type { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

// Título centralizado das seções (Como funciona, Integração, Planos, CTA final).
export function SectionTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <h2
      className={cn(
        'mx-auto mt-4 max-w-205.75 font-bold text-[32px] text-foreground leading-none tracking-[-0.8px] sm:px-4 sm:text-[40px] sm:tracking-[-1px] lg:px-0 lg:text-5xl lg:leading-[47.8px] lg:tracking-[-1.2px]',
        className,
      )}
      {...props}
    />
  )
}
