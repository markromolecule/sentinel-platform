/**
 * Represents a KPI metric card displayed on the support dashboard.
 */
export interface SupportKpiCard {
    id: string;
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
    icon?: string;
}

/**
 * Represents a platform activity event displayed on the support dashboard.
 */
export interface PlatformActivity {
    id: string;
    actor: string;
    action: string;
    institutionName: string;
    timestamp: string;
    type: 'info' | 'warning' | 'error' | 'success';
}

/**
 * Identifies a specific widget on the support dashboard.
 */
export type DashboardWidgetId =
    | 'kpi-carousel'
    | 'chart-group'
    | 'recent-institutions'
    | 'active-sessions'
    | 'flagged-incidents'
    | 'system-activity';

/**
 * Represents a layout configuration item for the support dashboard.
 */
export interface DashboardLayoutItem {
    id: DashboardWidgetId;
    visible?: boolean;
}
