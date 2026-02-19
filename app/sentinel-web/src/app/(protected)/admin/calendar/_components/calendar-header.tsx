"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format } from "date-fns";

interface CalendarHeaderProps {
     currentMonth: Date;
     onPreviousMonth: () => void;
     onNextMonth: () => void;
     onAddEvent: () => void;
}

export function CalendarHeader({
     currentMonth,
     onPreviousMonth,
     onNextMonth,
     onAddEvent,
}: CalendarHeaderProps) {
     return (
          <div className="flex items-center gap-2">
               <Button onClick={onAddEvent} className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
               </Button>
               <div className="flex items-center border rounded-md bg-card">
                    <Button variant="ghost" size="icon" onClick={onPreviousMonth}>
                         <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-4 font-semibold min-w-[140px] text-center">
                         {format(currentMonth, "MMMM yyyy")}
                    </div>
                    <Button variant="ghost" size="icon" onClick={onNextMonth}>
                         <ChevronRight className="h-4 w-4" />
                    </Button>
               </div>
          </div>
     );
}
