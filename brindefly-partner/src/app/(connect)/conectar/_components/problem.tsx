import Image from 'next/image'

import { LANDING_SECTION_IDS } from '@/constants/landing'
import { cn } from '@/utils/cn'

import { SectionBadge } from './section-badge'

const PAIN_POINTS = [
  'Alguém da equipe precisa montar o mockup',
  // hífen inseparável: "e-mail" não quebra no fim da linha
  'A aprovação acontece pelo WhatsApp ou e‑mail',
  'Se mudar a cor ou impressão, uma nova prévia é necessária',
  'O processo de orçamento acaba levando mais etapas',
]

const BENEFITS = [
  {
    highlight: 'O cliente vê a própria marca no produto,',
    text: ' direto na página da sua loja.',
  },
  {
    highlight: 'Escolhe a cor e o tipo de impressão',
    text: ' e visualiza cada opção em 3D.',
  },
  {
    highlight: 'Envia a logo e vê a aplicação na hora,',
    text: ' sem depender de uma prévia manual.',
  },
  {
    highlight: 'Pode girar e aproximar o produto',
    text: ' para conferir os detalhes.',
  },
  {
    highlight: 'Visualiza em realidade aumentada',
    text: ', pelo celular, em tamanho real.',
  },
  {
    highlight: 'Sua equipe recebe o cliente com as escolhas já definidas,',
    text: ' facilitando a continuidade do orçamento.',
  },
]

export function Problem() {
  return (
    <section
      id={LANDING_SECTION_IDS.problem}
      className="relative overflow-hidden bg-[url(/static/landing/02-problema/bg.jpg)] bg-black bg-bottom bg-cover bg-no-repeat py-12 text-white sm:py-16 xl:pt-22.75"
    >
      <div className="mx-auto w-full max-w-331 px-5 sm:px-8">
        <div className="mx-auto grid max-w-160 grid-cols-1 gap-y-12 xl:max-w-289.25 xl:grid-cols-[1fr_566px] xl:items-start xl:gap-y-0">
          <div className="text-center xl:pt-7.75 xl:pl-px xl:text-left">
            <SectionBadge data-scrub="up" className="pr-5.75">
              O problema
            </SectionBadge>

            <h2
              data-scrub="up"
              className="mx-auto mt-4.25 font-bold text-4xl text-white leading-[.93] tracking-[-1.44px] sm:max-w-103.25 sm:text-5xl xl:mx-0"
            >
              O cliente ainda precisa imaginar como o brinde vai ficar
            </h2>

            <p
              data-scrub="left"
              data-scrub-seq="0"
              className="mx-auto mt-4 max-w-122.75 text-[#b8b8b8] text-[15px] leading-[1.39] tracking-[-0.32px] sm:text-base xl:mx-0"
            >
              Na maioria das lojas, ele vê apenas a foto do produto e precisa
              imaginar como a própria marca ficará aplicada.
            </p>

            <ul className="mx-auto mt-8.75 grid w-fit max-w-full gap-3.25 text-left xl:mx-0 xl:w-auto xl:pl-1.5">
              {PAIN_POINTS.map((painPoint, index) => (
                <li
                  key={painPoint}
                  data-scrub="left"
                  data-scrub-seq={index + 1}
                  className="flex items-start gap-1.75 font-medium text-sm text-white leading-[1.39] tracking-[-0.3px] sm:text-[15px]"
                >
                  <Image
                    src="/static/landing/02-problema/icon-x.svg"
                    alt=""
                    width={22}
                    height={22}
                    className="mt-px size-5.5 shrink-0"
                  />
                  {painPoint}
                </li>
              ))}
            </ul>
          </div>

          <div
            data-scrub="right"
            className="relative w-full rounded-[28px] bg-white px-5.5 pt-9 pb-8 text-black shadow-[0_0_14px_rgba(0,0,0,.16)] sm:rounded-[40px] sm:px-10.75 sm:pt-14.25 sm:pb-12 xl:min-h-138.5 xl:w-141.5 xl:pb-0"
          >
            <h3 className="-ml-1 font-bold text-[22px] leading-[.93] tracking-[-0.78px] sm:text-[26px]">
              Com a Veforma
            </h3>
            <Image
              src="/static/landing/02-problema/veforma-symbol-black.svg"
              alt=""
              width={43}
              height={43}
              className="absolute top-6.5 right-5.5 size-9 sm:top-9.5 sm:right-10 sm:size-10.75"
            />

            <ul className="mt-7.5 grid gap-5 sm:mt-[40.8px] sm:gap-[28.6px]">
              {BENEFITS.map(({ highlight, text }, index) => (
                <li
                  key={highlight}
                  className="flex min-h-9.5 items-center gap-3 text-[14.5px] leading-[1.16] tracking-[-0.48px] sm:gap-3.5 sm:text-base"
                >
                  <Image
                    src="/static/landing/02-problema/icon-check.svg"
                    alt=""
                    width={38}
                    height={38}
                    className="size-8 shrink-0 sm:size-9.5"
                  />
                  <span className={cn('max-w-99.5', index >= 4 && 'max-w-105')}>
                    <strong className="font-semibold">{highlight}</strong>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
