
/**

 * WebP Conversion Script

 * Converts all PNG/JPEG images to WebP format for better mobile performance.

 * Original files are kept as fallback.

 *

 * Usage: node scripts/convert-webp.cjs

 */

  

const fs = require('fs');

const path = require('path');

  

let sharp;

try {

    sharp = require('sharp');

} catch (e) {

    console.error('\x1b[31m%s\x1b[0m', 'Erro: A biblioteca "sharp" não está instalada.');

    console.log('Por favor, execute "npm install sharp" antes de rodar este script.');

    process.exit(1);

}

  

const TARGET_DIR = path.join(__dirname, 'apps', 'web', 'public', 'qrcode');

const QUALITY = 80;

const MAX_WIDTH = 1920;

  

const formatBytes = (bytes) => (bytes / 1024).toFixed(2) + ' KB';

  

let totalOriginalSize = 0;

let totalNewSize = 0;

let convertedCount = 0;

let skippedCount = 0;

  

async function convertToWebp(filePath) {

    try {

        const ext = path.extname(filePath).toLowerCase();

        if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  

        const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Skip if WebP already exists and is newer than source

        if (fs.existsSync(webpPath)) {

            const srcStat = fs.statSync(filePath);

            const webpStat = fs.statSync(webpPath);

            if (webpStat.mtime > srcStat.mtime) {

                console.log(`\x1b[33m• Ignorado (WebP já existe):\x1b[0m ${path.relative(TARGET_DIR, filePath)}`);

                skippedCount++;

                return;

            }

        }

  

        const originalSize = fs.statSync(filePath).size;

        let pipeline = sharp(filePath);

        const metadata = await pipeline.metadata();

        // Resize if too large

        if (metadata.width > MAX_WIDTH) {

            pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });

        }

  

        // Convert to WebP

        const buffer = await pipeline

            .webp({ quality: QUALITY, effort: 6 })

            .toBuffer();

  

        const newSize = buffer.length;

  

        fs.writeFileSync(webpPath, buffer);

  

        totalOriginalSize += originalSize;

        totalNewSize += newSize;

        convertedCount++;

  

        const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);

        console.log(`\x1b[32m✔ Convertido:\x1b[0m ${path.relative(TARGET_DIR, filePath)} → .webp (${formatBytes(originalSize)} → ${formatBytes(newSize)}, -${savings}%)`);

  

    } catch (error) {

        console.error(`\x1b[31m✖ Erro ao converter ${path.basename(filePath)}:\x1b[0m`, error.message);

    }

}

  

async function walkDir(dir) {

    let files;

    try {

        files = fs.readdirSync(dir);

    } catch (e) {

        console.error(`Erro ao ler diretório ${dir}`);

        return;

    }

  

    for (const file of files) {

        const filePath = path.join(dir, file);

        let stat;

        try {

            stat = fs.statSync(filePath);

        } catch (e) { continue; }

  

        if (stat.isDirectory()) {

            await walkDir(filePath);

        } else if (/\.(jpg|jpeg|png)$/i.test(file)) {

            await convertToWebp(filePath);

        }

    }

}

  

(async () => {

    sharp.cache(false);

    console.log('');

    console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════');

    console.log('\x1b[36m%s\x1b[0m', '       WEBP CONVERSION SCRIPT');

    console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════');

    console.log(`Diretório: ${TARGET_DIR}`);

    console.log(`Qualidade: ${QUALITY}% | Max Width: ${MAX_WIDTH}px`);

    console.log('─'.repeat(50));

    console.log('');

  

    await walkDir(TARGET_DIR);

  

    console.log('');

    console.log('─'.repeat(50));

    console.log('\x1b[36m%s\x1b[0m', 'RESUMO:');

    console.log(`  Convertidos: ${convertedCount} arquivos`);

    console.log(`  Ignorados:   ${skippedCount} arquivos`);

    if (convertedCount > 0) {

        const totalSavings = ((totalOriginalSize - totalNewSize) / totalOriginalSize * 100).toFixed(1);

        console.log(`  Economia:    ${formatBytes(totalOriginalSize - totalNewSize)} total (-${totalSavings}%)`);

    }

    console.log('\x1b[32m%s\x1b[0m', '\n✔ Conversão concluída!');

    console.log('\x1b[33m%s\x1b[0m', 'Lembre-se de atualizar constants.ts para usar .webp');

    console.log('');

})();