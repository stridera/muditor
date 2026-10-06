// Connection details for the public site. NEXT_PUBLIC_* vars are inlined at build time.
export const MUD_HOST = process.env.NEXT_PUBLIC_MUD_HOST || 'fierymud.org';
export const MUD_PORT = process.env.NEXT_PUBLIC_MUD_PORT || '4003';
export const MUD_TLS_PORT = process.env.NEXT_PUBLIC_MUD_TLS_PORT || '4443';

export const PUBLIC_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/play', label: 'Play' },
  { href: '/races', label: 'Races' },
  { href: '/classes', label: 'Classes' },
  { href: '/help', label: 'Help' },
  { href: '/world-map', label: 'World Map' },
  { href: '/lore', label: 'Lore' },
  { href: '/news', label: 'News' },
  { href: '/rules', label: 'Rules' },
] as const;
