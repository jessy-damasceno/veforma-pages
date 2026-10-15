import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-semibold text-2xl">Página não encontrada</h1>
      <p className="text-muted-foreground">
        O endereço que você acessou não existe.
      </p>
      <Link href="/" className="underline underline-offset-4">
        Voltar para o início
      </Link>
    </main>
  )
}
