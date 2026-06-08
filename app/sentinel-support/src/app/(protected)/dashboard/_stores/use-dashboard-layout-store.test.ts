// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
    useDashboardLayoutStore,
    DEFAULT_DASHBOARD_LAYOUT_STORE_STATE,
    DEFAULT_DASHBOARD_LAYOUT,
} from './use-dashboard-layout-store';

describe('useDashboardLayoutStore', () => {
    beforeEach(() => {
        useDashboardLayoutStore.setState(DEFAULT_DASHBOARD_LAYOUT_STORE_STATE);
    });

    it('initializes with the default layout state', () => {
        const state = useDashboardLayoutStore.getState();
        expect(state.layoutItems).toEqual(DEFAULT_DASHBOARD_LAYOUT);
    });

    it('reorders widgets correctly when reorderWidgets is called', () => {
        // Initial layout is DEFAULT_DASHBOARD_LAYOUT:
        // ['kpi-carousel', 'chart-group', 'recent-institutions', 'active-sessions', 'flagged-incidents', 'system-activity']
        useDashboardLayoutStore.getState().reorderWidgets('kpi-carousel', 'flagged-incidents');

        const state = useDashboardLayoutStore.getState();
        // 'kpi-carousel' (index 0) was moved to index 4 (where 'flagged-incidents' was)
        expect(state.layoutItems[0].id).toBe('chart-group');
        expect(state.layoutItems[4].id).toBe('kpi-carousel');
    });

    it('resets the layout to default when resetLayout is called', () => {
        // Change state first
        useDashboardLayoutStore.getState().reorderWidgets('kpi-carousel', 'system-activity');
        
        // Ensure it changed
        expect(useDashboardLayoutStore.getState().layoutItems[0].id).not.toBe('kpi-carousel');

        // Reset
        useDashboardLayoutStore.getState().resetLayout();

        const state = useDashboardLayoutStore.getState();
        expect(state.layoutItems).toEqual(DEFAULT_DASHBOARD_LAYOUT);
    });
});
