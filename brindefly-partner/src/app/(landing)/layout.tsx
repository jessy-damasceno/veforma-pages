import type { ReactNode } from 'react'

interface LandingLayoutProps {
  children: ReactNode
}

// Layout da landing: header e footer da Veforma entram aqui.
export default function LandingLayout({ children }: LandingLayoutProps) {
  return <main className="flex flex-1 flex-col">{children}</main>
}
