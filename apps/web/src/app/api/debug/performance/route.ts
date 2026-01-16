import { NextResponse } from 'next/server';
import { getAllStats, clearStats } from '@/lib/benchmark';

export async function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Performance endpoint only available in development' },
            { status: 403 }
        );
    }

    const stats = getAllStats();

    const bottleneckThresholds = {
        critical: 1000,
        warning: 500,
        acceptable: 200,
    };

    const categorized = {
        critical: stats.filter(s => s.avg >= bottleneckThresholds.critical),
        warning: stats.filter(s => s.avg >= bottleneckThresholds.warning && s.avg < bottleneckThresholds.critical),
        acceptable: stats.filter(s => s.avg >= bottleneckThresholds.acceptable && s.avg < bottleneckThresholds.warning),
        fast: stats.filter(s => s.avg < bottleneckThresholds.acceptable),
    };

    return NextResponse.json({
        timestamp: new Date().toISOString(),
        thresholds: bottleneckThresholds,
        summary: {
            total: stats.length,
            critical: categorized.critical.length,
            warning: categorized.warning.length,
            acceptable: categorized.acceptable.length,
            fast: categorized.fast.length,
        },
        stats: categorized,
    });
}

export async function DELETE() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { error: 'Performance endpoint only available in development' },
            { status: 403 }
        );
    }

    clearStats();
    return NextResponse.json({ success: true, message: 'Stats cleared' });
}
