"use client";

import { cn } from "@sentinel/ui";
import { format, isToday } from "date-fns";
import { AdminEvent } from '@sentinel/shared/types';

interface DayCellProps {
     day: Date;
     currentMonth: Date;
     events: AdminEvent[];
     onClick: (day: Date) => void;
}

export function DayCell({ day, currentMonth, events, onClick }: DayCellProps) {
     const isCurrentMonth = format(day, "M") === format(currentMonth, "M");
     const isTodayDate = isToday(day);

     return (
          <div
               onClick={() => onClick(day)}
               className={cn(
                    "min-h-[100px] p-2 border-b border-r border-border/50 transition-colors cursor-pointer hover:bg-muted/30 relative group",
                    !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                    isTodayDate && "bg-primary/5"
               )}
          >
               <div className="flex justify-between items-start mb-1">
                    <span
                         className={cn(
                              "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                              isTodayDate
                                   ? "bg-primary text-primary-foreground shadow-sm"
                                   : "text-muted-foreground"
                         )}
                    >
                         {format(day, "d")}
                    </span>
               </div>

               <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                         <div
                              key={event.id}
                              className={cn(
                                   "text-[10px] px-1.5 py-0.5 rounded border truncate font-medium",
                                   event.type === "maintenance" &&
                                   "bg-destructive/10 text-destructive border-destructive/20",
                                   event.type === "announcement" &&
                                   "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                   event.type === "event" &&
                                   "bg-primary/10 text-primary border-primary/20"
                              )}
                         >
                              {event.title}
                         </div>
                    ))}
                    {events.length > 3 && (
                         <div className="text-[10px] text-muted-foreground pl-1">
                              +{events.length - 3} more
                         </div>
                    )}
               </div>
          </div>
     );
}
