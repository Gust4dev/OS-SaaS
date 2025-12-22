import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize S3 Client (works with Supabase, R2, AWS, MinIO)
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.AWS_ENDPOINT!, // REQUIRED for Supabase/R2
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true, // Needed for some S3 compatible providers
});

export async function uploadFile(
    file: Buffer | Uint8Array,
    filename: string,
    contentType: string
): Promise<string> {
    const bucket = process.env.AWS_BUCKET_NAME;

    if (!bucket) {
        throw new Error('AWS_BUCKET_NAME is not defined');
    }

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: file,
        ContentType: contentType,
        // ACL: 'public-read', // Supabase buckets are usually public via policy, but some providers need this
    });

    await s3Client.send(command);

    // Construct Public URL
    // For Supabase: https://[PROJECT_ID].supabase.co/storage/v1/object/public/[BUCKET]/[FILENAME]
    // But we can usually rely on the endpoint structure if it's standard S3 
    // Or we manually construct if we know it's supabase.

    // Better Approach: Use a public URL env var or construct from endpoint
    // If endpoint is https://[id].supabase.co/storage/v1/s3
    // Public URL is  https://[id].supabase.co/storage/v1/object/public/[BUCKET]/[FILENAME]

    if (process.env.AWS_ENDPOINT?.includes('supabase.co')) {
        const baseUrl = process.env.AWS_ENDPOINT.replace('/s3', '/object/public');
        return `${baseUrl}/${bucket}/${filename}`;
    }

    // Fallback for generic S3 (might not be correct for all providers without custom domain)
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}
