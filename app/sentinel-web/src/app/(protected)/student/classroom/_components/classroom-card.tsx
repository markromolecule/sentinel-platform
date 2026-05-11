import { Card, CardContent } from '@sentinel/ui';
import { BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { type StudentClassroom } from '@sentinel/shared';
import Link from 'next/link';

interface ClassroomCardProps {
    classroom: StudentClassroom;
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
    return (
        <Link href={`/student/classroom/${classroom.id}`}>
            <Card className="hover:border-primary/50 group overflow-hidden rounded-none transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-4">
                    <div className="flex flex-col gap-3">
                        {/* Header Info */}
                        <div className="flex items-start justify-between">
                            <div className="bg-primary/10 text-primary group-hover:bg-primary flex h-10 w-10 items-center justify-center rounded-none transition-colors group-hover:text-white">
                                <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                                {classroom.subjectCode}
                            </div>
                        </div>

                        {/* Title & Section */}
                        <div className="space-y-0.5">
                            <h3 className="group-hover:text-primary line-clamp-1 text-base font-bold transition-colors">
                                {classroom.subjectTitle}
                            </h3>
                            <p className="text-muted-foreground text-xs font-medium">
                                Section {classroom.sectionName}
                            </p>
                        </div>

                        {/* Details Footer */}
                        <div className="border-border/50 mt-1 flex flex-col gap-1.5 border-t pt-3">
                            <div className="flex items-center gap-2">
                                <GraduationCap className="text-muted-foreground h-3.5 w-3.5" />
                                <span className="text-muted-foreground text-xs">
                                    {classroom.instructors?.length > 0
                                        ? classroom.instructors.join(', ')
                                        : 'No assigned instructor'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="text-muted-foreground h-3.5 w-3.5" />
                                <span className="text-muted-foreground text-xs">
                                    {classroom.term}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
