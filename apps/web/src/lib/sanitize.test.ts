import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeInput } from './sanitize';

describe('sanitize', () => {
    describe('sanitizeHtml', () => {
        it('should remove all HTML tags', () => {
            const dirty = '<script>alert("xss")</script>Hello';
            const clean = sanitizeHtml(dirty);

            expect(clean).toBe('Hello');
        });

        it('should remove nested tags', () => {
            const dirty = '<div><p>Text</p></div>';
            const clean = sanitizeHtml(dirty);

            expect(clean).toBe('Text');
        });

        it('should handle plain text', () => {
            const text = 'Just plain text';
            expect(sanitizeHtml(text)).toBe(text);
        });
    });

    describe('sanitizeInput', () => {
        it('should trim whitespace', () => {
            expect(sanitizeInput('  hello  ')).toBe('hello');
        });

        it('should remove angle brackets', () => {
            expect(sanitizeInput('hello<script>')).toBe('helloscript');
        });

        it('should handle normal input', () => {
            expect(sanitizeInput('John Doe')).toBe('John Doe');
        });
    });
});
