import { LANDING_SECTION_IDS, STEP_VIDEOS } from '@/constants/landing'

import { AutoplayVideo } from './autoplay-video'
import { SectionBadge } from './section-badge'
import { SectionSubtitle } from './section-subtitle'
import { SectionTitle } from './section-title'

const STEPS = [
  {
    title: 'Escolha a cor',
    description:
      'O cliente gira o produto em 3D, aproxima os detalhes e escolhe entre as cores disponíveis no seu catálogo.',
    videoLabel: 'Cliente escolhendo a cor da garrafa em 3D',
    video: STEP_VIDEOS[0],
  },
  {
    title: 'Aplica a própria logo',
    description:
      'Ele envia a logo, escolhe o tipo de impressão disponível e vê como a aplicação fica diretamente no produto.',
    videoLabel: 'Cliente aplicando a própria logo no produto',
    video: STEP_VIDEOS[1],
  },
  {
    title: 'Realidade aumentada',
    description:
      'Pelo QR code, o cliente abre o produto no celular e pode visualizá-lo em tamanho real no ambiente.',
    videoLabel: 'Cliente abrindo o produto em realidade aumentada pelo celular',
    video: STEP_VIDEOS[2],
  },
]

export function HowItWorks() {
  return (
    <section
      id={LANDING_SECTION_IDS.howItWorks}
      className="bg-white pt-16 pb-18 text-center sm:pt-22 sm:pb-24 lg:pt-30.5 lg:pb-32.25"
    >
      <div className="mx-auto max-w-331 px-5 sm:px-6">
        <SectionBadge data-scrub="up" variant="blue" className="pr-5.5">
          Como funciona
        </SectionBadge>

        <SectionTitle data-scrub="up">
          Seu cliente personaliza o brinde direto na página do produto
        </SectionTitle>
        <SectionSubtitle data-scrub="up" className="max-w-160">
          Em poucos passos, ele escolhe as opções, aplica a própria marca e
          visualiza o resultado em 3D e realidade aumentada.
        </SectionSubtitle>

        {/* no desktop a trilha de cards fica 5px à direita do eixo (Figma) */}
        <div className="relative mt-9 grid grid-cols-[minmax(0,440px)] justify-center gap-5.5 text-left sm:mt-11 sm:gap-7 lg:left-1.25 lg:mt-[68.4px] lg:grid-cols-[repeat(3,minmax(0,400px))] lg:gap-9.5">
          {STEPS.map(({ title, description, videoLabel, video }, index) => (
            <article
              key={title}
              data-scrub="up"
              data-scrub-seq={index}
              className="overflow-hidden rounded-[18px] bg-white shadow-[0_0_12px_rgba(0,0,0,.07)]"
            >
              <div className="aspect-square bg-[#eceef6]">
                <AutoplayVideo
                  src={video.src}
                  poster={video.poster}
                  aria-label={videoLabel}
                  className="block size-full object-cover"
                />
              </div>

              <div className="px-6 pt-7.5 pb-8 sm:pt-10.25 sm:pr-9 sm:pb-10.75 sm:pl-7.75">
                <span className="ml-px block font-medium text-brand-cobalt text-lg leading-5.75 tracking-[-0.18px]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-1.5 font-semibold text-[19px] text-black leading-5.75 tracking-[-0.2px] sm:text-xl">
                  {title}
                </h3>
                <p className="mt-3 text-[#a3a3a3] text-[14.5px] leading-[1.55] tracking-[-0.15px] sm:text-[15px] sm:leading-5.75">
                  {description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
