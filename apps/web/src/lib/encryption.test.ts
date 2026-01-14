import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { encrypt, decrypt } from './encryption';

describe('encryption', () => {
    beforeEach(() => {
        process.env.ENCRYPTION_KEY = 'test-encryption-key-must-be-32-bytes-exactly!';
        process.env.ENCRYPTION_SALT = 'test-salt-must-be-16-bytes';
    });

    afterEach(() => {
        delete process.env.ENCRYPTION_KEY;
        delete process.env.ENCRYPTION_SALT;
    });

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

    it('should throw on encryption if keys missing', () => {
        delete process.env.ENCRYPTION_KEY;
        expect(() => encrypt('test')).toThrow('ENCRYPTION_KEY not configured');
    });

    it('should throw on invalid ciphertext format', () => {
        expect(() => decrypt('invalid')).toThrow('Invalid ciphertext format');
    });

    it('should throw on tampered ciphertext', () => {
        const encrypted = encrypt('test');
        const parts = encrypted.split(':');
        // Modify the auth tag (middle part)
        parts[1] = 'a'.repeat(32);
        const tampered = parts.join(':');

        expect(() => decrypt(tampered)).toThrow();
    });
});
