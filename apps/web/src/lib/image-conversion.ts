
/**
 * Utility functions for image conversion and processing.
 * Focuses on converting all uploads to WebP for efficient storage
 * and providing compatibility layers for PDF generation.
 */

/**
 * Converts a File object to a WebP File object.
 * @param file The original file (PNG, JPEG, etc.)
 * @param quality Quality from 0 to 1 (default 0.8)
 * @returns Promise<File> The converted WebP file
 */
export async function convertFileToWebP(file: File, quality = 0.8): Promise<File> {
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
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a new file with .webp extension
                        const newName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
                        const newFile = new File([blob], newName, { type: 'image/webp' });
                        resolve(newFile);
                    } else {
                        reject(new Error('Conversion to WebP failed'));
                    }
                    URL.revokeObjectURL(img.src);
                },
                'image/webp',
                quality
            );
        };
        img.onerror = (error) => {
            URL.revokeObjectURL(img.src);
            reject(error);
        };
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
