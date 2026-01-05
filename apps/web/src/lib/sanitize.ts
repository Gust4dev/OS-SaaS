import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] });
}

export function sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
}
