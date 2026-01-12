import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,

    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        optimizePackageImports: [
            'lucide-react',
            'recharts',
            '@radix-ui/react-icons',
            'framer-motion',
            'date-fns',
            '@tanstack/react-query',
        ],
    },

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
            { protocol: 'https', hostname: 'img.clerk.com' },
        ],
    },

    transpilePackages: ['@autevo/database'],

    async headers() {
        return [{
            source: '/:path*',
            headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            ],
        }];
    },
};

export default nextConfig;
