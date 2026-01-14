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
                            resolve(newFile);
                        } else {
                            reject(new Error('Falha na conversão para WebP. Tente com outro formato de imagem.'));
                        }
                    },
                    'image/webp',
                    quality
                );
            } catch (error) {
                URL.revokeObjectURL(objectUrl);
                reject(error);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Não foi possível carregar a imagem. Verifique se o arquivo é válido.'));
        };

        img.src = objectUrl;
    });
}

export async function convertFileToWebPBase64(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
        // Use FileReader for better iOS Safari compatibility
        const reader = new FileReader();

        reader.onload = () => {
            const img = new Image();

            img.onload = () => {
                try {
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

                    // Fallback to JPEG if WebP not supported (older Safari)
                    if (base64 === 'data:,') {
                        const jpegBase64 = canvas.toDataURL('image/jpeg', quality);
                        resolve(jpegBase64);
                    } else {
                        resolve(base64);
                    }
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Não foi possível carregar a imagem. Tente novamente.'));
            };

            img.src = reader.result as string;
        };

        reader.onerror = () => {
            reject(new Error('Erro ao ler o arquivo. Tente novamente.'));
        };

        reader.readAsDataURL(file);
    });
}

export async function convertUrlToPngBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
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
            reject(e);
        };
    });
}
