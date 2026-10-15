'use client'

import { useEffect } from 'react'

import { prefersReducedMotion } from '@/utils/prefers-reduced-motion'

// Fração da rolagem que cada item de uma sequência (data-scrub-seq) leva para
// entrar por completo.
const SEQUENCE_WINDOW = 0.55

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1)

/**
 * Efeito de rolagem da landing: escreve --scrub-progress (0 → 1) em cada
 * [data-scrub] conforme ele cruza a tela (o CSS em globals.css converte em
 * opacidade + deslocamento). Descendo, o efeito avança; subindo, reverte.
 *
 * - data-scrub-seq: itens irmãos entram em cascata. O atraso é calculado pelo
 *   maior seq do grupo (mesmo elemento pai) para o último item sempre terminar.
 * - Descendo, o progresso nunca recua (fica no pico já visto), então nada
 *   pisca. Quem já nasce visível entra com pico 1, mas só depois do load e das
 *   fontes: antes disso a página ainda está "curta" e a conta sai errada.
 * - Elementos montados depois (hot reload no dev, item de lista que remonta
 *   quando a `key` muda) entram no motor pelo MutationObserver; sem isso
 *   ficariam presos em --scrub-progress: 0, invisíveis.
 */
export function ScrollScrub() {
  useEffect(() => {
    let elements: HTMLElement[] = []
    const maxSequenceByGroup = new Map<HTMLElement | null, number>()

    function collectElements() {
      elements = Array.from(
        document.querySelectorAll<HTMLElement>('[data-scrub]'),
      )

      maxSequenceByGroup.clear()
      for (const element of elements) {
        if (element.dataset.scrubSeq === undefined) continue

        const group = element.parentElement
        const sequence = Number(element.dataset.scrubSeq) || 0
        maxSequenceByGroup.set(
          group,
          Math.max(maxSequenceByGroup.get(group) ?? 0, sequence),
        )
      }
    }

    function setProgress(element: HTMLElement, progress: number) {
      element.style.setProperty('--scrub-progress', progress.toFixed(4))
    }

    collectElements()

    // Com reduced-motion o CSS já mostra tudo, inclusive o que montar depois.
    if (prefersReducedMotion()) {
      for (const element of elements) setProgress(element, 1)
      return
    }

    const peaks = new WeakMap<HTMLElement, number>()
    let lastScrollY = window.scrollY
    let frameId = 0
    let isDisposed = false

    function getProgress(element: HTMLElement, viewportHeight: number) {
      const rect = element.getBoundingClientRect()
      const middle = rect.top + rect.height / 2
      // 0 com o centro do elemento no rodapé da tela; 1 quando ele sobe a 45%
      const start = viewportHeight
      const end = viewportHeight * 0.45
      const raw = clamp01((start - middle) / (start - end))

      if (element.dataset.scrubSeq === undefined) return raw

      const sequence = Number(element.dataset.scrubSeq) || 0
      const maxSequence = maxSequenceByGroup.get(element.parentElement) ?? 0
      const stagger = maxSequence > 0 ? (1 - SEQUENCE_WINDOW) / maxSequence : 0

      return clamp01((raw - sequence * stagger) / SEQUENCE_WINDOW)
    }

    function update() {
      frameId = 0

      const viewportHeight = window.innerHeight
      const isScrollingDown = window.scrollY >= lastScrollY

      for (const element of elements) {
        const progress = easeOutCubic(getProgress(element, viewportHeight))
        const displayed = isScrollingDown
          ? Math.max(peaks.get(element) ?? 0, progress)
          : progress

        peaks.set(element, displayed)
        setProgress(element, displayed)
      }

      lastScrollY = window.scrollY
    }

    function scheduleUpdate() {
      if (!frameId) frameId = requestAnimationFrame(update)
    }

    function revealInitiallyVisible() {
      if (isDisposed) return

      const viewportHeight = window.innerHeight
      for (const element of elements) {
        if (element.getBoundingClientRect().top >= viewportHeight) continue

        peaks.set(element, 1)
        setProgress(element, 1)
      }

      update()
    }

    function handleLoad() {
      document.fonts.ready.then(revealInitiallyVisible)
    }

    const observer = new MutationObserver(() => {
      const knownElements = new Set(elements)
      collectElements()

      // quem monta já na tela aparece direto, como quem nasce visível no load
      const viewportHeight = window.innerHeight
      for (const element of elements) {
        if (knownElements.has(element)) continue
        if (element.getBoundingClientRect().top < viewportHeight) {
          peaks.set(element, 1)
        }
      }

      scheduleUpdate()
    })

    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    // pinta um estado correto de imediato, mesmo antes do load completo
    update()

    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad, { once: true })
    }

    return () => {
      isDisposed = true
      observer.disconnect()
      cancelAnimationFrame(frameId)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('load', handleLoad)
    }
  }, [])

  return null
}
