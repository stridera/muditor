import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Muditor - MUD World Editor',
  description: 'A modern, database-driven MUD editor and administration tool',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}