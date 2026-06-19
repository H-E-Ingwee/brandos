import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'BrandOS — AI Brand Builder for African SMEs',
  description: 'Build your brand strategy, visual identity, and digital marketing plan with AI — built for Kenya and East Africa.',
  keywords: 'brand strategy, AI branding, Kenya, East Africa, SME, NGO, digital marketing',
  openGraph: {
    title: 'BrandOS by Ingweplex',
    description: 'AI-powered brand building for African businesses, NGOs, and organisations',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Theme initialisation — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('brandos-theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}