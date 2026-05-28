import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WorkHire — AI-Powered Hiring Platform',
  description: 'Find your dream job or hire top talent with WorkHire.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
