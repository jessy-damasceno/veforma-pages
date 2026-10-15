import Image from 'next/image'

import { LANDING_SECTION_IDS } from '@/constants/landing'

import { SectionBadge } from './section-badge'
import { SectionSubtitle } from './section-subtitle'
import { SectionTitle } from './section-title'

const INTEGRATION_ITEMS = [
  'Visualizador direto nas páginas de produto',
  'Catálogo e variações sincronizados',
  'Visual que se adapta à sua loja',
  'Painel para gerenciar seus produtos em 3D',
]

export function MadeForBrindefly() {
  return (
    <section
      id={LANDING_SECTION_IDS.madeForBrindefly}
      className="relative overflow-hidden bg-[url(/static/landing/04-feito-para-brindefly/bg.jpg)] bg-black bg-bottom bg-cover bg-no-repeat py-16 text-center text-white sm:pt-20 sm:pb-18 lg:pt-26.5 lg:pb-17.5"
    >
      <div className="mx-auto max-w-331 px-5 sm:px-8 lg:px-11">
        <SectionBadge data-scrub="up" variant="blue" className="pr-4.25">
          Feito para a Brindefly
        </SectionBadge>

        <SectionTitle data-scrub="up" className="text-white">
          A gente deixa a Veforma pronta na sua loja Brindefly.
        </SectionTitle>
        <SectionSubtitle
          data-scrub="up"
          className="mt-[18.4px] max-w-248 text-white"
        >
          Sem instalar código, sem precisar de desenvolvedor e sem configurar a
          integração por conta própria. Após a contratação, conectamos a Veforma
          à sua loja Brindefly e deixamos o visualizador pronto para uso.
        </SectionSubtitle>

        {/* cards de vidro: brilho no canto superior direito (SVG do Figma) + véu azul */}
        <div className="mx-auto mt-9 grid max-w-160 grid-cols-1 gap-3 text-left sm:mt-12 sm:grid-cols-2 lg:mt-17.5 lg:max-w-none lg:grid-cols-4">
          {INTEGRATION_ITEMS.map((item, index) => (
            <div
              key={item}
              data-scrub="up"
              data-scrub-seq={index}
              className="rounded-[20px] border border-white/37 bg-[rgba(0,44,154,.2)] bg-[url(/static/landing/04-feito-para-brindefly/card-glow.svg)] bg-center bg-size-[100%_100%] bg-no-repeat px-6 py-5.5 shadow-[inset_0_0_48.4px_rgba(255,255,255,.25)] sm:min-h-34 sm:px-7.75 sm:pt-5.75 lg:h-34 lg:pb-0"
            >
              <Image
                src="/static/landing/04-feito-para-brindefly/icon-check.svg"
                alt=""
                width={33}
                height={33}
                className="size-8.25"
              />
              <p className="mt-2.25 font-semibold text-[17px] text-white leading-[1.22] sm:max-w-57.5">
                {item}
              </p>
            </div>
          ))}
        </div>

        {/* 2 destaques com ícone: no desktop o 2º começa em x620 do trilho de
            cards e os gaps compensam a largura de cada ícone (Figma) */}
        <div className="mx-auto mt-14 grid max-w-160 grid-cols-1 gap-y-10 text-left xl:mt-19.25 xl:max-w-none xl:grid-cols-[561px_1fr] xl:gap-y-0 xl:pl-14.75">
          <div
            data-scrub="left"
            className="flex items-start gap-4 sm:gap-6 xl:mt-1.5 xl:gap-7.25"
          >
            <span className="mt-1 flex size-13 shrink-0 items-center justify-center sm:mt-3.25 sm:size-16">
              <Image
                src="/static/landing/04-feito-para-brindefly/icon-qr.svg"
                alt=""
                width={64}
                height={64}
                className="max-w-none scale-85 sm:scale-100"
              />
            </span>
            <div>
              <h3 className="font-semibold text-[17px] leading-[1.1] tracking-[-0.18px] sm:text-lg xl:whitespace-nowrap">
                Links e QR Codes para campanhas
              </h3>
              <p className="mt-[9.2px] max-w-110 text-sm leading-[1.4] tracking-[-0.42px] xl:w-101.5 xl:max-w-none">
                Crie links e QR Codes que abrem o produto diretamente no 3D para
                usar em catálogos, propostas, WhatsApp, Instagram, materiais
                impressos e outros canais fora da loja.
              </p>
            </div>
          </div>

          <div
            data-scrub="right"
            className="flex items-start gap-4 sm:gap-6 xl:gap-5.25"
          >
            <span className="mt-1 flex size-13 shrink-0 items-center justify-center sm:mt-4 sm:size-16">
              <Image
                src="/static/landing/04-feito-para-brindefly/icon-eye.svg"
                alt=""
                width={52}
                height={52}
                className="max-w-none scale-85 sm:scale-100"
              />
            </span>
            <div>
              <h3 className="font-semibold text-[17px] leading-[1.1] tracking-[-0.18px] sm:text-lg xl:whitespace-nowrap">
                Visualização por tipo de impressão
              </h3>
              <p className="mt-[9.2px] max-w-110 text-sm leading-[1.4] tracking-[-0.42px] xl:mt-[11.2px] xl:w-102.75 xl:max-w-none">
                O envio da logo está disponível em todos os planos. No
                Profissional, o cliente também pode alternar entre os tipos de
                impressão disponíveis e visualizar como a logo fica aplicada em
                cada opção.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
