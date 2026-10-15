import type { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

// Subtítulo que acompanha o SectionTitle.
export function SectionSubtitle({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'mx-auto mt-4.5 text-[#080808] text-[15px] leading-normal tracking-[-0.16px] sm:text-base sm:leading-5.75',
        className,
      )}
      {...props}
    />
  )
}
