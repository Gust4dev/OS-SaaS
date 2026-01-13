import { PrismaClient } from '@prisma/client';
import { createCipheriv, randomBytes, scryptSync } from 'crypto';

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) throw new Error('ENCRYPTION_KEY not configured');
    const salt = process.env.ENCRYPTION_SALT || 'autevo-default-salt';
    return scryptSync(key, salt, 32);
}

function encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const key = getKey();
    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

function isEncrypted(value: string): boolean {
    return value.includes(':') && value.split(':').length === 3;
}

async function migratePixKeys() {
    console.log('🔐 Starting pixKey encryption migration...\n');

    const tenants = await prisma.tenant.findMany({
        where: {
            pixKey: { not: null }
        },
        select: {
            id: true,
            name: true,
            pixKey: true
        }
    });

    console.log(`Found ${tenants.length} tenants with pixKey\n`);

    let migrated = 0;
    let skipped = 0;

    for (const tenant of tenants) {
        if (!tenant.pixKey) continue;

        if (isEncrypted(tenant.pixKey)) {
            console.log(`⏭️  Skipping ${tenant.name} - already encrypted`);
            skipped++;
            continue;
        }

        const encryptedPixKey = encrypt(tenant.pixKey);

        await prisma.tenant.update({
            where: { id: tenant.id },
            data: { pixKey: encryptedPixKey }
        });

        console.log(`✅ Migrated ${tenant.name}`);
        migrated++;
    }

    console.log(`\n📊 Migration complete:`);
    console.log(`   Migrated: ${migrated}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Total:    ${tenants.length}`);
}

migratePixKeys()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
