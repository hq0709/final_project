import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import ChatAgent from '../components/ChatAgent'

export const metadata: Metadata = {
  title: 'GameHub',
  description: 'Your ultimate gaming social platform - discover, collect, and share your gaming journey',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <ChatAgent />
        </Providers>
      </body>
    </html>
  )
}

