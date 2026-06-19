import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExamBuilderWorkspaceShell } from './exam-builder-workspace-shell';

describe('ExamBuilderWorkspaceShell', () => {
    it('renders the desktop shell heading and surfaces sidebar content', () => {
        render(
            <ExamBuilderWorkspaceShell sidebar={<div data-testid="sidebar-content">Sidebar</div>}>
                <div data-testid="workspace-content">Workspace</div>
            </ExamBuilderWorkspaceShell>,
        );

        expect(screen.getByRole('heading', { name: 'Exam Builder' })).toBeTruthy();
        expect(screen.getAllByTestId('sidebar-content')).toHaveLength(2);
        expect(screen.getByTestId('workspace-content')).toBeTruthy();
    });
});
