import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { DashboardLayoutItem, DashboardWidgetId } from '@sentinel/shared/types';
import { arrayMove } from '@dnd-kit/sortable';

export type DashboardLayoutStoreState = {
    layoutItems: DashboardLayoutItem[];
};

export type DashboardLayoutStoreActions = {
    reorderWidgets: (activeId: DashboardWidgetId, overId: DashboardWidgetId) => void;
    resetLayout: () => void;
};

export type DashboardLayoutStore = DashboardLayoutStoreState & DashboardLayoutStoreActions;

export const DEFAULT_DASHBOARD_LAYOUT: DashboardLayoutItem[] = [
    { id: 'kpi-carousel', visible: true },
    { id: 'chart-group', visible: true },
    { id: 'recent-institutions', visible: true },
    { id: 'active-sessions', visible: true },
    { id: 'flagged-incidents', visible: true },
    { id: 'system-activity', visible: true },
];

export const DEFAULT_DASHBOARD_LAYOUT_STORE_STATE: DashboardLayoutStoreState = {
    layoutItems: DEFAULT_DASHBOARD_LAYOUT,
};

/**
 * Zustand store for managing the layout and order of dashboard widgets.
 * Persists layout configurations to local storage.
 */
export const useDashboardLayoutStore = create<DashboardLayoutStore>()(
    persist(
        immer((set) => ({
            ...DEFAULT_DASHBOARD_LAYOUT_STORE_STATE,

            reorderWidgets: (activeId, overId) => {
                set((state) => {
                    const activeIndex = state.layoutItems.findIndex((item) => item.id === activeId);
                    const overIndex = state.layoutItems.findIndex((item) => item.id === overId);

                    if (activeIndex !== -1 && overIndex !== -1) {
                        state.layoutItems = arrayMove(state.layoutItems, activeIndex, overIndex);
                    }
                });
            },

            resetLayout: () => {
                set((state) => {
                    state.layoutItems = DEFAULT_DASHBOARD_LAYOUT;
                });
            },
        })),
        {
            name: 'sentinel-dashboard-layout-storage',
        },
    ),
);
