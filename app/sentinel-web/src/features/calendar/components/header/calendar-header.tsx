import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@sentinel/ui";

interface CalendarHeaderProps {
     currentMonth: Date;
     onPreviousMonth: () => void;
     onNextMonth: () => void;
}

export function CalendarHeader({
     currentMonth,
     onPreviousMonth,
     onNextMonth,
}: CalendarHeaderProps) {
     return (
          <div className="flex items-center border rounded-md bg-card">
               <Button
                    variant="ghost"
                    size="icon"
                    onClick={onPreviousMonth}
               >
                    <ChevronLeft className="h-4 w-4" />
               </Button>
               <div className="px-4 font-semibold min-w-[140px] text-center">
                    {format(currentMonth, "MMMM yyyy")}
               </div>
               <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNextMonth}
               >
                    <ChevronRight className="h-4 w-4" />
               </Button>
          </div>
     );
}
