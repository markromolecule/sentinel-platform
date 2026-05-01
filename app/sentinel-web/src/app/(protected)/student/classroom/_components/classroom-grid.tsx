import { type StudentClassroom } from '@sentinel/shared';
import { ClassroomCard } from './classroom-card';

interface ClassroomGridProps {
    classrooms: StudentClassroom[];
    emptyMessage: string;
}

export function ClassroomGrid({ classrooms, emptyMessage }: ClassroomGridProps) {
    if (classrooms.length === 0) {
        return (
            <div className="bg-muted/40 border-border/60 flex flex-col items-center justify-center rounded-none border px-6 py-20 text-center">
                <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-none">
                    <span className="text-muted-foreground text-2xl">🏫</span>
                </div>
                <p className="text-muted-foreground font-medium">{emptyMessage}</p>
                <p className="text-muted-foreground mt-2 max-w-xs text-sm">
                    You are not currently enrolled in any subjects for this term or no subjects
                    match your search.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classrooms.map((classroom) => (
                <ClassroomCard key={classroom.id} classroom={classroom} />
            ))}
        </div>
    );
}
