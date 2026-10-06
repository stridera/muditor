import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Raw HTML is dropped (skipHtml) and react-markdown's default URL transform
// strips javascript: and similar schemes.
const components: Components = {
  h1: ({ children }) => (
    <h2 className='mb-3 mt-8 font-display text-3xl'>{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className='mb-3 mt-8 font-display text-2xl'>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className='mb-2 mt-6 font-display text-xl'>{children}</h3>
  ),
  h4: ({ children }) => <h4 className='mb-2 mt-4 font-semibold'>{children}</h4>,
  p: ({ children }) => <p className='my-4 leading-7'>{children}</p>,
  ul: ({ children }) => (
    <ul className='my-4 list-disc space-y-1 pl-6'>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className='my-4 list-decimal space-y-1 pl-6'>{children}</ol>
  ),
  blockquote: ({ children }) => (
    <blockquote className='my-4 border-l-4 border-primary/60 pl-4 italic text-muted-foreground'>
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className='text-primary underline-offset-2 hover:underline'
      {...(href?.startsWith('http')
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      {children}
    </a>
  ),
  hr: () => <hr className='my-8 border-border' />,
  pre: ({ children }) => (
    <pre className='my-4 overflow-x-auto rounded-md border border-border bg-muted p-4 font-mono text-sm'>
      {children}
    </pre>
  ),
  code: ({ children, className }) => (
    <code
      className={
        className ?? 'rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]'
      }
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className='my-4 overflow-x-auto'>
      <table className='w-full border-collapse text-sm'>{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className='border border-border bg-muted px-3 py-2 text-left font-semibold'>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className='border border-border px-3 py-2'>{children}</td>
  ),
};

export function Markdown({ children }: { children: string }) {
  return (
    <div className='max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
