import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('encryption', () => {
    it('should encrypt and decrypt a string correctly', () => {
        const original = 'my-secret-api-key-123';
        const encrypted = encrypt(original);
        const decrypted = decrypt(encrypted);

        expect(decrypted).toBe(original);
    });

    it('should produce different ciphertext for same plaintext (random IV)', () => {
        const original = 'test-value';
        const encrypted1 = encrypt(original);
        const encrypted2 = encrypt(original);

        expect(encrypted1).not.toBe(encrypted2);
    });

    it('should have correct format: iv:authTag:ciphertext', () => {
        const encrypted = encrypt('test');
        const parts = encrypted.split(':');

        expect(parts).toHaveLength(3);
    });

    it('should throw on invalid ciphertext format', () => {
        expect(() => decrypt('invalid')).toThrow('Invalid ciphertext format');
    });

    it('should throw on tampered ciphertext', () => {
        const encrypted = encrypt('test');
        const parts = encrypted.split(':');
        parts[2] = 'tampered' + parts[2];
        const tampered = parts.join(':');

        expect(() => decrypt(tampered)).toThrow();
    });
});
