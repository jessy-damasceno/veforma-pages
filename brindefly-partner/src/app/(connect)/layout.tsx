import type { ReactNode } from 'react'

interface ConnectLayoutProps {
  children: ReactNode
}

// Casca das páginas de aquisição (landing e ativação): fundo neutro da Veforma.
export default function ConnectLayout({ children }: ConnectLayoutProps) {
  return <main className="flex flex-1 flex-col bg-muted">{children}</main>
}
