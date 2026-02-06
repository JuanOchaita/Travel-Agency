import './globals.css'
import type { Metadata } from 'next'
import AuthProvider from './providers'

export const metadata: Metadata = {
  title: 'Sistema de Cotización de Viajes',
  description: 'Cotiza tu viaje perfecto',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
