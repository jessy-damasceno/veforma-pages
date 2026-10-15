import type { Metadata } from 'next'
import { Poppins, Red_Hat_Text } from 'next/font/google'
import type { ReactNode } from 'react'

import { QueryProvider } from '@/components/providers/query-provider'
import { Toaster } from '@/components/ui/sonner'
import { env } from '@/config/env'
import { SITE } from '@/constants/site'
import { cn } from '@/utils/cn'

import '@/styles/globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
})

// Usada só no "+" do lockup Brindefly + Veforma, no hero.
const redHatText = Red_Hat_Text({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-red-hat-text',
})

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: SITE.name,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="pt-BR"
      className={cn(
        poppins.variable,
        redHatText.variable,
        'h-full scroll-smooth antialiased',
      )}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col font-sans">
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  )
}
