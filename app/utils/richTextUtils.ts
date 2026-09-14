/**
 * Utility functions for rich text processing, sanitization, and plain-text extraction.
 */

/**
 * Checks if a string contains HTML tags.
 */
export function isHtml(str: string | undefined | null): boolean {
    if (!str) return false;
    return /<[a-z][\s\S]*>/i.test(str);
}

/**
 * Strips HTML tags and decodes common HTML entities for plain-text use
 * (e.g. Google Calendar descriptions, search indexing, plain text emails).
 */
export function stripHtml(html: string | undefined | null): string {
    if (!html) return "";
    return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<\/div>/gi, "\n")
        .replace(/<\/h[1-6]>/gi, "\n\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/**
 * Basic safe sanitizer for rich text HTML.
 * Strips dangerous tags (script, iframe, object, embed, etc.) and event handlers (onload, onerror, onclick).
 * Preserves safe formatting, styles (colors, fonts, alignments), links, and data:image / http(s) images.
 */
export function sanitizeHtml(html: string | undefined | null): string {
    if (!html) return "";

    // Remove script, iframe, object, embed, form, link, style tags and their contents
    let clean = html.replace(/<(script|iframe|object|embed|form|link|style|meta|base)[^>]*>[\s\S]*?<\/\1>/gi, "");
    // Remove self-closing dangerous tags
    clean = clean.replace(/<(script|iframe|object|embed|form|link|style|meta|base)[^>]*\/?>/gi, "");
    // Remove inline event handlers like onclick, onerror, onload, etc.
    clean = clean.replace(/\s+on[a-z]+\s*=\s*(['\"][^'\"]*['\"]|[^\s>]+)/gi, "");
    // Remove javascript: and vbscript: URIs
    clean = clean.replace(/(href|src)\s*=\s*(['\"])\s*(javascript|vbscript):[\s\S]*?\2/gi, '$1="#"');

    return clean;
}
