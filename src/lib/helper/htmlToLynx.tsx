// lib/helper/htmlToLynx.tsx
import type { ReactNode } from '@lynx-js/react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';

type LynxNode =
  | { kind: 'element'; tag: string; attrs: Record<string, string>; children: LynxNode[] }
  | { kind: 'text'; content: string };

// ─── Tag maps ────────────────────────────────────────────────────────────────

const BLOCK_TAGS = new Set([
  'div',
  'section',
  'article',
  'main',
  'header',
  'footer',
  'aside',
  'nav',
  'ul',
  'ol',
  'li',
  'form',
  'fieldset',
  'figure',
  'a',
  'button',
  'table',
]);

const TEXT_TAGS = new Set([
  'p',
  'span',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'strong',
  'b',
  'em',
  'i',
  'small',
  'label',
  'caption',
  'td',
  'th',
  'dt',
  'dd',
  'blockquote',
  'pre',
  'code',
]);

const STRIP_TAGS = new Set([
  'script',
  'style',
  'head',
  'meta',
  'link',
  'noscript',
  'iframe',
  'svg',
  'canvas',
]);

const VOID_TAGS = new Set(['img', 'br', 'hr']);

// ─── Style parser ─────────────────────────────────────────────────────────────

const parseInlineStyle = (style: string): Record<string, string> => {
  return Object.fromEntries(
    style
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((rule) => {
        const colonIdx = rule.indexOf(':');
        if (colonIdx === -1) return null;
        const prop = rule.slice(0, colonIdx).trim();
        const val = rule.slice(colonIdx + 1).trim();
        const camel = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
        return [camel, val];
      })
      .filter(Boolean) as [string, string][]
  );
};

// ─── HTML tag → TextType mapping ─────────────────────────────────────────────

const toTextType = (htmlTag: string): TextType | null => {
  switch (htmlTag) {
    case 'h1':
      return TextType.h1;
    case 'h2':
      return TextType.h2;
    case 'h3':
      return TextType.h3;
    case 'h4':
    case 'h5':
    case 'h6':
      return TextType.h3; // cap at h3
    case 'p':
      return TextType.b1;
    case 'label':
    case 'caption':
    case 'td':
    case 'th':
      return TextType.b2;
    case 'small':
    case 'span':
      return TextType.b3;
    case 'strong':
    case 'b':
      return TextType.b1; // size + bold weight
    case 'em':
    case 'i':
      return TextType.b2;
    case 'code':
    case 'pre':
    case 'blockquote':
      return TextType.b2;
    default:
      return null;
  }
};

const toFontWeight = (htmlTag: string): 'bold' | 'normal' | undefined => {
  if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b'].includes(htmlTag)) return 'bold';
  if (['em', 'i'].includes(htmlTag)) return 'normal';
  return undefined;
};

// ─── Attr converter ──────────────────────────────────────────────────────────

const convertAttrs = (htmlTag: string, attrs: Record<string, string>): Record<string, any> => {
  const out: Record<string, any> = {};

  for (const [key, val] of Object.entries(attrs)) {
    switch (key) {
      case 'class':
        out['className'] = val;
        break;
      case 'style':
        out['style'] = parseInlineStyle(val);
        break;
      case 'src':
        out['src'] = val;
        break;
      case 'href':
        out['data-href'] = val;
        break;
      case 'alt':
        out['alt'] = val;
        break;
      case 'id':
        out['id'] = val;
        break;
      case 'placeholder':
        out['placeholder'] = val;
        break;
      case 'maxlength':
        out['maxlength'] = val;
        break;
      case 'disabled':
        out['disabled'] = true;
        break;
      case 'type':
        if (htmlTag === 'input') out['type'] = val;
        break;
      case 'value':
        if (htmlTag === 'input' || htmlTag === 'textarea') out['value'] = val;
        break;
      case 'onclick':
      case 'onClick':
        // Can't eval string handlers — attach as data attr for manual wiring
        out['data-onclick'] = val;
        break;
      case 'onchange':
      case 'onChange':
        out['data-onchange'] = val;
        break;
      default:
        if (!key.startsWith('on')) {
          out[key] = val;
        }
        break;
    }
  }

  return out;
};

// ─── Lynx tag resolver ───────────────────────────────────────────────────────

const toLynxTag = (htmlTag: string): string => {
  if (BLOCK_TAGS.has(htmlTag)) return 'view';
  if (TEXT_TAGS.has(htmlTag)) return 'text';
  if (htmlTag === 'img') return 'image';
  if (htmlTag === 'input') return 'input';
  if (htmlTag === 'textarea') return 'textarea';
  return 'view';
};

// ─── HTML parser (no DOM dependency) ─────────────────────────────────────────

const parseHtml = (html: string): LynxNode[] => {
  const nodes: LynxNode[] = [];
  const stack: { tag: string; attrs: Record<string, string>; children: LynxNode[] }[] = [];
  let i = 0;

  const current = () => stack[stack.length - 1];
  const push = (node: LynxNode) => {
    if (stack.length > 0) current().children.push(node);
    else nodes.push(node);
  };

  const parseAttrs = (raw: string): Record<string, string> => {
    const result: Record<string, string> = {};
    const re = /([a-zA-Z][a-zA-Z0-9\-:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*)))?/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(raw)) !== null) {
      result[m[1]] = m[2] ?? m[3] ?? m[4] ?? '';
    }
    return result;
  };

  while (i < html.length) {
    if (html[i] === '<') {
      if (html.startsWith('<!--', i)) {
        const end = html.indexOf('-->', i);
        i = end === -1 ? html.length : end + 3;
        continue;
      }

      if (html[i + 1] === '/') {
        const end = html.indexOf('>', i);
        const tag = html
          .slice(i + 2, end)
          .trim()
          .toLowerCase();
        i = end + 1;
        if (stack.length > 0 && current().tag === tag) {
          const { tag: t, attrs, children } = stack.pop()!;
          push({ kind: 'element', tag: t, attrs, children });
        }
        continue;
      }

      const end = html.indexOf('>', i);
      if (end === -1) {
        i++;
        continue;
      }

      const raw = html.slice(i + 1, end);
      const selfClosing = raw.endsWith('/');
      const inner = selfClosing ? raw.slice(0, -1) : raw;
      const spaceIdx = inner.search(/\s/);
      const tag = (spaceIdx === -1 ? inner : inner.slice(0, spaceIdx)).toLowerCase();
      const attrsRaw = spaceIdx === -1 ? '' : inner.slice(spaceIdx + 1);
      const attrs = parseAttrs(attrsRaw);

      i = end + 1;

      if (STRIP_TAGS.has(tag)) {
        const closeTag = `</${tag}>`;
        const closeIdx = html.toLowerCase().indexOf(closeTag, i);
        if (closeIdx !== -1) i = closeIdx + closeTag.length;
        continue;
      }

      if (selfClosing || VOID_TAGS.has(tag)) {
        push({ kind: 'element', tag, attrs, children: [] });
      } else {
        stack.push({ tag, attrs, children: [] });
      }
      continue;
    }

    const next = html.indexOf('<', i);
    const text = html.slice(i, next === -1 ? undefined : next);
    const cleaned = text.replace(/\s+/g, ' ');
    if (cleaned.trim()) push({ kind: 'text', content: cleaned });
    i = next === -1 ? html.length : next;
  }

  while (stack.length > 0) {
    const { tag, attrs, children } = stack.pop()!;
    const node: LynxNode = { kind: 'element', tag, attrs, children };
    if (stack.length > 0) current().children.push(node);
    else nodes.push(node);
  }

  return nodes;
};

// ─── ReactNode generator ─────────────────────────────────────────────────────

let keyCounter = 0;
const nextKey = () => `hlx-${keyCounter++}`;

const renderNode = (node: LynxNode): ReactNode => {
  if (node.kind === 'text') {
    const content = node.content.trim();
    if (!content) return null;
    return content;
  }

  const { tag, attrs, children } = node;
  const key = nextKey();

  // br → newline text
  if (tag === 'br') {
    return <text key={key}>{'\n'}</text>;
  }

  // hr → decorative divider
  if (tag === 'hr') {
    return <view key={key} className="my-2 w-full border-t border-default" />;
  }

  const lynxTag = toLynxTag(tag);
  const lynxAttrs = convertAttrs(tag, attrs);
  const renderedChildren = children.map(renderNode).filter(Boolean);

  // image — self closing
  if (lynxTag === 'image') {
    return <image key={key} {...lynxAttrs} />;
  }

  // input — self closing
  if (lynxTag === 'input') {
    return <input key={key} {...lynxAttrs} />;
  }

  // textarea
  if (lynxTag === 'textarea') {
    return <textarea key={key} {...lynxAttrs} />;
  }

  // text — flatten children to string where possible
  if (lynxTag === 'text') {
    const textType = toTextType(tag);
    const fontWeight = toFontWeight(tag);
    const allText = renderedChildren.every((c) => typeof c === 'string');
    const content = allText ? renderedChildren.join('') : renderedChildren;

    // Use your Text component if we have a known TextType
    if (textType !== null) {
      return (
        <Text key={key} size={textType} fontWeight={fontWeight} {...lynxAttrs}>
          {content}
        </Text>
      );
    }

    // Fallback to raw <text> for tags with no TextType equivalent
    return (
      <text key={key} {...lynxAttrs}>
        {content}
      </text>
    );
  }

  // view — generic block
  return (
    <view key={key} {...lynxAttrs}>
      {renderedChildren}
    </view>
  );
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface HtmlToLynxOptions {
  /** Wrap multiple root nodes in a single <view>. Default: true */
  wrapRoot?: boolean;
  /** Extra className applied to the root wrapper view */
  rootClassName?: string;
}

export const htmlToLynx = (html: string, options: HtmlToLynxOptions = {}): ReactNode => {
  const { wrapRoot = true, rootClassName } = options;

  keyCounter = 0; // reset per call

  const cleaned = html
    .replace(/<!DOCTYPE[^>]*>/i, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/>\s+</g, '><')
    .trim();

  const nodes = parseHtml(cleaned);
  const rendered = nodes.map(renderNode).filter(Boolean);

  if (rendered.length === 0) return null;

  if (rendered.length === 1 && !wrapRoot) return rendered[0];

  return <view className={rootClassName}>{rendered}</view>;
};

// ─── Plain text extractor (unchanged) ────────────────────────────────────────

export const htmlToPlainText = (html: string): string =>
  html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
