import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { LANDING_SECTION_IDS } from '@/constants/landing'

import { SectionBadge } from './section-badge'

const FAQ_ITEMS = [
  {
    question: 'Preciso configurar alguma coisa na minha loja?',
    answer:
      'Não. Depois que a integração é ativada, a Veforma adiciona o visualizador às páginas dos produtos configurados. Não é necessário instalar código ou fazer alterações no tema da loja.',
  },
  {
    question: 'Meus produtos não têm modelo 3D. Como funciona?',
    answer:
      'A Veforma possui uma biblioteca de modelos 3D prontos. Pelo painel, você escolhe quais produtos da sua loja terão a visualização em 3D e, caso algum modelo ainda não esteja disponível, pode solicitar sua inclusão.',
  },
  {
    question: 'A Veforma altera o visual da minha loja?',
    answer:
      'Não. O visualizador é adicionado somente às páginas de produto e possui uma interface neutra, pensada para se integrar ao layout da sua loja sem alterar sua identidade visual.',
  },
  {
    question: 'Como o cliente usa o 3D?',
    answer:
      'O visualizador abre diretamente na página do produto, tanto no computador quanto no celular. O cliente pode girar o produto, trocar a cor, escolher o tipo de impressão e enviar a própria logo para visualizar a personalização.',
  },
  {
    question: 'Como funciona a realidade aumentada?',
    answer:
      'O cliente acessa a realidade aumentada pelo QR code exibido no visualizador e pode ver o produto em escala real usando a câmera do celular.',
  },
  {
    question: 'Posso solicitar novos produtos em 3D?',
    answer:
      'Sim. Se um produto ainda não estiver disponível na biblioteca da Veforma, você pode solicitar um novo modelo diretamente pelo painel.',
  },
]

export function Faq() {
  return (
    <section
      id={LANDING_SECTION_IDS.faq}
      className="relative overflow-hidden bg-[url(/static/landing/06-faq/bg.jpg)] bg-black bg-bottom bg-cover bg-no-repeat pt-16 pb-18 text-white sm:pt-20 sm:pb-22 xl:pt-28 xl:pb-33.75"
    >
      <div className="mx-auto max-w-331 px-5 sm:px-8">
        <div className="grid grid-cols-[minmax(0,640px)] items-start justify-center gap-y-10 text-center xl:grid-cols-[500px_610px] xl:gap-y-0 xl:text-left">
          <div className="xl:pl-px">
            <SectionBadge data-scrub="up" className="pr-5.25">
              Dúvidas
            </SectionBadge>

            <h2
              data-scrub="up"
              className="mx-auto mt-4.25 max-w-116.25 font-bold text-4xl text-white leading-[.93] tracking-[-1.44px] sm:text-[40px] xl:mx-0 xl:text-5xl"
            >
              Perguntas frequentes
            </h2>
            <p
              data-scrub="left"
              className="mx-auto mt-[19.7px] max-w-89 text-[#b8b8b8] text-[15px] leading-[1.39] tracking-[-0.32px] sm:text-base xl:mx-0"
            >
              Tire suas dúvidas sobre como a Veforma funciona na sua loja:
              modelos 3D, realidade aumentada e novos produtos.
            </p>
          </div>

          <div
            data-scrub="right"
            className="overflow-hidden rounded-[20px] border border-border bg-white text-left text-foreground xl:mt-3.25"
          >
            <Accordion type="single" collapsible>
              {FAQ_ITEMS.map(({ question, answer }) => (
                <AccordionItem key={question} value={question}>
                  <AccordionTrigger className="min-h-15 items-center rounded-none py-3.5 pr-5 pl-4.5 leading-5 hover:bg-[#fafafa] hover:no-underline focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-inset sm:py-0 sm:pr-8 sm:pl-6 [&>svg]:translate-y-0 [&>svg]:text-foreground [&>svg]:duration-300 [&>svg]:ease-smooth">
                    {question}
                  </AccordionTrigger>
                  <AccordionContent className="pr-12 pb-5 pl-4.5 text-[#525252] leading-5.5 sm:pr-14.25 sm:pb-5.5 sm:pl-6">
                    {answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
