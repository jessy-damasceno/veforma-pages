import Image from 'next/image'

import { cn } from '@/utils/cn'

import { ConnectionLine } from './connection-line'

interface BrandLockupProps {
  className?: string
}

// Lockup b ---(+)--- Veforma, com as posições em px do Figma (o lockup é 10px
// mais à esquerda do eixo da página). A legenda logo abaixo já diz
// "Brindefly + Veforma 3D", então o desenho fica fora da árvore de
// acessibilidade.
export function BrandLockup({ className }: BrandLockupProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'zoom-[.76] xs:zoom-[.85] md:zoom-[1] relative -left-1.5 xs:-left-2 mx-auto mt-4.75 h-18.25 w-103.5 md:-left-2.5',
        className,
      )}
    >
      <Image
        src="/static/landing/01-hero/logo-b.svg"
        alt=""
        width={41}
        height={63}
        loading="eager"
        className="absolute top-0 left-0 h-[62.5px] w-10.25"
      />

      <ConnectionLine className="absolute top-10.5 left-[66.5px] h-[2.4px] w-[272.9px] overflow-visible" />

      <Image
        src="/static/landing/01-hero/lockup-circle.svg"
        alt=""
        width={65}
        height={65}
        loading="eager"
        className="absolute top-2 left-42.5 size-16.25"
      />
      <span className="absolute top-2 left-42.5 flex size-16.25 items-center justify-center pb-0.75 font-normal font-red-hat text-[40px] text-black leading-none tracking-[-1.2px]">
        +
      </span>

      <Image
        src="/static/landing/01-hero/veforma-symbol.svg"
        alt=""
        width={53}
        height={53}
        loading="eager"
        className="absolute top-2.25 left-90.25 size-13.25"
      />
    </div>
  )
}
