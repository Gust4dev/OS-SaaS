import { NextResponse } from 'next/server';
import { prisma } from '@autevo/database';

export async function HEAD() {
    return new Response(null, { status: 200 });
}

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    const hasValidAuth = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    try {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        const latency = Date.now() - start;

        return NextResponse.json({
            status: 'ok',
            latency,
            timestamp: new Date().toISOString(),
            authenticated: hasValidAuth,
        });
    } catch (error) {
        return NextResponse.json(
            { status: 'error', error: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
