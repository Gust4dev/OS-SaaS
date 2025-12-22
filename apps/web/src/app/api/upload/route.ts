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

        // Generate unique filename
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/\.[^/.]+$/, '');
        // FORCE .webp extension for consistency if desired, or keep original
        const filename = `${timestamp}-${safeName}.webp`;

        // Upload to S3/Supabase
        // Note: We're assuming the client sends images. If not, we might want to check file.type
        const publicUrl = await uploadFile(buffer, filename, file.type || 'image/webp');

        console.log(`Uploaded file to ${publicUrl}`);

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
    }
}
