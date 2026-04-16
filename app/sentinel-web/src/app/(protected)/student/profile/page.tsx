'use client';

import { MOCK_STUDENT } from '@sentinel/shared/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@sentinel/ui';
import { Separator } from '@sentinel/ui';
import { Lock } from 'lucide-react';
import { Input } from '@sentinel/ui';
import { Button } from '@sentinel/ui';
import { Label } from '@sentinel/ui';

export default function StudentProfilePage() {
    return (
        <div className="container mx-auto max-w-3xl space-y-8 p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="from-primary to-primary/80 text-primary-foreground ring-border/10 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br text-3xl font-bold shadow-2xl ring-4">
                    {MOCK_STUDENT.firstName[0]}
                    {MOCK_STUDENT.lastName[0]}
                </div>
                <div className="text-center">
                    <h1 className="text-foreground text-2xl font-bold">
                        {MOCK_STUDENT.firstName} {MOCK_STUDENT.lastName}
                    </h1>
                    <p className="text-muted-foreground">{MOCK_STUDENT.email}</p>
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
                            <p className="text-lg font-medium">{MOCK_STUDENT.firstName}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Last Name
                            </label>
                            <p className="text-lg font-medium">{MOCK_STUDENT.lastName}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Student Number
                            </label>
                            <p className="text-lg font-medium">{MOCK_STUDENT.studentNumber}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                                Department
                            </label>
                            <p className="text-lg font-medium">{MOCK_STUDENT.department}</p>
                        </div>
                    </div>

                    <Separator className="bg-border" />

                    <div className="space-y-1">
                        <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                            Institution
                        </label>
                        <p className="text-primary text-lg font-medium">
                            {MOCK_STUDENT.institution}
                        </p>
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
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Current Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter current password"
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Enter new password"
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-foreground/80">Confirm New Password</Label>
                                <Input
                                    type="password"
                                    placeholder="Confirm new password"
                                    className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                Update Password
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
