import Image from 'next/image'
import type { ComponentProps } from 'react'

import { cn } from '@/utils/cn'

interface SectionBadgeProps extends ComponentProps<'span'> {
  variant?: 'indigo' | 'blue'
}

// Selo das seções. Gradiente do Figma: roxo → índigo (padrão) ou roxo → azul.
// O ícone é mais estreito que o texto, por isso o respiro esquerdo é menor.
export function SectionBadge({
  variant = 'indigo',
  className,
  children,
  ...props
}: SectionBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-9.5 items-center gap-2.75 whitespace-nowrap rounded-[36px] pr-6.5 pl-4.5 font-semibold text-sm text-white tracking-[-0.14px]',
        variant === 'blue'
          ? 'bg-brand-gradient'
          : 'bg-[linear-gradient(102deg,var(--color-brand-purple)_28.74%,var(--color-brand-indigo)_97.29%)]',
        className,
      )}
      {...props}
    >
      <Image
        src="/static/landing/shared/badge-spark.svg"
        alt=""
        width={13}
        height={18}
        className="h-auto w-3.25"
      />
      {children}
    </span>
  )
}
