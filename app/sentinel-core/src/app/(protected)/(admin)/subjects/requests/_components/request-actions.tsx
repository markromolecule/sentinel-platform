import { EnrollmentRequest } from "@sentinel/shared/types";
import { Eye } from "lucide-react";
import { useState } from "react";
import { Button } from "@sentinel/ui";
import { RequestDetailDialog } from "./request-detail-dialog";

export function RequestActions({ request }: { request: EnrollmentRequest }) {
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="flex items-center gap-2 text-primary bg-primary/5 hover:bg-primary/10 px-3"
                    onClick={() => setIsDetailOpen(true)}
                >
                    <Eye className="h-4 w-4" />
                    Details
                </Button>
            </div>

            <RequestDetailDialog 
                request={request}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </>
    );
}
