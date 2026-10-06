import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'World Map' };

export default function WorldMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
