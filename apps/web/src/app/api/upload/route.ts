import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/storage';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
        const filename = `${timestamp}-${safeName}.webp`;
        const contentType = file.type || 'image/webp';

        const publicUrl = await uploadFile(buffer, filename, contentType);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('[Upload API] Upload failed:', errorMessage);

        return NextResponse.json({
            success: false,
            error: 'Upload failed',
            details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
    }
}
