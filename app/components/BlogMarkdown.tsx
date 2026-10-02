'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

interface BlogMarkdownProps {
  content: string | null | undefined;
  className?: string;
}

/**
 * Safely converts legacy HTML formatting into Markdown equivalents
 * so older posts or pasted rich text display seamlessly.
 */
function normalizeContent(raw: string | null | undefined): string {
  if (!raw) return '';
  let text = raw;

  // Remove potential dangerous script tags or inline handlers
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  if (/<(p|br|h[1-6]|ul|ol|li|strong|b|em|i|blockquote|a)\b/i.test(text)) {
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/?(strong|b)>/gi, '**')
      .replace(/<\/?(em|i)>/gi, '*')
      .replace(/<h1[^>]*>/gi, '## ')
      .replace(/<h2[^>]*>/gi, '## ')
      .replace(/<h3[^>]*>/gi, '### ')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li>/gi, '- ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<\/?(ul|ol)>/gi, '\n')
      .replace(/<blockquote>/gi, '> ')
      .replace(/<\/blockquote>/gi, '\n\n');
  }

  return text;
}

export default function BlogMarkdown({ content, className = '' }: BlogMarkdownProps) {
  const normalized = normalizeContent(content);

  if (!normalized) {
    return null;
  }

  return (
    <div className={`blog-markdown max-w-[720px] mx-auto text-gray-800 dark:text-gray-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={{
          // Post title in the hero is the only H1 on the page.
          // Any H1 in markdown content is rendered as H2 to enforce semantic hierarchy.
          h1: ({ ...props }) => (
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-10 mb-4 tracking-tight first:mt-0"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-10 mb-4 tracking-tight first:mt-0"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h3
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-3 tracking-tight"
              {...props}
            />
          ),
          h4: ({ ...props }) => (
            <h4
              className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-6 mb-2 tracking-tight"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className="text-[17px] sm:text-lg leading-[1.8] text-gray-700 dark:text-gray-300 my-5"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="list-disc pl-6 sm:pl-8 my-5 space-y-2 text-gray-700 dark:text-gray-300 text-[17px] sm:text-lg leading-[1.8]"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal pl-6 sm:pl-8 my-5 space-y-2 text-gray-700 dark:text-gray-300 text-[17px] sm:text-lg leading-[1.8]"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="pl-1" {...props} />,
          strong: ({ ...props }) => (
            <strong className="font-bold text-gray-900 dark:text-white" {...props} />
          ),
          em: ({ ...props }) => (
            <em className="italic text-gray-800 dark:text-gray-200" {...props} />
          ),
          a: ({ href, ...props }) => {
            const isExternal = href?.startsWith('http') || href?.startsWith('//');
            return (
              <a
                href={href}
                className="text-[var(--blue)] font-semibold hover:underline transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--blue)] rounded"
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                {...props}
              />
            );
          },
          blockquote: ({ ...props }) => (
            <blockquote
              className="border-l-4 border-[var(--blue)] pl-4 sm:pl-6 py-2 my-6 italic text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-r-xl text-[17px] leading-[1.8]"
              {...props}
            />
          ),
          img: ({ alt, ...props }) => (
            <img
              alt={alt || 'Blog article image'}
              className="my-8 rounded-2xl overflow-hidden w-full object-cover shadow-md border border-gray-200/60 dark:border-gray-800"
              {...props}
            />
          ),
          code: ({ className, children, ...props }) => {
            const isBlock = Boolean(className) || (typeof children === 'string' && children.includes('\n'));
            if (isBlock) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code
                className="bg-gray-100 dark:bg-gray-800 text-[var(--blue)] px-1.5 py-0.5 rounded text-sm font-mono"
                {...props}
              >
                {children}
              </code>
            );
          },
          pre: ({ ...props }) => (
            <pre
              className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto my-6 text-sm font-mono border border-gray-800"
              {...props}
            />
          ),
          hr: () => <hr className="my-8 border-gray-200 dark:border-gray-800" />,
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
