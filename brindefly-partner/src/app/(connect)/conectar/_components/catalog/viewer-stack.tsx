'use client'

import { useEffect, useRef, useState } from 'react'
import { useBoolean, useIntersectionObserver, useTimeout } from 'usehooks-ts'

import { STEP_VIDEOS } from '@/constants/landing'
import { cn } from '@/utils/cn'
import { prefersReducedMotion } from '@/utils/prefers-reduced-motion'

type CardPosition = 'center' | 'next' | 'prev' | 'hidden'

const VIEWER_STEPS = [
  { label: 'Escolha a cor', video: STEP_VIDEOS[0] },
  { label: 'Aplique a logo', video: STEP_VIDEOS[1] },
  { label: 'Realidade aumentada', video: STEP_VIDEOS[2] },
]

// O card do centro toca; o de baixo (next) e o de cima (prev) espiam, menores
// e desfocados. O que dá a volta (hidden) passa por trás do central.
const POSITION_CLASS_NAMES: Record<CardPosition, string> = {
  center: 'z-3 cursor-default',
  next: 'z-1 translate-y-37.5 scale-64 opacity-60 blur-[3px] saturate-90 sm:translate-y-45.5 sm:scale-68',
  prev: 'z-1 -translate-y-37.5 scale-64 opacity-60 blur-[3px] saturate-90 sm:-translate-y-45.5 sm:scale-68',
  hidden: 'z-0 scale-60 opacity-0 blur-[6px]',
}

function getCardPosition(cardIndex: number, currentIndex: number) {
  const distance =
    (cardIndex - currentIndex + VIEWER_STEPS.length) % VIEWER_STEPS.length

  if (distance === 0) return 'center'

  return distance === 1 ? 'next' : 'prev'
}

/**
 * Visualizador 3D aberto pelo QR Code: galeria vertical com os 3 passos.
 * Quando o vídeo do centro termina, a galeria gira: o próximo sobe ao centro
 * e toca, o atual vai para cima e o que estava em cima dá a volta por trás e
 * reaparece embaixo. Clicar num card que espia ou num ponto do indicador vai
 * direto a ele. Só toca com a galeria na tela; com reduced-motion não há
 * autoplay.
 */
export function ViewerStack() {
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [wrappingIndex, setWrappingIndex] = useState<number | null>(null)
  const {
    value: isTurning,
    setTrue: startTurning,
    setFalse: stopTurning,
  } = useBoolean(false)
  const {
    value: isAdvancePending,
    setTrue: scheduleAdvance,
    setFalse: cancelAdvance,
  } = useBoolean(false)

  const { ref: stackRef, isIntersecting: isVisible } = useIntersectionObserver({
    threshold: 0.35,
  })

  // o card que deu a volta por trás reaparece do outro lado
  useTimeout(() => setWrappingIndex(null), wrappingIndex === null ? null : 420)
  useTimeout(stopTurning, isTurning ? 900 : null)
  useTimeout(
    () => {
      cancelAdvance()
      goTo(currentIndex + 1)
    },
    isAdvancePending ? 500 : null,
  )

  useEffect(() => {
    for (const [cardIndex, video] of videoRefs.current.entries()) {
      if (!video || cardIndex === currentIndex) continue

      video.pause()
      video.currentTime = 0
    }

    const centerVideo = videoRefs.current[currentIndex]
    if (!centerVideo) return

    if (!isVisible || prefersReducedMotion()) {
      centerVideo.pause()
      return
    }

    // O React não renderiza o atributo `muted` no HTML do servidor; sem ele o
    // navegador bloqueia o play().
    centerVideo.muted = true
    centerVideo.play().catch(() => {
      // autoplay bloqueado pelo navegador: fica no poster
    })
  }, [currentIndex, isVisible])

  function goTo(targetIndex: number) {
    const nextIndex = (targetIndex + VIEWER_STEPS.length) % VIEWER_STEPS.length
    if (nextIndex === currentIndex || isTurning) return

    const nextWrappingIndex = VIEWER_STEPS.findIndex((_, cardIndex) => {
      const from = getCardPosition(cardIndex, currentIndex)
      const to = getCardPosition(cardIndex, nextIndex)

      return (
        (from === 'prev' && to === 'next') || (from === 'next' && to === 'prev')
      )
    })

    setWrappingIndex(nextWrappingIndex === -1 ? null : nextWrappingIndex)
    setCurrentIndex(nextIndex)
    startTurning()
  }

  function handleVideoEnded(cardIndex: number) {
    if (cardIndex === currentIndex) scheduleAdvance()
  }

  return (
    <figure
      ref={stackRef}
      aria-label="Demonstração do visualizador 3D: escolher a cor, aplicar a logo e ver em realidade aumentada"
      className="relative mt-29 mb-25 h-84 w-70 rotate-2 animate-bob [--bob-delay:-2.4s] [--bob-duration:6.2s] motion-reduce:animate-none sm:absolute sm:top-28 sm:left-115 sm:my-0"
    >
      {VIEWER_STEPS.map(({ label, video }, cardIndex) => {
        const position: CardPosition =
          cardIndex === wrappingIndex
            ? 'hidden'
            : getCardPosition(cardIndex, currentIndex)

        // Só o mouse usa o card como atalho; no teclado, os pontos abaixo.
        return (
          <button
            key={label}
            type="button"
            tabIndex={-1}
            aria-label={`Mostrar: ${label}`}
            onClick={() => goTo(cardIndex)}
            className={cn(
              'absolute top-0 left-0 block w-70 rounded-[28px] bg-white px-2.5 pt-2.5 pb-3 text-left shadow-[0_30px_70px_rgba(22,39,82,.22),0_0_0_1px_rgba(0,0,0,.04)] transition-[translate,scale,opacity,filter] duration-900 ease-smooth will-change-transform motion-reduce:transition-none',
              POSITION_CLASS_NAMES[position],
            )}
          >
            <video
              ref={(element) => {
                videoRefs.current[cardIndex] = element
              }}
              src={video.src}
              poster={video.poster}
              muted
              playsInline
              preload="metadata"
              onEnded={() => handleVideoEnded(cardIndex)}
              className="block size-65 rounded-[20px] bg-[#eceef6] object-cover"
            />
            <span className="mt-2.5 inline-flex h-8.5 items-center gap-2 rounded-[20px] bg-[#f3f3fd] pr-3.5 pl-1.5 font-semibold text-[12.5px] text-brand-cobalt">
              <b className="flex size-6 items-center justify-center rounded-full bg-linear-104 from-brand-purple to-brand-blue font-bold text-[11px] text-white">
                {String(cardIndex + 1).padStart(2, '0')}
              </b>
              {label}
            </span>
          </button>
        )
      })}

      {/* indicador: o ponto do passo atual vira uma pílula */}
      <div className="absolute top-1/2 -right-5.5 z-4 flex -translate-y-1/2 flex-col gap-2.5 sm:-right-7.5">
        {VIEWER_STEPS.map(({ label }, cardIndex) => (
          <button
            key={label}
            type="button"
            aria-label={`Mostrar: ${label}`}
            aria-current={cardIndex === currentIndex ? 'true' : undefined}
            onClick={() => goTo(cardIndex)}
            className="h-2.5 w-2.5 rounded-[10px] bg-[rgba(84,74,176,.28)] transition-[height,background-color] duration-400 ease-smooth hover:bg-[rgba(84,74,176,.5)] focus-visible:outline-2 focus-visible:outline-brand-purple focus-visible:outline-offset-3 aria-current:h-7.5 aria-current:bg-linear-to-b aria-current:from-brand-purple aria-current:to-brand-blue"
          />
        ))}
      </div>
    </figure>
  )
}
