import { Card, CardContent, CardHeader, CardTitle } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Trash2 } from 'lucide-react';
import { useSubjectStore } from '@/stores/use-subject-store';
import { type Subject } from '@sentinel/shared/types';

interface SubjectCardProps {
    subject: Subject;
}

export function SubjectCard({ subject }: SubjectCardProps) {
    const removeSubject = useSubjectStore((state) => state.removeSubject);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{subject.code}</CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-8 w-8 hover:text-red-500"
                    onClick={() => removeSubject(subject.id)}
                >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove subject</span>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{subject.title}</div>
                <p className="text-muted-foreground mt-1 text-xs">Section: {subject.section}</p>
            </CardContent>
        </Card>
    );
}
