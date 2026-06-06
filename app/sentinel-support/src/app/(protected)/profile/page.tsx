'use client';

import { useState } from 'react';
import { useProfileQuery, useUpdatePasswordMutation } from '@sentinel/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@sentinel/ui';
import { Separator } from '@sentinel/ui';
import { Lock } from 'lucide-react';
import { Input } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Label } from '@sentinel/ui';
import { toast } from 'sonner';

export default function SupportProfilePage() {
    const { profile, isLoading } = useProfileQuery();
    const updatePasswordMutation = useUpdatePasswordMutation();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password) {
            toast.error('Password cannot be empty');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        updatePasswordMutation.mutate(
            { password },
            {
                onSuccess: () => {
                    toast.success('Password updated successfully');
                    setPassword('');
                    setConfirmPassword('');
                },
                onError: (error: Error) => {
                    toast.error(error.message || 'Failed to update password');
                },
            },
        );
    };

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-3xl animate-pulse space-y-8 p-6">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="bg-muted h-24 w-24 rounded-full" />
                    <div className="bg-muted h-6 w-48 rounded" />
                    <div className="bg-muted h-4 w-32 rounded" />
                </div>
                <Card className="bg-card border-border/50 text-foreground overflow-hidden">
                    <CardHeader>
                        <div className="bg-muted h-6 w-40 rounded" />
                    </CardHeader>
                    <CardContent className="bg-muted/20 h-48" />
                </Card>
            </div>
        );
    }

    const initials = `${profile?.firstName?.[0] || ''}${profile?.lastName?.[0] || ''}`;

    return (
        <div className="container mx-auto max-w-3xl space-y-8 p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="from-primary to-primary/80 text-primary-foreground ring-border/10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold shadow-2xl ring-4">
                    {initials}
                </div>
                <div className="text-center">
                    <h1 className="text-foreground text-2xl font-bold">
                        {profile?.firstName} {profile?.lastName}
                    </h1>
                    <p className="text-muted-foreground">{profile?.email}</p>
                </div>
            </div>

            <Card className="bg-card border-border/50 text-foreground overflow-hidden">
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                First Name
                            </label>
                            <p className="text-lg font-medium">{profile?.firstName || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Last Name
                            </label>
                            <p className="text-lg font-medium">{profile?.lastName || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Role
                            </label>
                            <p className="text-lg font-medium capitalize">{profile?.role || '-'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Institution
                            </label>
                            <p className="text-primary text-lg font-medium">
                                {profile?.institution || '-'}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border/50 text-foreground overflow-hidden">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="bg-destructive/20 flex h-10 w-10 items-center justify-center rounded-full">
                            <Lock className="text-destructive h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Security</CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Manage your account password
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Enter new password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button
                                type="submit"
                                disabled={updatePasswordMutation.isPending}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {updatePasswordMutation.isPending
                                    ? 'Updating...'
                                    : 'Update Password'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
