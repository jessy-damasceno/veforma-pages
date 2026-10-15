import Image from 'next/image'

import { cn } from '@/utils/cn'

import { GlassCard } from './glass-card'

const CARD_TITLE_CLASS_NAME =
  'absolute font-semibold text-base text-black leading-4.25'
const CARD_TEXT_CLASS_NAME =
  'absolute font-medium text-[13px] text-black leading-4.25'
const CARD_RULE_CLASS_NAME = 'absolute h-px bg-[#e5e5e5]'

// Os 3 cards de vidro do palco do hero. Posições internas em px do Figma.
// Abaixo do xl eles deixam de sair tanto da moldura do vídeo.
export function FeatureCards() {
  return (
    <>
      <GlassCard
        side="left"
        className="max-lg:zoom-[.85] top-39 -left-10 h-54.5 w-65.5 [--float-delay:0s] [--float-duration:6.5s] xl:-left-33"
      >
        <div className="absolute top-6.5 left-3.5 h-[172.05px] w-25.25 overflow-hidden">
          <Image
            src="/static/landing/01-hero/card-copo.png"
            alt="Copo térmico azul"
            width={114}
            height={172}
            className="absolute top-0 left-[-13.34%] h-full w-[113.34%] max-w-none"
          />
        </div>
        <div className="absolute top-21.25 left-[53.07px] h-14.5 w-6.5 border-[.8px] border-white border-dashed">
          <Image
            src="/static/landing/01-hero/card-copo-b.svg"
            alt=""
            width={14}
            height={22}
            className="absolute top-[20.39px] left-[6.19px] h-[22.03px] w-[14.44px] max-w-none"
          />
        </div>

        <p className={cn(CARD_TITLE_CLASS_NAME, 'top-7.25 left-31.5 w-25.5')}>
          Seu logo no produto
        </p>
        <span
          className={cn(
            CARD_RULE_CLASS_NAME,
            'top-[75.5px] left-31 w-[120.5px]',
          )}
        />
        <p className={cn(CARD_TEXT_CLASS_NAME, 'top-20.75 left-31.25 w-33.75')}>
          insira seu logo e mostre a área de impressão
        </p>

        <div className="absolute top-36.75 left-31 h-11.25 w-11.5 overflow-hidden rounded-[11px] border border-[#dbdbdb]">
          <Image
            src="/static/landing/01-hero/card-logo-upload.png"
            alt=""
            width={437}
            height={254}
            className="absolute top-[-157.78%] left-[-71.74%] h-[564.44%] w-[950%] max-w-none"
          />
        </div>
      </GlassCard>

      <GlassCard
        side="right"
        className="max-lg:zoom-[.85] top-20.5 -right-10 h-40 w-58.25 [--float-delay:-2.6s] [--float-duration:7.8s] [--float-rotate-sign:-1] xl:right-auto xl:left-199.75"
      >
        <Image
          src="/static/landing/01-hero/ar-icon.svg"
          alt=""
          width={52}
          height={52}
          className="absolute top-6 left-5.75 size-13"
        />
        <p className={cn(CARD_TITLE_CLASS_NAME, 'top-9 left-22.5 w-31.75')}>
          Realidade aumentada
        </p>
        <span
          className={cn(CARD_RULE_CLASS_NAME, 'top-22.25 left-4.5 w-49.5')}
        />
        <p className={cn(CARD_TEXT_CLASS_NAME, 'top-25 left-4.75 w-49.5')}>
          Escaneie o QR code e veja o produto no seu ambiente.
        </p>
      </GlassCard>

      <GlassCard
        side="right"
        className="top-68.75 -right-10 h-53.75 w-53 [--float-delay:-4.4s] [--float-duration:7.1s] xl:right-auto xl:left-221.75"
      >
        <p className={cn(CARD_TITLE_CLASS_NAME, 'top-5.5 left-4.5 w-41.25')}>
          Tipos de impressão
        </p>
        <span
          className={cn(CARD_RULE_CLASS_NAME, 'top-[52.5px] left-4.5 w-43.75')}
        />

        <Image
          src="/static/landing/01-hero/card-silk.svg"
          alt=""
          width={25}
          height={25}
          className="absolute top-16.75 left-4.75 size-6.25"
        />
        <Image
          src="/static/landing/01-hero/card-uv.svg"
          alt=""
          width={28}
          height={28}
          className="absolute top-24.5 left-4.75 size-7"
        />
        <Image
          src="/static/landing/01-hero/card-laser.svg"
          alt=""
          width={25}
          height={25}
          className="absolute top-33.5 left-5.25 size-6.25"
        />
        <Image
          src="/static/landing/01-hero/card-laser.svg"
          alt=""
          width={25}
          height={25}
          className="absolute top-42.25 left-5.25 size-6.25"
        />

        {/* textos em +72, +104, +136 e +172 (passos de 32, 32 e 36) */}
        <ul className="absolute top-18 left-13.75 w-37 whitespace-nowrap font-semibold text-[15px] text-foreground leading-5 tracking-[-0.3px]">
          <li>Silk Screen</li>
          <li className="mt-3">UV Circular (360)</li>
          <li className="mt-3">Laser</li>
          <li className="mt-4">Laser Circular</li>
        </ul>
      </GlassCard>
    </>
  )
}
