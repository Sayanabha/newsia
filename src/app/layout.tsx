import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Newsia — Indian Market Intelligence',
  description: 'AI-powered financial news for NIFTY 50 & SENSEX',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: '#0a0a0a', color: '#e8e8e8' }}>
        <Sidebar />
        <main id="main-content">
          {children}
        </main>

        <style>{`
          /* Desktop — sidebar is 224px fixed on left */
          #main-content {
            margin-left: 224px;
            min-height: 100vh;
          }

          /* Mobile — no sidebar offset, add top padding for mobile bar */
          @media (max-width: 767px) {
            #main-content {
              margin-left: 0;
              padding-top: 52px;
            }
          }
        `}</style>
      </body>
    </html>
  )
}