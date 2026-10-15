'use client'

import { type ComponentProps, useEffect, useRef } from 'react'

import { prefersReducedMotion } from '@/utils/prefers-reduced-motion'

// Microvídeo mudo em loop que só toca enquanto está na tela (economiza CPU e
// bateria). Com prefers-reduced-motion fica parado no poster.
export function AutoplayVideo(props: ComponentProps<'video'>) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion()) return

    // O React não renderiza o atributo `muted` no HTML do servidor; sem ele o
    // navegador bloqueia o play().
    video.muted = true

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          video.pause()
          return
        }

        video.play().catch(() => {
          // autoplay bloqueado pelo navegador: fica no poster
        })
      },
      { threshold: 0.25 },
    )

    observer.observe(video)

    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      preload="metadata"
      {...props}
    />
  )
}
