import Image from 'next/image'

// Página do catálogo em PDF (ilustrativa): produto, QR Code que abre o 3D e
// rodapé com o site da empresa.
export function CatalogPageMockup() {
  return (
    <div
      aria-hidden="true"
      className="relative h-135 w-[min(340px,100%)] shrink-0 rotate-[-2.5deg] animate-bob overflow-hidden rounded-[18px] bg-white shadow-[0_30px_70px_rgba(22,39,82,.2),0_0_0_1px_rgba(0,0,0,.04)] motion-reduce:animate-none sm:absolute sm:top-5 sm:left-0 sm:w-90"
    >
      <div className="absolute top-7 right-7 left-7">
        <p className="font-bold text-[22px] text-foreground leading-[1.1] tracking-[-0.6px]">
          Copo térmico 473 ml
        </p>
        <p className="mt-1 text-[#444] text-sm">Personalizado com a sua logo</p>
        <span className="mt-2.5 inline-block rounded-[20px] bg-brand-gradient px-2.75 py-0.75 font-semibold text-white text-xs">
          94397
        </span>
      </div>

      <Image
        src="/static/landing/08-catalogo/copo.png"
        alt=""
        width={150}
        height={226}
        className="absolute top-42.5 left-5.5 h-auto w-37.5 drop-shadow-[0_14px_12px_rgba(22,39,82,.22)]"
      />

      <div className="absolute top-39 right-6 w-37 rounded-2xl border border-border bg-white px-2.25 pt-2.25 pb-2.5 text-center shadow-[0_8px_22px_rgba(22,39,82,.1)]">
        <div className="relative mx-auto size-32 rounded-xl bg-[#e8f2ff] p-1.5">
          <Image
            src="/static/landing/08-catalogo/qr-demo.svg"
            alt=""
            width={116}
            height={116}
            className="size-full rounded-md bg-white"
          />
          <span className="absolute top-1/2 left-1/2 -mt-4.25 -ml-4.25 flex size-8.5 items-center justify-center rounded-[10px] bg-white shadow-[0_0_0_2px_#e8f2ff]">
            <Image
              src="/static/landing/01-hero/veforma-symbol.svg"
              alt=""
              width={22}
              height={22}
              className="size-5.5"
            />
          </span>
        </div>

        <p className="mt-2 font-semibold text-[12.5px] text-foreground leading-tight">
          Veja em 3D com a sua logo
        </p>
        <p className="mt-1.5 flex items-center justify-center gap-1.25 text-[#6b6b6b] text-[10.5px]">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="size-3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 5V3.5A1.5 1.5 0 0 1 3.5 2H5M11 2h1.5A1.5 1.5 0 0 1 14 3.5V5M14 11v1.5a1.5 1.5 0 0 1-1.5 1.5H11M5 14H3.5A1.5 1.5 0 0 1 2 12.5V11M4.5 8h7" />
          </svg>
          Aponte a câmera
        </p>
      </div>

      <div className="absolute right-6 bottom-15.5 left-7 flex flex-wrap gap-1.5">
        <span className="whitespace-nowrap rounded-[20px] border border-[#1fb5e0] px-2.5 py-1.5 font-bold text-[9.5px] text-foreground uppercase tracking-[-0.1px]">
          Pedido mínimo 30 unidades
        </span>
        <span className="whitespace-nowrap rounded-[20px] border border-[#1fb5e0] px-2.5 py-1.5 font-bold text-[9.5px] text-foreground uppercase tracking-[-0.1px]">
          Personalizado com sua logo
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-9.5 items-center justify-center bg-linear-96 from-brand-purple to-brand-blue font-medium text-[11px] text-white tracking-[0.2px]">
        www.suaempresa.com.br
      </div>
    </div>
  )
}
