// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ChartGroupPanel } from './chart-group-panel';

// Mock Recharts to avoid layout issues in JSDOM
vi.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: ReactNode }) => children,
    LineChart: ({ children, data }: { children: ReactNode; data: unknown }) => (
        <div data-testid="line-chart" data-data={JSON.stringify(data)}>
            {children}
        </div>
    ),
    Bar: () => <div data-testid="bar" />,
    Line: () => <div data-testid="line" />,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
    Legend: () => null,
}));

// Mock @sentinel/ui Tabs components to work reliably in test environment
vi.mock('@sentinel/ui', async () => {
    const actual = await vi.importActual<typeof import('@sentinel/ui')>('@sentinel/ui');
    const TabsContext = React.createContext<{
        value: string;
        onValueChange: (value: string) => void;
    } | null>(null);

    return {
        ...actual,
        Tabs: ({
            value,
            defaultValue,
            onValueChange,
            children,
        }: {
            value?: string;
            defaultValue?: string;
            onValueChange?: (value: string) => void;
            children: ReactNode;
        }) => {
            const [val, setVal] = React.useState(value || defaultValue || '');
            const handleChange = (newVal: string) => {
                setVal(newVal);
                onValueChange?.(newVal);
            };
            return (
                <TabsContext.Provider value={{ value: val, onValueChange: handleChange }}>
                    <div>{children}</div>
                </TabsContext.Provider>
            );
        },
        TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
        TabsTrigger: ({ value, children }: { value: string; children: ReactNode }) => {
            const context = React.useContext(TabsContext);
            return (
                <button
                    role="tab"
                    aria-selected={context?.value === value}
                    onClick={() => context?.onValueChange(value)}
                >
                    {children}
                </button>
            );
        },
        TabsContent: ({ value, children }: { value: string; children: ReactNode }) => {
            const context = React.useContext(TabsContext);
            if (context?.value !== value) return null;
            return <div>{children}</div>;
        },
    };
});

const mockExamData = [
    { name: 'Mon', completed: 10, dropped: 2 },
    { name: 'Tue', completed: 15, dropped: 1 },
];

const mockIncidentData = [
    { name: 'Week 1', incidents: 5 },
    { name: 'Week 2', incidents: 8 },
];

describe('ChartGroupPanel', () => {
    it('renders and displays Exam Completion tab by default', () => {
        render(<ChartGroupPanel examData={mockExamData} incidentData={mockIncidentData} />);

        expect(screen.getByText('Exam Completion')).toBeDefined();
        expect(screen.getByText('Incident Trends')).toBeDefined();

        expect(screen.getByText('Exam Completion Snapshot')).toBeDefined();
        expect(screen.getByText('Current scope')).toBeDefined();
        expect(screen.getByText('Completion rate')).toBeDefined();

        expect(screen.queryByText('Weekly volume of flagged integrity incidents')).toBeNull();
    });

    it('clicking Incident Trends tab switches display to Incident Trends chart', async () => {
        render(<ChartGroupPanel examData={mockExamData} incidentData={mockIncidentData} />);

        const trigger = screen.getByText('Incident Trends');
        fireEvent.click(trigger);

        expect(screen.getByText('Weekly volume of flagged integrity incidents')).toBeDefined();
        expect(screen.getByTestId('line-chart')).toBeDefined();

        expect(screen.queryByText('Exam Completion Snapshot')).toBeNull();
    });
});
