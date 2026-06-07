'use client';

import { useUserQuery } from '@sentinel/hooks';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    Badge,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Separator,
    Skeleton,
    cn,
} from '@sentinel/ui';
import { Building, Mail, GraduationCap, Award, User } from 'lucide-react';

interface ParticipantProfileDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    participantId: string | null;
    connectionStatus?: 'online' | 'offline' | 'busy';
}

/**
 * Renders the content of the profile dialog, handling data fetching and loading states.
 *
 * @param props Component properties containing the participant ID.
 * @returns React element representing the dialog content.
 */
function ProfileDialogContent({
    participantId,
    connectionStatus,
}: {
    participantId: string;
    connectionStatus?: 'online' | 'offline' | 'busy';
}) {
    const { data: user, isLoading, error } = useUserQuery(participantId);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <DialogHeader className="text-left">
                    <DialogTitle>Participant Profile</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-3.5 w-16" />
                            <Skeleton className="h-4 w-28" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="space-y-4 py-6 text-center">
                <DialogHeader className="text-left">
                    <DialogTitle>Participant Profile</DialogTitle>
                </DialogHeader>
                <p className="text-muted-foreground text-sm">
                    Failed to load user profile. Please try again.
                </p>
            </div>
        );
    }

    const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || (user as Record<string, unknown>).name || 'Anonymous User';

    const initials = displayName !== 'Anonymous User'
        ? displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
        : user.email.slice(0, 2).toUpperCase();

    const status = connectionStatus || user.status;
    const isOnline = status?.toLowerCase() === 'online' || status?.toLowerCase() === 'active';
    const isBusy = status?.toLowerCase() === 'busy';

    // Map role to user friendly label
    const roleLabels: Record<string, string> = {
        admin: 'Admin',
        proctor: 'Proctor',
        student: 'Student',
        instructor: 'Instructor',
    };

    return (
        <div className="space-y-6">
            <DialogHeader className="text-left">
                <DialogTitle>Participant Profile</DialogTitle>
            </DialogHeader>

            <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={user.avatarUrl || undefined} alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                    <h2 className="text-lg font-bold leading-none">{displayName}</h2>
                    <p className="text-muted-foreground text-xs">{user.email}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                        <Badge variant="secondary" className="capitalize text-[10px] font-semibold">
                            {roleLabels[user.role] || user.role}
                        </Badge>
                        <Badge
                            variant={isOnline ? 'outline' : 'secondary'}
                            className={cn(
                                'text-[10px] font-semibold capitalize',
                                isOnline && 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/10',
                                isBusy && 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/10',
                            )}
                        >
                            {status}
                        </Badge>
                    </div>
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                <div>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <Building className="h-3.5 w-3.5" /> Institution
                    </span>
                    <p className="text-foreground mt-1 text-sm font-medium">
                        {user.institution || '-'}
                    </p>
                </div>

                <div>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <Award className="h-3.5 w-3.5" /> Department
                    </span>
                    <p className="text-foreground mt-1 text-sm font-medium">
                        {user.department || '-'}
                    </p>
                </div>

                <div>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <GraduationCap className="h-3.5 w-3.5" /> Course
                    </span>
                    <p className="text-foreground mt-1 text-sm font-medium">
                        {user.courses && user.courses.length > 0
                            ? user.courses.join(', ')
                            : user.course || '-'}
                    </p>
                </div>

                <div>
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <User className="h-3.5 w-3.5" /> ID Number
                    </span>
                    <p className="text-foreground mt-1 text-sm font-medium">
                        {user.role === 'student'
                            ? user.studentNo || '-'
                            : user.employeeNo || '-'}
                    </p>
                </div>

                <div className="sm:col-span-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <Mail className="h-3.5 w-3.5" /> Primary Email
                    </span>
                    <p className="text-foreground mt-1 text-sm font-medium">
                        {user.email}
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Dialog component to display the profile details of a conversation participant.
 *
 * @param props Component properties.
 * @returns Dialog containing user profile metadata.
 */
export function ParticipantProfileDialog({
    open,
    onOpenChange,
    participantId,
    connectionStatus,
}: ParticipantProfileDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] p-6">
                {open && participantId ? (
                    <ProfileDialogContent
                        participantId={participantId}
                        connectionStatus={connectionStatus}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
