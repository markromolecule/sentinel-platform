export type TargetAudience = 'all' | 'students' | 'proctors' | 'specific_group';

/**
 * @deprecated Use CalendarEventResponse instead
 */
export interface AdminEvent {
    id: string;
    date: Date;
    title: string;
    description: string;
    type: 'event' | 'announcement' | 'maintenance';
    targetAudience: TargetAudience;
    startTime?: string;
    endTime?: string;
    createdBy: string;
}

export interface CalendarDay {
    date: Date;
    events: AdminEvent[];
    isCurrentMonth: boolean;
    isToday: boolean;
}

export type CalendarEventType = 'EVENT' | 'ANNOUNCEMENT' | 'MAINTENANCE' | 'HOLIDAY' | 'NOTE';

export type CalendarEventAudience = 'ALL' | 'STUDENTS' | 'INSTRUCTORS' | 'ADMINS' | 'SPECIFIC_GROUP';

export interface CalendarEventResponse {
    eventId: string;
    institutionId: string;
    title: string;
    description: string | null;
    eventType: CalendarEventType;
    targetAudience: CalendarEventAudience;
    startDate: string;
    endDate: string | null;
    startTime: string | null;
    endTime: string | null;
    createdBy: string | null;
    createdByName: string | null;
    createdAt: string;
    updatedAt: string | null;
}
