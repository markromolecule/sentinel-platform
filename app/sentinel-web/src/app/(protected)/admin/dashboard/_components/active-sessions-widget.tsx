"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, User, Clock, Monitor } from "lucide-react";
import { ActiveSession } from "@sentinel/shared/src/types";
import { MOCK_ACTIVE_SESSIONS } from "@sentinel/shared/src/mock-data";

export function ActiveSessionsWidget() {
    const getStatusBadge = (status: ActiveSession["status"]) => {
        switch (status) {
            case "live":
                return <Badge className="bg-green-500 hover:bg-green-600 px-1.5 py-0 text-[10px] h-5">Live</Badge>;
            case "paused":
                return <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-5">Paused</Badge>;
            case "reviewing":
                return <Badge variant="outline" className="px-1.5 py-0 text-[10px] h-5">Reviewing</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-3">
                <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    <h3 className="text-sm font-semibold">Active Sessions</h3>
                </div>
                <Badge variant="secondary" className="text-xs h-5">
                    {MOCK_ACTIVE_SESSIONS.filter(s => s.status === "live").length} Live
                </Badge>
            </CardHeader>
            <CardContent className="py-0 px-0">
                <div className="divide-y">
                    {MOCK_ACTIVE_SESSIONS.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3 text-sm hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{session.studentName}</span>
                                        {getStatusBadge(session.status)}
                                    </div>
                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        <span className="flex items-center gap-1">
                                            <Monitor className="h-3 w-3" />
                                            {session.examName}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            {session.proctorName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                                <Clock className="h-3 w-3" />
                                {session.duration}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
