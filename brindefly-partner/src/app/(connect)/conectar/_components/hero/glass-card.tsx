import type { ReactNode } from 'react'

import { cn } from '@/utils/cn'

interface GlassCardProps {
  side: 'left' | 'right'
  className?: string
  children: ReactNode
}

// Card de vidro flutuante do palco do hero (só a partir do md). Entra com o
// efeito de rolagem vindo do próprio lado e, com o vídeo tocando, sai de cima
// da imagem (data-video-state do HeroStage). A flutuação usa translate/rotate,
// que se somam ao `transform` da rolagem e da saída sem brigar.
export function GlassCard({ side, className, children }: GlassCardProps) {
  return (
    <div
      data-scrub={side}
      className={cn(
        'absolute hidden animate-float rounded-[13.13px] bg-white/70 text-left shadow-[-12.18px_36.69px_44.9px_rgba(81,78,120,.18),inset_1.31px_1.97px_0_rgba(255,255,255,.6)] backdrop-blur-sm transition-[opacity,transform,visibility] duration-450 ease-smooth [--scrub-distance-x:60px] group-data-[video-state=playing]/stage:pointer-events-none group-data-[video-state=playing]/stage:invisible group-data-[video-state=playing]/stage:opacity-0 group-data-[video-state=idle]/stage:transition-none motion-reduce:animate-none md:block',
        side === 'left'
          ? 'group-data-[video-state=playing]/stage:transform-[translateX(-28px)]'
          : 'group-data-[video-state=playing]/stage:transform-[translateX(28px)]',
        className,
      )}
    >
      {children}
    </div>
  )
}
