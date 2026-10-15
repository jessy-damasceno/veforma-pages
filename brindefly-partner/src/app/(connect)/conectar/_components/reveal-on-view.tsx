'use client'

import type { ComponentProps } from 'react'
import { useIntersectionObserver } from 'usehooks-ts'

import { cn } from '@/utils/cn'

// Revela o bloco inteiro, uma única vez, quando ele entra na tela. Usado no fim
// da página, onde o efeito de rolagem por elemento ([data-scrub]) não completa
// por falta de página para rolar.
export function RevealOnView({ className, ...props }: ComponentProps<'div'>) {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.2,
    freezeOnceVisible: true,
  })

  return (
    <div
      ref={ref}
      data-visible={isIntersecting}
      className={cn(
        'translate-y-10 opacity-0 transition-[opacity,translate] duration-800 ease-smooth data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none',
        className,
      )}
      {...props}
    />
  )
}
