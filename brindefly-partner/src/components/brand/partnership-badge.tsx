import { Plus } from 'lucide-react'
import Image from 'next/image'

// Selo "Brindefly + Veforma" do protótipo. `unoptimized`: sem binding de imagens no Workers.
export function PartnershipBadge() {
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="grid size-14 place-items-center rounded-full bg-brindefly">
        <Image
          src="/brand/brindefly-simbolo-white.png"
          alt="Brindefly"
          width={28}
          height={28}
          className="h-7 w-auto"
          unoptimized
        />
      </div>
      <Plus className="size-5 text-muted-foreground" aria-hidden />
      <div className="grid size-14 place-items-center rounded-full bg-primary">
        <Image
          src="/brand/veforma-simbolo-white.svg"
          alt="Veforma"
          width={28}
          height={28}
          className="size-7"
          unoptimized
        />
      </div>
    </div>
  )
}
