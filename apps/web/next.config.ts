import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,

    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
    },

    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.r2.cloudflarestorage.com',
            },
            {
                protocol: 'https',
                hostname: 'img.clerk.com',
            },
        ],
    },

    // Transpile packages from monorepo
    transpilePackages: ['@filmtech/database'],
};

export default nextConfig;
