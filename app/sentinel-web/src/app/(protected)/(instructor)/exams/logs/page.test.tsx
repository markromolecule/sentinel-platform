'use client';

import React, { Suspense } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExamIncidentLogsPage from './page';

const mockRefetch = vi.fn();
const mockFetchNextPage = vi.fn();
const mockReviewIncidents = vi.fn();
const mockPush = vi.fn();

const mockSearchParams = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
    useParams: () => ({}),
    usePathname: () => '/exams/logs',
    useSearchParams: () => mockSearchParams(),
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('@sentinel/hooks', () => ({
    useDebounce: (value: any) => value,
    useExamsQuery: () => ({
        data: [
            { id: 'exam-uuid-123', title: 'Midterm Exam', subject: 'CS 101' },
            { id: 'exam-uuid-456', title: 'Final Exam', subject: 'CS 102' },
        ],
        isLoading: false,
    }),
    useExamIncidentsQuery: (examId: string) => ({
        data:
            examId === 'exam-uuid-123'
                ? {
                      pages: [
                          {
                              data: [
                                  {
                                      incidentId: 'incident-uuid-1',
                                      attemptId: 'attempt-1',
                                      examId: 'exam-uuid-123',
                                      studentId: 'student-1',
                                      studentName: 'Juan Dela Cruz',
                                      studentNo: '2024-1001',
                                      incidentType: 'TAB_SWITCH',
                                      severity: 'MEDIUM',
                                      status: 'PENDING',
                                      timestamp: '2026-06-11T22:00:00.000Z',
                                      platform: 'WEB',
                                      source: 'CLIENT',
                                      elapsedSeconds: 120,
                                      evidenceUrl: 'https://example.com/snapshot1.jpg',
                                      details: { tabTitle: 'Google Search' },
                                  },
                                  {
                                      incidentId: 'incident-uuid-3',
                                      attemptId: 'attempt-1',
                                      examId: 'exam-uuid-123',
                                      studentId: 'student-1',
                                      studentName: 'Juan Dela Cruz',
                                      studentNo: '2024-1001',
                                      incidentType: 'LOOKING_AWAY',
                                      severity: 'HIGH',
                                      status: 'PENDING',
                                      timestamp: '2026-06-11T22:01:00.000Z',
                                      platform: 'WEB',
                                      source: 'AI',
                                      elapsedSeconds: 180,
                                      evidenceUrl: null,
                                      details: {},
                                  },
                                  {
                                      incidentId: 'incident-uuid-2',
                                      attemptId: 'attempt-2',
                                      examId: 'exam-uuid-123',
                                      studentId: 'student-2',
                                      studentName: 'Maria Clara',
                                      studentNo: '2024-1002',
                                      incidentType: 'NO_FACE_DETECTED',
                                      severity: 'HIGH',
                                      status: 'CONFIRMED',
                                      timestamp: '2026-06-11T22:05:00.000Z',
                                      platform: 'WEB',
                                      source: 'CLIENT',
                                      elapsedSeconds: 300,
                                      evidenceUrl: null,
                                      details: {},
                                  },
                              ],
                              meta: { total: 3, page: 1, limit: 50, totalPages: 1 },
                          },
                      ],
                  }
                : null,
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: mockRefetch,
        hasNextPage: false,
        fetchNextPage: mockFetchNextPage,
        isFetchingNextPage: false,
    }),
    useExamReportQuery: (examId: string) => ({
        data:
            examId === 'exam-uuid-123'
                ? {
                      students: [
                          { sectionId: 'sec-1', sectionName: 'BSCS 4A' },
                          { sectionId: 'sec-2', sectionName: 'BSCS 4B' },
                      ],
                  }
                : null,
    }),
    useUpdateExamIncidentsMutation: () => ({
        mutateAsync: mockReviewIncidents,
        isPending: false,
    }),
}));

vi.mock('@sentinel/ui', () => ({
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
    PageHeader: ({ title, description, children, className }: any) => (
        <div data-testid="page-header-mock" className={className}>
            <h1>{title}</h1>
            {description && <p>{description}</p>}
            {children}
        </div>
    ),
    Badge: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <span className={className}>{children}</span>
    ),
    Separator: ({ className }: { className?: string }) => (
        <hr className={className} data-testid="separator-mock" />
    ),
    Button: ({
        children,
        onClick,
        disabled,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        disabled?: boolean;
        className?: string;
    }) => (
        <button type="button" onClick={onClick} disabled={disabled} className={className}>
            {children}
        </button>
    ),
    Input: ({
        value,
        onChange,
        placeholder,
        className,
    }: {
        value?: string;
        onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
        placeholder?: string;
        className?: string;
    }) => (
        <input value={value} onChange={onChange} placeholder={placeholder} className={className} />
    ),
    Checkbox: ({
        checked,
        onClick,
        className,
    }: {
        checked?: boolean;
        onClick?: () => void;
        className?: string;
    }) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={() => onClick?.()}
            className={className}
            data-testid="checkbox-mock"
        />
    ),
    Spinner: () => <div data-testid="spinner-mock" />,
    DataTableColumnHeader: ({ title }: any) => <span>{title}</span>,
    DataTable: ({ columns, data, onRowClick, meta, toolbarActions }: any) => {
        return (
            <div data-testid="data-table-wrapper">
                {toolbarActions && <div data-testid="toolbar-actions">{toolbarActions}</div>}
                <table data-testid="data-table-mock">
                    <thead>
                        <tr>
                            {columns.map((col: any, idx: number) => {
                                const headerContent =
                                    typeof col.header === 'function'
                                        ? col.header({
                                              table: {
                                                  getIsAllPageRowsSelected: () => false,
                                                  getIsSomePageRowsSelected: () => false,
                                                  toggleAllPageRowsSelected: () => {},
                                              },
                                          })
                                        : col.header || '';
                                return (
                                    <th key={col.id || col.accessorKey || idx}>{headerContent}</th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row: any, rowIdx: number) => (
                            <tr key={row.incidentId || rowIdx} onClick={() => onRowClick?.(row)}>
                                {columns.map((col: any, colIdx: number) => {
                                    const cellContent =
                                        typeof col.cell === 'function'
                                            ? col.cell({
                                                  row: {
                                                      original: row,
                                                      getValue: (key: string) =>
                                                          row[key as keyof typeof row],
                                                      getIsSelected: () => false,
                                                      toggleSelected: () => {},
                                                  },
                                                  table: {
                                                      options: { meta },
                                                  },
                                              })
                                            : row[col.accessorKey] || '';
                                    return (
                                        <td key={col.id || col.accessorKey || colIdx}>
                                            {cellContent}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    },
    Popover: ({ children, open, onOpenChange }: any) => (
        <div data-testid="popover-mock" data-open={open}>
            {children}
        </div>
    ),
    PopoverTrigger: ({ children }: any) => <>{children}</>,
    PopoverContent: ({ children }: any) => <div data-testid="popover-content">{children}</div>,
    Command: ({ children }: any) => <div data-testid="command-mock">{children}</div>,
    CommandInput: ({ placeholder, value, onChange }: any) => (
        <input
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            data-testid="command-input"
        />
    ),
    CommandList: ({ children }: any) => <div>{children}</div>,
    CommandEmpty: ({ children }: any) => <div>{children}</div>,
    CommandGroup: ({ children }: any) => <div>{children}</div>,
    CommandItem: ({ children, onSelect }: any) => (
        <div onClick={onSelect} data-testid="command-item">
            {children}
        </div>
    ),
    Select: ({
        value,
        onValueChange,
        children,
    }: {
        value?: string;
        onValueChange?: (value: string) => void;
        children: React.ReactNode;
    }) => (
        <select value={value} onChange={(event) => onValueChange?.(event.target.value)}>
            {children}
        </select>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
        <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    SelectValue: () => null,
    Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
    TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    TableCell: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <td className={className}>{children}</td>
    ),
    TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
    TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    TableRow: ({
        children,
        onClick,
        className,
    }: {
        children: React.ReactNode;
        onClick?: () => void;
        className?: string;
    }) => (
        <tr onClick={onClick} className={className}>
            {children}
        </tr>
    ),
    Sheet: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
        open ? <div data-testid="sheet-mock">{children}</div> : null,
    SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    SheetTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    SheetDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
    Textarea: ({
        value,
        onChange,
        placeholder,
        className,
        disabled,
    }: {
        value?: string;
        onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
        placeholder?: string;
        className?: string;
        disabled?: boolean;
    }) => (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
            disabled={disabled}
        />
    ),
}));

vi.mock('sonner', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('ExamIncidentLogsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
        document.body.innerHTML = '';
    });

    it('renders empty state when no exam is selected', async () => {
        mockSearchParams.mockReturnValue(new URLSearchParams());

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <ExamIncidentLogsPage />
            </Suspense>,
        );

        // Verify page header is rendered
        expect(screen.getByText('Incident Logs & Analytics')).toBeTruthy();

        // Verify card selection grid is displayed
        expect(screen.getByText('Midterm Exam')).toBeTruthy();
        expect(screen.getByText('Final Exam')).toBeTruthy();

        // Verify combobox is NOT present since no exam is selected yet
        const select = screen.queryByRole('combobox');
        expect(select).toBeNull();
    });

    it('changes URL search params when selecting an exam from cards grid', async () => {
        mockSearchParams.mockReturnValue(new URLSearchParams());

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <ExamIncidentLogsPage />
            </Suspense>,
        );

        // Find the card for 'Midterm Exam' (exam-uuid-123) and click it
        const card = screen.getByTestId('exam-card-exam-uuid-123');

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockPush).toHaveBeenCalledWith('/exams/logs?examId=exam-uuid-123');
    });

    it('renders filters, list logs, and student details when examId exists in URL', async () => {
        mockSearchParams.mockReturnValue(new URLSearchParams({ examId: 'exam-uuid-123' }));

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <ExamIncidentLogsPage />
            </Suspense>,
        );

        // Verify students list
        expect(screen.getAllByText('Juan Dela Cruz')[0]).toBeTruthy();
        expect(screen.getAllByText('Maria Clara')[0]).toBeTruthy();

        // Verify severities list
        expect(screen.getAllByText('MEDIUM')[0]).toBeTruthy();
        expect(screen.getAllByText('HIGH')[0]).toBeTruthy();
    });

    it('groups incidents by student and compiles log summary when toggle is clicked', async () => {
        mockSearchParams.mockReturnValue(new URLSearchParams({ examId: 'exam-uuid-123' }));

        render(
            <Suspense fallback={<div>Loading...</div>}>
                <ExamIncidentLogsPage />
            </Suspense>,
        );

        // Before grouping: Verify there are 3 rows in the table body (excluding header row)
        // Since we mock DataTable, let's query row elements in tbody
        const tableWrapper = screen.getByTestId('data-table-wrapper');
        const rowsBefore = tableWrapper.querySelectorAll('tbody tr');
        expect(rowsBefore.length).toBe(3);

        // Verify the toggle button initially says 'All Logs'
        const toggleButton = screen.getByText('All Logs');
        expect(toggleButton).toBeTruthy();

        // Click the toggle button to switch to 'Grouped by Student'
        await act(async () => {
            fireEvent.click(toggleButton);
        });

        // Verify the toggle button text updated to 'Grouped by Student'
        expect(screen.getByText('Grouped by Student')).toBeTruthy();

        // After grouping: Verify the rows have been merged to 2
        const rowsAfter = tableWrapper.querySelectorAll('tbody tr');
        expect(rowsAfter.length).toBe(2);

        // Juan Dela Cruz has 2 compiled alerts with highest severity HIGH
        // Verify '2 alerts' is rendered in the table cell
        expect(screen.getByText('2 alerts')).toBeTruthy();

        // Maria Clara has 1 compiled alert
        expect(screen.getByText('1 alert')).toBeTruthy();
    });
});
