/**
 * Simple server-safe HTML sanitization without JSDOM dependencies.
 * This avoids the ESM/CommonJS compatibility issues in Vercel serverless.
 */

export function sanitizeHtml(dirty: string): string {
    // Basic protection against XSS
    let clean = dirty;

    // Remove entire script and style tags and their content
    clean = clean.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gm, "");
    clean = clean.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gm, "");

    // Remove other tags but keep their content
    clean = clean.replace(/<[^>]*>/g, '');

    return clean
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
