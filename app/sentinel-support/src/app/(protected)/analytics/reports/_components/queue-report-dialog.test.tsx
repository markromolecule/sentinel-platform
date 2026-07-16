import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QueueReportDialog } from './queue-report-dialog';
import type { Institution } from '@sentinel/shared/types';

describe('QueueReportDialog Component', () => {
    afterEach(() => {
        cleanup();
    });

    const mockInstitutions: Institution[] = [
        { id: 'inst-1', name: 'Institution 1', institutionKind: 'PARENT', status: 'ACTIVE' } as any,
    ];

    it('renders dialog when open', () => {
        const handleOpenChange = vi.fn();
        const handleSubmit = vi.fn();

        render(
            <QueueReportDialog
                isOpen={true}
                onOpenChange={handleOpenChange}
                title="Test Report Title"
                onTitleChange={vi.fn()}
                selectedInstitutionId="inst-1"
                onInstitutionChange={vi.fn()}
                preset="LAST_30_DAYS"
                onPresetChange={vi.fn()}
                startDate=""
                onStartDateChange={vi.fn()}
                endDate=""
                onEndDateChange={vi.fn()}
                validationErrors={[]}
                availableInstitutions={mockInstitutions}
                isInstitutionLocked={false}
                onSubmit={handleSubmit}
                isPending={false}
            />
        );

        expect(screen.getByText('Queue Overall Report')).toBeTruthy();
        expect(screen.getByLabelText('Title')).toBeTruthy();
        expect(screen.getByDisplayValue('Test Report Title')).toBeTruthy();
    });
});
