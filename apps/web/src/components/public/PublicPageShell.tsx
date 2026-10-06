import type { ReactNode } from 'react';

interface PublicPageShellProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PublicPageShell({
  title,
  subtitle,
  children,
}: PublicPageShellProps) {
  return (
    <div className='mx-auto w-full max-w-4xl px-4 py-12 sm:px-6'>
      <header className='mb-8 border-b border-border pb-6'>
        <h1 className='font-display text-3xl font-semibold tracking-wide sm:text-4xl'>
          {title}
        </h1>
        {subtitle && (
          <p className='mt-2 text-base text-muted-foreground'>{subtitle}</p>
        )}
      </header>
      {children}
    </div>
  );
}
