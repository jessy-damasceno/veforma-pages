'use client'

import { type ReactNode, useRef, useState } from 'react'
import { useBoolean, useTimeout } from 'usehooks-ts'

import { cn } from '@/utils/cn'

type VideoState = 'idle' | 'playing' | 'restoring'

interface HeroStageProps {
  children: ReactNode
}

// Palco do hero: moldura com o vídeo institucional + os cards de vidro
// (children). O vídeo (4,8 MB) só baixa quando a pessoa clica no play
// (preload="none"). Enquanto ele toca, os cards saem de cima da imagem: eles
// leem o data-video-state deste palco (ver GlassCard). Ao terminar, o overlay
// e os cards voltam e o vídeo reinicia no poster.
export function HeroStage({ children }: HeroStageProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  const [videoState, setVideoState] = useState<VideoState>('idle')
  const {
    value: isBuffering,
    setTrue: startBuffering,
    setFalse: stopBuffering,
  } = useBoolean(false)

  // A transição dos cards só fica ligada na volta: no resto do tempo o efeito
  // de rolagem não pode ter atraso.
  useTimeout(
    () => setVideoState('idle'),
    videoState === 'restoring' ? 700 : null,
  )

  function handlePlay() {
    const video = videoRef.current
    if (!video) return

    setVideoState('playing')

    // o indicador de carregamento só aparece se houver espera de verdade
    if (video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) startBuffering()

    video.play().catch(stopBuffering)
  }

  function handleStalled() {
    if (!videoRef.current?.paused) startBuffering()
  }

  function handleEnded() {
    if (videoRef.current) videoRef.current.currentTime = 0

    setVideoState('restoring')
  }

  const isPlaying = videoState === 'playing'

  return (
    <div
      data-video-state={videoState}
      className="group/stage relative mx-auto mt-10 w-[calc(100%-40px)] md:mt-14 md:w-[min(961px,calc(100%-64px))] xl:w-240.25 xl:max-w-full"
    >
      <div
        data-scrub="up"
        className="relative rounded-[20px] bg-white p-1.5 shadow-[0_0_24px_rgba(0,0,0,.08)] md:rounded-[30px] md:pt-2.75 md:pr-3.25 md:pb-2.75 md:pl-2.5"
      >
        <div className="relative aspect-938/527 overflow-hidden rounded-[14px] bg-[#e8ecff] md:rounded-[20px]">
          {/* biome-ignore lint/a11y/useMediaCaption: vídeo institucional ainda sem arquivo de legenda */}
          <video
            ref={videoRef}
            src="/static/landing/video/veforma.mp4"
            poster="/static/landing/01-hero/video-poster.jpg"
            preload="none"
            playsInline
            controls={isPlaying}
            onWaiting={startBuffering}
            onStalled={handleStalled}
            onPlaying={stopBuffering}
            onCanPlay={stopBuffering}
            onPause={stopBuffering}
            onError={stopBuffering}
            onEnded={handleEnded}
            className="block size-full bg-[#e8ecff] object-cover"
          />

          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute top-1/2 left-1/2 -mt-5.75 -ml-5.75 size-11.5 rounded-full border-3 border-[rgba(26,145,255,.22)] border-t-brand-sky opacity-0 transition-opacity duration-250',
              isBuffering &&
                'animate-[spin_.8s_linear_infinite] opacity-100 motion-reduce:animate-[spin_2s_linear_infinite]',
            )}
          />

          <button
            type="button"
            aria-label="Assistir ao vídeo: Conheça a Veforma"
            onClick={handlePlay}
            className={cn(
              'group/play absolute inset-0 text-black transition-[opacity,visibility] duration-350 focus-visible:rounded-[20px] focus-visible:outline-3 focus-visible:outline-brand-purple focus-visible:-outline-offset-3',
              isPlaying && 'pointer-events-none invisible opacity-0',
            )}
          >
            {/* disco + 3 anéis que "respiram" em onda, de dentro para fora.
                Caixa de 227,3px igual ao grupo do Figma. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-[calc(50%-127.5px)] left-[calc(50%-111px)] size-[227.3px] scale-[.572] md:scale-100"
            >
              <span className="-translate-1/2 absolute top-1/2 left-1/2 size-[127.9px] animate-ring-pulse rounded-full border-[1.83px] border-brand-sky opacity-40 [--ring-delay:0s] [--ring-opacity-low:.14] [--ring-opacity-peak:.95] [--ring-scale:1.045] motion-reduce:animate-none" />
              <span className="-translate-1/2 absolute top-1/2 left-1/2 size-44 animate-ring-pulse rounded-full border-[1.37px] border-brand-sky opacity-20 [--ring-delay:.35s] [--ring-opacity-low:.06] [--ring-opacity-peak:.7] [--ring-scale:1.05] motion-reduce:animate-none" />
              <span className="-translate-1/2 absolute top-1/2 left-1/2 size-[226.4px] animate-ring-pulse rounded-full border-[.91px] border-brand-sky opacity-10 [--ring-delay:.7s] [--ring-opacity-low:.03] [--ring-opacity-peak:.5] [--ring-scale:1.055] motion-reduce:animate-none" />
              <span className="absolute top-1/2 left-1/2 mt-[-43.9px] ml-[-43.9px] size-[87.8px] animate-disc-glow rounded-full bg-[rgba(26,145,255,.7)] shadow-[0_25.6px_47.5px_rgba(51,182,255,.5)] transition-[scale] duration-400 ease-smooth group-hover/play:scale-108 motion-reduce:animate-none" />
              <svg
                viewBox="104 98 26 31"
                width="26"
                height="31"
                aria-hidden="true"
                className="absolute top-24.5 left-26 origin-[9.6px_15.6px] transition-[scale] duration-400 ease-smooth group-hover/play:scale-108"
              >
                <path
                  d="M127.276 116.977L109.384 127.57C107.111 128.918 104.212 127.253 104.212 124.585V102.686C104.212 100.018 107.085 98.3535 109.384 99.7007L127.276 110.294C129.783 111.8 129.783 115.472 127.276 116.977Z"
                  fill="#fff"
                />
              </svg>
            </span>

            <span className="absolute inset-x-0 top-[calc(50%+54px)] font-semibold text-[13px] leading-4.25 md:top-[calc(50%+94.5px)] md:text-base">
              Conheça a Veforma
            </span>
          </button>
        </div>
      </div>

      {children}
    </div>
  )
}
