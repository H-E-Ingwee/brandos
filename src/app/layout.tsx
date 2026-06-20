import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrandOS — AI Brand Builder for African SMEs',
  description: 'Build your brand strategy, visual identity, and digital marketing plan with AI — built for Kenya and East Africa.',
  keywords: 'brand strategy, AI branding, Kenya, East Africa, SME, digital marketing',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0F1D26] text-white antialiased">
        {children}
      </body>
    </html>
  )
}