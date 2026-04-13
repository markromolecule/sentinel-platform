export type CalendarEvent = {
    id: string;
    title: string;
    date: Date;
    type: 'exam' | 'note' | string;
    description: string;
    duration?: number;
    studentsCount?: number;
    startTime?: string;
    endTime?: string;
};
