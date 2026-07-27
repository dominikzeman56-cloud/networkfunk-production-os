// NPOS Markdown Parser
// Parse and render Obsidian markdown files for the web dashboard

import { readFileSync, existsSync } from 'fs';
import { join, relative } from 'path';

interface Frontmatter {
  title?: string;
  description?: string;
  tags?: string[];
}

interface ParsedDocument {
  path: string;
  title: string;
  content: string;
  frontmatter: Frontmatter;
  tags: string[];
}

/**
 * Parse a markdown file with frontmatter
 */
export function parseMarkdown(filePath: string): ParsedDocument | null {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    const content = readFileSync(filePath, 'utf8');
    return parseMarkdownString(content, filePath);
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Parse markdown string with GrayMatter-style frontmatter
 */
export function parseMarkdownString(markdown: string, path: string): ParsedDocument {
  // Extract frontmatter (lines between --- at start)
  let frontmatter: Frontmatter = {};
  let body = markdown;

  if (markdown.startsWith('---')) {
    const endFrontmatter = markdown.indexOf('---', 3);
    if (endFrontmatter > 0) {
      const frontmatterBlock = markdown.substring(3, endFrontmatter);
      frontmatter = parseFrontmatter(frontmatterBlock);
      body = markdown.substring(endFrontmatter + 3).trim();
    }
  }

  // Extract title from first h1 or frontmatter
  const h1Match = body.match(/^#\s+(.+)$/m);
  const title = frontmatter.title || h1Match?.[1].trim() || 'Untitled';

  // Extract tags from frontmatter
  const tags = frontmatter.tags || [];

  // Convert markdown to HTML (basic implementation)
  const htmlContent = markdownToHtml(body);

  return {
    path,
    title,
    content: htmlContent,
    frontmatter,
    tags
  };
}

/**
 * Parse frontmatter YAML-like format
 */
function parseFrontmatter(block: string): Frontmatter {
  const result: Frontmatter = {};

  for (const line of block.split('\n')) {
    const match = line.match(/^(\w+):\s*(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (key === 'tags') {
        // Parse array format: [tag1, tag2] or - tag1\n- tag2
        if (value.startsWith('[')) {
          result.tags = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
        } else {
          result.tags = [value.trim()];
        }
      } else {
        result[key as keyof Frontmatter] = value.trim();
      }
    }
  }

  return result;
}

/**
 * Basic markdown to HTML conversion
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;

  // Headings
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Links [[name|label]] -> [label](name)
  html = html.replace(/\[\[(.+?)\|(.+?)\]\]/g, '<a href="$1">$2</a>');
  // Links [[name]] -> [name](name)
  html = html.replace(/\[\[(.+?)\]\]/g, '<a href="$1">$1</a>');

  // Code blocks
  html = html.replace(/```(\w+)?\n([\s\S]+?)```/g, '<pre><code>$2</code></pre>');

  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');

  // Blockquotes
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');

  // Lists
  html = html.replace(/^\-\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  html = '<p>' + html + '</p>';
  html = html.replace(/<\/p><p>/g, '</p>\n<p>');

  return html;
}

/**
 * Scan a directory for markdown files
 */
export function scanDirectory(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  // This would normally use fs.readdir recursively
  // For now, return placeholder
  return files;
}

/**
 * Build search index from markdown files
 */
export function buildSearchIndex(docs: ParsedDocument[]): any[] {
  return docs.map(doc => ({
    path: doc.path,
    title: doc.title,
    tags: doc.tags,
    content: doc.content
  }));
}
