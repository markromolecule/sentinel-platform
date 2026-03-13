"use client";

import { Card, CardContent, CardHeader } from "@sentinel/ui";
import { Badge } from "@sentinel/ui";
import { Building2, Calendar, User } from "lucide-react";
import { MOCK_INSTITUTIONS } from '@sentinel/shared/mock-data';

export function RecentInstitutionsWidget() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Registered Institutions</h3>
                </div>
                <Badge variant="secondary" className="text-xs h-5">
                    {MOCK_INSTITUTIONS.length} Total
                </Badge>
            </CardHeader>
            <CardContent className="py-0 px-0">
                <div className="divide-y">
                    {MOCK_INSTITUTIONS.slice(0, 5).map((institution) => (
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
                                            {institution.createdBy}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                <Calendar className="h-3 w-3" />
                                {new Date(institution.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
