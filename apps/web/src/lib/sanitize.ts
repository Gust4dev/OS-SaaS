/**
 * Simple server-safe HTML sanitization without JSDOM dependencies.
 * This avoids the ESM/CommonJS compatibility issues in Vercel serverless.
 */

export function sanitizeHtml(dirty: string): string {
    // Remove all HTML tags
    return dirty
        .replace(/<[^>]*>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .trim();
}

export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}
