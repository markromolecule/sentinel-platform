import { fireEvent, render, screen } from '@testing-library/react';
import { Eye } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import {
    StudentFlowDevicePreviewPanel,
    StudentFlowDisclosureList,
    StudentFlowFooterActions,
    StudentFlowHighlightsList,
    StudentFlowPageHeader,
    StudentFlowPanel,
    StudentFlowSplitLayout,
} from './student-flow-primitives';

describe('student flow primitives', () => {
    it('renders the shared page header and highlights grid', () => {
        render(
            <div>
                <StudentFlowPageHeader title="Orientation" description="Start here" />
                <StudentFlowHighlightsList
                    highlights={[{ label: 'Duration', value: '60m', icon: Eye }]}
                    columns={2}
                />
            </div>,
        );

        expect(screen.getByText('Orientation')).toBeTruthy();
        expect(screen.getByText('Start here')).toBeTruthy();
        expect(screen.getByText('Duration')).toBeTruthy();
        expect(screen.getByText('60m')).toBeTruthy();
    });

    it('renders the shared panel and split layout wrappers', () => {
        render(
            <StudentFlowSplitLayout>
                <StudentFlowPanel>Left panel</StudentFlowPanel>
                <StudentFlowPanel>Right panel</StudentFlowPanel>
            </StudentFlowSplitLayout>,
        );

        expect(screen.getByText('Left panel')).toBeTruthy();
        expect(screen.getByText('Right panel')).toBeTruthy();
    });

    it('renders disclosures and footer actions with callbacks', () => {
        const onContinue = vi.fn();

        render(
            <div>
                <StudentFlowDisclosureList
                    items={[{ label: 'Gaze', desc: 'Tracking is enabled.', icon: Eye }]}
                />
                <StudentFlowFooterActions
                    primaryLabel="Continue"
                    primaryOnClick={onContinue}
                    secondaryLabel="Back"
                    secondaryHref="/student/exam/demo/instruction"
                />
            </div>,
        );

        expect(screen.getByText('Gaze')).toBeTruthy();
        expect(screen.getByText('Tracking is enabled.')).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: /continue/i }));
        expect(onContinue).toHaveBeenCalledTimes(1);
    });

    it('renders the shared device preview panel empty state', () => {
        render(
            <StudentFlowDevicePreviewPanel
                videoRef={{ current: null }}
                overlayCanvasRef={{ current: null }}
                streamActive={false}
                isRequesting={false}
                errorMessage={null}
                onRequestAccess={() => undefined}
            />,
        );

        expect(screen.getByText('Camera Preview')).toBeTruthy();
        expect(screen.getByRole('button', { name: /grant device permissions/i })).toBeTruthy();
    });
});
