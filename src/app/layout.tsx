import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Storyboard Studio',
  description: 'Professional storyboard collaboration platform',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" className="scroll-smooth">
      <body className="antialiased bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  )
}
