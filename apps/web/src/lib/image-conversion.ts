
/**
 * Utility functions for image conversion and processing.
 * Focuses on converting all uploads to WebP for efficient storage
 * and providing compatibility layers for PDF generation.
 */

/**
 * Converts a File object to a WebP File object.
 * For PNGs with transparency, fills with white background since WebP
 * doesn't always handle alpha channel consistently across browsers.
 * @param file The original file (PNG, JPEG, etc.)
 * @param quality Quality from 0 to 1 (default 0.8)
 * @returns Promise<File> The converted WebP file
 */
export async function convertFileToWebP(file: File, quality = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    URL.revokeObjectURL(objectUrl);
                    reject(new Error('Não foi possível criar o contexto do canvas'));
                    return;
                }

                // For PNG files, fill with white background to handle transparency
                // This prevents issues with alpha channel in WebP conversion
                if (file.type === 'image/png') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        URL.revokeObjectURL(objectUrl);

                        if (blob) {
                            const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                            const newFile = new File([blob], newName, { type: 'image/webp' });
                            console.log(`[Image Conversion] Converted ${file.name} (${file.size} bytes) to WebP (${newFile.size} bytes)`);
                            resolve(newFile);
                        } else {
                            console.error('[Image Conversion] canvas.toBlob returned null');
                            reject(new Error('Falha na conversão para WebP. Tente com outro formato de imagem.'));
                        }
                    },
                    'image/webp',
                    quality
                );
            } catch (error) {
                URL.revokeObjectURL(objectUrl);
                console.error('[Image Conversion] Error during conversion:', error);
                reject(error);
            }
        };

        img.onerror = (error) => {
            URL.revokeObjectURL(objectUrl);
            console.error('[Image Conversion] Failed to load image:', error);
            reject(new Error('Não foi possível carregar a imagem. Verifique se o arquivo é válido.'));
        };

        img.src = objectUrl;
    });
}

/**
 * Converts a File object directly to a WebP Base64 string.
 * Useful for tRPC mutations that expect a string payload.
 * @param file The original file
 * @param quality Quality from 0 to 1 (default 0.8)
 * @returns Promise<string> Base64 string (data:image/webp;base64,...)
 */
export async function convertFileToWebPBase64(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/webp', quality);
            resolve(base64);
            URL.revokeObjectURL(img.src);
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(img.src);
            reject(error);
        };
    });
}

/**
 * Converts an image URL (e.g., a stored WebP image) to a PNG Base64 string.
 * This is CRITICAL for @react-pdf/renderer which often struggles with WebP.
 * @param url The URL of the image
 * @returns Promise<string> Base64 string (data:image/png;base64,...)
 */
export async function convertUrlToPngBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Required for external/local images to allow canvas export
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);
            const base64 = canvas.toDataURL('image/png');
            resolve(base64);
        };
        img.onerror = (e) => {
            // If strict CORS fails, we might try fetching as blob, but for now reject
            console.error('Failed to convert URL to PNG', e);
            reject(e);
        };
    });
}
