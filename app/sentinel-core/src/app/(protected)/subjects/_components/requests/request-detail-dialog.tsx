'use client';

import { EnrollmentRequest } from '@sentinel/shared/types';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Badge,
    Button,
    Separator,
} from '@sentinel/ui';
import {
    useActivePermissions,
    useApproveEnrollmentMutation,
    useRejectEnrollmentMutation,
    useUnapproveEnrollmentMutation,
} from '@sentinel/hooks';
import { Check, X, Calendar, User, BookOpen, Loader2, Undo2 } from 'lucide-react';
import { format } from 'date-fns';

interface RequestDetailDialogProps {
    request: EnrollmentRequest | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function RequestDetailDialog({ request, open, onOpenChange }: RequestDetailDialogProps) {
    const { hasPermission } = useActivePermissions();
    const { mutate: approve, isPending: isApproving } = useApproveEnrollmentMutation();
    const { mutate: reject, isPending: isRejecting } = useRejectEnrollmentMutation();
    const { mutate: unapprove, isPending: isUnapproving } = useUnapproveEnrollmentMutation();

    if (!request) return null;

    const requestIds = request.sections.map((s) => s.request_id);
    const canApproveRequests = hasPermission('subject_offerings:approve');
    const canRejectRequests = hasPermission('subject_offerings:approve');
    const canUnapproveRequests = hasPermission('subject_offerings:approve');

    const handleApprove = () => {
        approve(requestIds, {
            onSuccess: () => onOpenChange(false),
        });
    };

    const handleReject = () => {
        reject(requestIds, {
            onSuccess: () => onOpenChange(false),
        });
    };

    const handleUnapprove = () => {
        unapprove(requestIds, {
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="text-primary h-5 w-5" />
                        Enrollment Request Details
                    </DialogTitle>
                    <DialogDescription>
                        Review the offered-subject enrollment details submitted by the instructor.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Instructor Info */}
                    <div className="flex items-start gap-3">
                        <div className="bg-primary/10 rounded-full p-2">
                            <User className="text-primary h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm leading-none font-medium">Instructor</p>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {request.instructor_name}
                            </p>
                        </div>
                        <Badge
                            variant={
                                request.status === 'PENDING'
                                    ? 'secondary'
                                    : request.status === 'APPROVED'
                                      ? 'default'
                                      : 'destructive'
                            }
                        >
                            {request.status}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Subject Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <BookOpen className="text-primary h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm leading-none font-medium">Subject</p>
                                <p className="text-muted-foreground mt-1 font-mono text-sm">
                                    {request.subject_code}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {request.subject_title}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="bg-primary/10 rounded-full p-2">
                                <Calendar className="text-primary h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm leading-none font-medium">Term</p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {request.term_academic_year}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                    {request.term_semester}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-sm font-medium">Offering Targets</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    Departments
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(request.target_department_codes?.length
                                        ? request.target_department_codes
                                        : request.department_code
                                          ? [request.department_code]
                                          : []
                                    ).map((departmentCode) => (
                                        <Badge key={departmentCode} variant="secondary">
                                            {departmentCode}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                    Courses
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {(request.target_course_codes?.length
                                        ? request.target_course_codes
                                        : request.course_code
                                          ? [request.course_code]
                                          : []
                                    ).map((courseCode) => (
                                        <Badge key={courseCode} variant="secondary">
                                            {courseCode}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Sections */}
                    <div className="space-y-3">
                        <p className="flex items-center gap-2 text-sm font-medium">
                            Requested Sections ({request.sections.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {request.sections.map((section) => (
                                <Badge key={section.request_id} variant="secondary">
                                    {section.section_name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                        <Calendar className="h-3 w-3" />
                        Requested on{' '}
                        {request.created_at ? format(new Date(request.created_at), 'PPP p') : 'N/A'}
                    </div>
                </div>

                {request.status === 'PENDING' && (canApproveRequests || canRejectRequests) && (
                    <div className="mt-4 flex justify-end gap-3">
                        {canRejectRequests ? (
                            <Button
                                variant="outline"
                                className="text-destructive hover:bg-destructive/10"
                                onClick={handleReject}
                                disabled={isRejecting || isApproving || isUnapproving}
                            >
                                {isRejecting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="mr-2 h-4 w-4" />
                                )}
                                Reject All
                            </Button>
                        ) : null}
                        {canApproveRequests ? (
                            <Button
                                onClick={handleApprove}
                                disabled={isRejecting || isApproving || isUnapproving}
                            >
                                {isApproving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="mr-2 h-4 w-4" />
                                )}
                                Approve All
                            </Button>
                        ) : null}
                    </div>
                )}

                {request.status === 'APPROVED' && canUnapproveRequests && (
                    <div className="mt-4 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={handleUnapprove}
                            disabled={isRejecting || isApproving || isUnapproving}
                        >
                            {isUnapproving ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Undo2 className="mr-2 h-4 w-4" />
                            )}
                            Unapprove All
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
