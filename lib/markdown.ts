/**
 * Helper to strip Markdown formatting symbols from text.
 * Used for generating clean excerpts for cards and meta descriptions.
 */
export function stripMarkdown(content: string | null | undefined): string {
  if (!content) return '';
  return content
    // Strip HTML tags if any
    .replace(/<[^>]+>/g, '')
    // Strip markdown headers (# Heading)
    .replace(/^#{1,6}\s+/gm, '')
    // Strip images (![alt](url)) -> keep alt
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Strip links ([text](url)) -> keep text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    // Strip bold and italic (***bold-italic***, **bold**, *italic*, ___bold-italic___, __bold__, _italic_)
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Strip strikethrough (~~text~~)
    .replace(/~~([^~]+)~~/g, '$1')
    // Strip blockquotes (> quote)
    .replace(/^>\s+/gm, '')
    // Strip unordered list bullets (- item, * item, + item)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Strip ordered list numbers (1. item)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Strip inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Strip code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Strip horizontal rules (---, ***, ___)
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Collapse excess whitespace and newlines to a single space
    .replace(/\s+/g, ' ')
    .trim();
}
