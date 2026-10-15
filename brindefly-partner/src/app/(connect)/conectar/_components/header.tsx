'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useBoolean, useEventListener } from 'usehooks-ts'

import { Button } from '@/components/ui/button'
import { LANDING_NAV_LINKS, LANDING_SECTION_IDS } from '@/constants/landing'
import { useActiveSection } from '@/hooks/use-active-section'
import { cn } from '@/utils/cn'

// Antes disso o hero ocupa a tela: o menu só aparece depois de rolar.
const SHOW_AFTER_SCROLL_IN_PX = 300
// Com 5 links + botão, a barra não cabe abaixo do lg: vira hambúrguer.
const DESKTOP_MIN_WIDTH_IN_PX = 1024
const SPY_SECTION_IDS: string[] = LANDING_NAV_LINKS.map(
  ({ sectionId }) => sectionId,
)

/**
 * Menu flutuante: fica escondido no topo (para não brigar com o hero) e desce
 * como uma pílula de vidro depois de ~300px de rolagem. Marca o link da seção
 * atual (scroll-spy) e, no celular, abre a gaveta em tela cheia.
 */
export function Header() {
  const { value: isVisible, setValue: setIsVisible } = useBoolean(false)
  const {
    value: isDrawerOpen,
    toggle: toggleDrawer,
    setFalse: closeDrawer,
  } = useBoolean(false)
  const { activeSectionId, lockToSection } = useActiveSection(SPY_SECTION_IDS)

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_IN_PX)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [setIsVisible])

  useEffect(() => {
    if (!isDrawerOpen) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = overflow
    }
  }, [isDrawerOpen])

  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDrawer()
  })

  useEventListener('resize', () => {
    if (window.innerWidth >= DESKTOP_MIN_WIDTH_IN_PX) closeDrawer()
  })

  // Clique em qualquer âncora do menu (links, logo, botão): acende só ela.
  function handleAnchorClick(sectionId: string) {
    lockToSection(SPY_SECTION_IDS.includes(sectionId) ? sectionId : null)
  }

  function handleDrawerLinkClick(sectionId: string) {
    handleAnchorClick(sectionId)
    closeDrawer()
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-3 z-100 mx-auto w-[calc(100%-24px)] transition-[opacity,translate,visibility] duration-450 ease-smooth motion-reduce:transition-none lg:top-4 lg:w-[min(1100px,calc(100%-32px))]',
          !isVisible &&
            'pointer-events-none invisible -translate-y-6 opacity-0',
        )}
      >
        <div
          className={cn(
            'flex h-14.5 items-center gap-6 rounded-[40px] border border-black/6 pr-1.75 pl-5 shadow-[0_10px_40px_rgba(22,39,82,.18),inset_0_1px_0_rgba(255,255,255,.7)] backdrop-blur-[18px] backdrop-saturate-140 lg:h-16 lg:pr-2.5 lg:pl-7',
            // com a gaveta aberta (fundo escuro), a barra fica branca sólida
            isDrawerOpen ? 'bg-white' : 'bg-white/78',
          )}
        >
          <a
            href={`#${LANDING_SECTION_IDS.hero}`}
            aria-label="Veforma — voltar ao topo"
            onClick={() => handleAnchorClick(LANDING_SECTION_IDS.hero)}
            className="flex shrink-0 items-center"
          >
            <Image
              src="/static/landing/shared/logo-veforma.svg"
              alt="Veforma"
              width={159}
              height={30}
              className="h-6.5 w-auto lg:h-7.5"
            />
          </a>

          <nav
            aria-label="Principal"
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            {/* borda transparente de 2px: o link ativo não muda de tamanho */}
            {LANDING_NAV_LINKS.map(({ label, sectionId }) => (
              <a
                key={sectionId}
                href={`#${sectionId}`}
                aria-current={
                  activeSectionId === sectionId ? 'true' : undefined
                }
                onClick={() => handleAnchorClick(sectionId)}
                className="whitespace-nowrap rounded-[30px] border-2 border-transparent px-3.5 py-1.75 font-medium text-foreground text-sm tracking-[-0.14px] transition-colors duration-250 hover:text-brand-purple focus-visible:outline-2 focus-visible:outline-brand-purple focus-visible:outline-offset-2 aria-current:border-black aria-current:text-black"
              >
                {label}
              </a>
            ))}
          </nav>

          <Button
            className="hidden h-11 rounded-[27px] px-6 font-bold text-sm tracking-[-0.42px] hover:scale-104 lg:inline-flex"
            asChild
          >
            <a
              href={`#${LANDING_SECTION_IDS.plans}`}
              onClick={() => handleAnchorClick(LANDING_SECTION_IDS.plans)}
            >
              Testar grátis
            </a>
          </Button>

          <button
            type="button"
            aria-expanded={isDrawerOpen}
            aria-controls="nav-drawer"
            aria-label={isDrawerOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={toggleDrawer}
            className="group/burger relative ml-auto size-11 rounded-full bg-black focus-visible:outline-2 focus-visible:outline-brand-purple focus-visible:outline-offset-2 lg:hidden"
          >
            <span className="absolute inset-x-3.25 top-4.25 h-0.5 rounded-xs bg-white transition-[top,rotate] duration-300 ease-smooth group-aria-expanded/burger:top-5.25 group-aria-expanded/burger:rotate-45 motion-reduce:transition-none" />
            <span className="absolute inset-x-3.25 top-6.25 h-0.5 rounded-xs bg-white transition-[top,rotate] duration-300 ease-smooth group-aria-expanded/burger:top-5.25 group-aria-expanded/burger:-rotate-45 motion-reduce:transition-none" />
          </button>
        </div>
      </header>

      {/* Gaveta do celular: fica fora do <header>, que é animado (translate)
          e quebraria o position:fixed. Mesmo brilho roxo dos blocos escuros. */}
      <div
        id="nav-drawer"
        inert={!isDrawerOpen}
        className={cn(
          'fixed inset-0 z-99 flex items-center justify-center px-7 pt-24 pb-10 transition-[opacity,visibility] duration-350 [background:radial-gradient(120%_60%_at_85%_100%,rgba(107,87,236,.55),rgba(107,87,236,0)_65%),#05050c] motion-reduce:transition-none lg:hidden',
          !isDrawerOpen && 'invisible opacity-0',
        )}
      >
        <nav
          aria-label="Menu principal"
          className="flex w-full max-w-90 flex-col items-center gap-2.5"
        >
          {LANDING_NAV_LINKS.map(({ label, sectionId }) => (
            <a
              key={sectionId}
              href={`#${sectionId}`}
              aria-current={activeSectionId === sectionId ? 'true' : undefined}
              onClick={() => handleDrawerLinkClick(sectionId)}
              className="rounded-[40px] border-2 border-transparent px-5 py-2 font-bold text-[30px] text-white tracking-[-0.9px] transition-colors duration-250 hover:text-[#a99bff] aria-current:border-white"
            >
              {label}
            </a>
          ))}

          <a
            href={`#${LANDING_SECTION_IDS.plans}`}
            onClick={() => handleDrawerLinkClick(LANDING_SECTION_IDS.plans)}
            className="mt-5.5 flex h-14 w-full items-center justify-center rounded-[40px] bg-white font-bold text-base text-black tracking-[-0.48px] transition-colors duration-250 hover:bg-[#e9e6ff]"
          >
            Testar grátis
          </a>
        </nav>
      </div>
    </>
  )
}
