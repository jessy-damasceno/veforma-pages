import Image from 'next/image'

import { LANDING_SECTION_IDS } from '@/constants/landing'

import { SectionBadge } from '../section-badge'
import { CatalogPageMockup } from './catalog-page-mockup'
import { ViewerStack } from './viewer-stack'

const CATALOG_BENEFITS = [
  'Um QR Code e um link para cada produto',
  'O cliente aplica a própria logo e escolhe a impressão',
  'Vê o produto em realidade aumentada, pelo celular',
]

// Onde o lojista usa o QR Code de cada produto.
const QR_CODE_CHANNELS = [
  {
    label: 'Catálogos em PDF',
    icon: (
      <>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
        <path d="M14 3v5h5" />
        <path d="M9 13h6" />
        <path d="M9 17h6" />
      </>
    ),
  },
  {
    label: 'WhatsApp e e-mail',
    icon: (
      <>
        <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4A8 8 0 1 1 20 11.5Z" />
        <path d="M9 9.5c.3 2.6 2.4 4.7 5 5l1.3-1.3-1.8-1-.8.6a3.6 3.6 0 0 1-1.7-1.7l.6-.8-1-1.8L9 9.5Z" />
      </>
    ),
  },
  {
    label: 'Materiais impressos',
    icon: (
      <>
        <path d="M7 9V3h10v6" />
        <rect x="3" y="9" width="18" height="8" rx="2.5" />
        <path d="M7 14h10v7H7z" />
      </>
    ),
  },
]

// A Veforma gera um QR Code para cada produto, que o lojista coloca no próprio
// catálogo (PDF ou impresso) e o cliente abre no visualizador 3D.
// No fundo, a última camada funde tudo em branco antes da borda de baixo: o
// bloco seguinte (Planos) é branco e o brilho do canto apareceria cortado.
export function Catalog() {
  return (
    <section
      id={LANDING_SECTION_IDS.catalog}
      className="relative overflow-hidden pt-16 pb-18 shadow-[inset_0_-22px_90px_-2px_rgba(84,74,176,.2)] [background:linear-gradient(180deg,rgba(255,255,255,0)_56%,#fff_90%),radial-gradient(55%_55%_at_82%_36%,rgba(196,181,253,.38),rgba(196,181,253,0)_70%),radial-gradient(38%_38%_at_94%_62%,rgba(147,197,253,.36),rgba(147,197,253,0)_70%),linear-gradient(180deg,#f1f2ff_0%,#f7f6fd_45%,#fff_100%)] sm:pt-22 sm:pb-24 xl:pt-30 xl:pb-25.5"
    >
      <div className="mx-auto w-full max-w-331 px-5 sm:px-8">
        {/* 460 + 60 + 740 = 1260px: o gap cheio só cabe a partir de 1324px */}
        <div className="grid grid-cols-[minmax(0,640px)] items-center justify-center gap-14 xl:grid-cols-[minmax(0,460px)_740px] xl:gap-6 min-[82.75rem]:gap-15">
          <div>
            <SectionBadge data-scrub="up" variant="blue">
              QR Code por produto
            </SectionBadge>

            <h2
              data-scrub="up"
              className="mt-4 font-bold text-[34px] text-foreground leading-[1.02] tracking-[-1px] sm:text-[46px] sm:tracking-[-1.38px]"
            >
              Leve o 3D para o seu catálogo
            </h2>
            <p
              data-scrub="left"
              data-scrub-seq="0"
              className="mt-5 text-[#080808] text-base leading-normal tracking-[-0.16px]"
            >
              A Veforma gera um{' '}
              <strong className="font-semibold">
                QR Code para cada produto
              </strong>
              . Coloque no catálogo que você mesmo produz, em PDF ou impresso, e
              o cliente abre o produto em 3D direto do celular.
            </p>

            <ul className="mt-6.5 grid gap-3.5">
              {CATALOG_BENEFITS.map((benefit, index) => (
                <li
                  key={benefit}
                  data-scrub="left"
                  data-scrub-seq={index + 1}
                  className="flex items-center gap-3 font-medium text-[15px] text-foreground leading-[1.35] tracking-[-0.15px]"
                >
                  <Image
                    src="/static/landing/02-problema/icon-check.svg"
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 shrink-0"
                  />
                  {benefit}
                </li>
              ))}
            </ul>

            <div data-scrub="up" className="mt-8.5">
              <p className="font-semibold text-[#6b6b80] text-[13px] uppercase tracking-[1.4px]">
                Use nos seus
              </p>
              <ul className="mt-3 flex flex-wrap gap-2.5">
                {QR_CODE_CHANNELS.map(({ label, icon }) => (
                  <li
                    key={label}
                    className="inline-flex h-10 items-center gap-2 rounded-[30px] border border-black/10 bg-white/75 pr-4.5 pl-3.5 font-semibold text-foreground text-sm tracking-[-0.14px] backdrop-blur-sm sm:h-10.5"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="size-5"
                      fill="none"
                      stroke="#5451d7"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {icon}
                    </svg>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* no celular a composição empilha: página → ligação (vertical) →
              visualizador. Até 820px os 740px dela não cabem: reduz para 82% */}
          <div
            data-scrub="right"
            className="sm:zoom-[.82] min-[51.25rem]:zoom-[1] flex w-full flex-col items-center sm:relative sm:mx-auto sm:block sm:h-155 sm:w-185"
          >
            <CatalogPageMockup />

            {/* ligação QR Code → visualizador (mesmo motivo do lockup do hero) */}
            <div
              aria-hidden="true"
              className="relative -my-1 h-30 w-13 sm:absolute sm:top-65.5 sm:left-90 sm:my-0 sm:h-11 sm:w-25"
            >
              <svg
                viewBox="0 0 132 2.4"
                width="132"
                height="2.4"
                aria-hidden="true"
                className="absolute top-1/2 left-1/2 mt-[-1.2px] -ml-12.5 h-[2.4px] w-25 rotate-90 sm:top-5.25 sm:left-0 sm:m-0 sm:rotate-0"
              >
                <path
                  d="M1.2 1.2H130.8"
                  stroke="#000"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeDasharray="10 10"
                  fill="none"
                  className="animate-dash-flow motion-reduce:animate-none"
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 -mt-6.5 -ml-6.5 flex size-13 items-center justify-center rounded-full border-2 border-[#d6d6f0] bg-[#f3f3fd]">
                <Image
                  src="/static/landing/01-hero/ar-icon.svg"
                  alt=""
                  width={30}
                  height={30}
                  className="size-7.5"
                />
              </span>
            </div>

            <ViewerStack />
          </div>
        </div>
      </div>
    </section>
  )
}
