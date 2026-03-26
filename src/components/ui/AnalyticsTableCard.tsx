'use client';

import React from 'react';
import { ChartTitleFlagBadge, type ChartCardTitleFlag } from '@/components/ui/ChartTitleFlagBadge';

export default function AnalyticsTableCard({
    title,
    flag = 'green',
    subtitles,
    headerExtra,
    children,
}: {
    title: string;
    flag?: ChartCardTitleFlag;
    /** One or many lines under the title (keeps same typography as existing tables). */
    subtitles?: React.ReactNode;
    /** Optional content inside the header block (e.g. legends). */
    headerExtra?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="glass-panel overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2">
                    {flag && <ChartTitleFlagBadge flag={flag} size="sm" />}
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</h3>
                </div>
                {subtitles}
                {headerExtra}
            </div>
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    );
}

