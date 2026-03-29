"use client";

import { useInstitutionsQuery } from "@sentinel/hooks";
import { Card, CardContent, CardHeader, Badge } from "@sentinel/ui";
import { Building2, Calendar, User } from "lucide-react";

export function RecentInstitutionsWidget() {
    const { data: institutions = [], isLoading } = useInstitutionsQuery();

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <h3 className="text-sm font-semibold">Registered Institutions</h3>
                    </div>
                </CardHeader>
                <CardContent className="py-8 text-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Registered Institutions</h3>
                </div>
                <Badge variant="secondary" className="text-xs h-5">
                    {institutions.length} Total
                </Badge>
            </CardHeader>
            <CardContent className="py-0 px-0">
                <div className="divide-y">
                    {institutions.slice(0, 5).map((institution) => (
                        <div key={institution.id} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{institution.name}</span>
                                        <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-4">
                                            {institution.code}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        <span className="flex items-center gap-1 mt-1">
                                            <User className="h-3 w-3" />
                                            {institution.createdBy || "System Superadmin"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                <Calendar className="h-3 w-3" />
                                {institution.createdAt ? new Date(institution.createdAt).toLocaleDateString() : 'N/A'}
                            </div>
                        </div>
                    ))}
                    {institutions.length === 0 && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No institutions registered yet.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

