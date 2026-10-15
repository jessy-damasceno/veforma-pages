import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_IDLE_DELAY_IN_MS = 120

function findSectionAtMiddle(sectionIds: string[]) {
  const middle = window.innerHeight / 2

  const sectionId = sectionIds.find((id) => {
    const rect = document.getElementById(id)?.getBoundingClientRect()

    return !!rect && rect.top <= middle && rect.bottom > middle
  })

  return sectionId ?? null
}

/**
 * Scroll-spy: devolve a seção que cruza uma faixa fina no meio da tela.
 *
 * Ao clicar num link, `lockToSection` acende só ele e trava o destaque até a
 * rolagem suave terminar (120ms sem evento de scroll); senão os links das
 * seções do caminho acenderiam um por um. Quando a rolagem para, o destaque
 * volta a seguir a página.
 */
export function useActiveSection(sectionIds: string[]) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)

  const isLockedRef = useRef(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const releaseWhenIdle = useCallback(() => {
    clearTimeout(idleTimerRef.current)

    idleTimerRef.current = setTimeout(() => {
      isLockedRef.current = false
      setActiveSectionId(findSectionAtMiddle(sectionIds))
    }, SCROLL_IDLE_DELAY_IN_MS)
  }, [sectionIds])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isLockedRef.current) return

        for (const { target, isIntersecting } of entries) {
          if (isIntersecting) {
            setActiveSectionId(target.id)
            continue
          }

          // saiu da seção sem entrar em outra (ex.: hero, CTA final)
          setActiveSectionId((current) =>
            current === target.id ? null : current,
          )
        }
      },
      { rootMargin: '-50% 0px -49% 0px' },
    )

    for (const id of sectionIds) {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    }

    function handleScroll() {
      if (isLockedRef.current) releaseWhenIdle()
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(idleTimerRef.current)
    }
  }, [sectionIds, releaseWhenIdle])

  function lockToSection(sectionId: string | null) {
    isLockedRef.current = true
    setActiveSectionId(sectionId)
    // se o clique não rolar nada, solta logo
    releaseWhenIdle()
  }

  return { activeSectionId, lockToSection }
}
