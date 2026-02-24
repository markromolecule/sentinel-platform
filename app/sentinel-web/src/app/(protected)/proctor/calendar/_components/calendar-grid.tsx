import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarEvent } from "@/app/(protected)/proctor/calendar/_types";

interface CalendarGridProps {
     currentMonth: Date;
     calendarDays: Date[];
     onDayClick: (day: Date) => void;
     getEventsForDate: (date: Date) => CalendarEvent[];
}

export function CalendarGrid({
     currentMonth,
     calendarDays,
     onDayClick,
     getEventsForDate,
}: CalendarGridProps) {
     const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

     return (
          <div className="flex-1 bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col">
               <div className="overflow-x-auto flex-1 flex flex-col">
                    <div className="min-w-[800px] flex-1 flex flex-col">
                         {/* Days Header */}
                         <div className="grid grid-cols-7 border-b border-border bg-muted/40">
                              {weekDays.map((day) => (
                                   <div
                                        key={day}
                                        className="py-3 text-center text-sm font-medium text-muted-foreground"
                                   >
                                        {day}
                                   </div>
                              ))}
                         </div>

                         {/* Days Grid */}
                         <div className="grid grid-cols-7 flex-1 auto-rows-fr bg-background">
                              {calendarDays.map((day) => {
                                   const dayEvents = getEventsForDate(day);
                                   const isCurrentMonth =
                                        format(day, "M") === format(currentMonth, "M");

                                   return (
                                        <div
                                             key={day.toString()}
                                             onClick={() => onDayClick(day)}
                                             className={cn(
                                                  "min-h-[100px] p-2 border-b border-r border-border/50 transition-colors cursor-pointer hover:bg-muted/30 relative group",
                                                  !isCurrentMonth && "bg-muted/10 text-muted-foreground",
                                                  isToday(day) && "bg-primary/5"
                                             )}
                                        >
                                             <div className="flex justify-between items-start mb-1">
                                                  <span
                                                       className={cn(
                                                            "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                                                            isToday(day)
                                                                 ? "bg-primary text-primary-foreground shadow-sm"
                                                                 : "text-muted-foreground"
                                                       )}
                                                  >
                                                       {format(day, "d")}
                                                  </span>
                                             </div>

                                             <div className="space-y-1">
                                                  {dayEvents.slice(0, 3).map(event => (
                                                       <div key={event.id} className="text-[10px] px-1.5 py-0.5 rounded border truncate font-medium bg-primary/10 text-primary border-primary/20">
                                                            {event.title}
                                                       </div>
                                                  ))}
                                                  {dayEvents.length > 3 && (
                                                       <div className="text-[10px] text-muted-foreground pl-1">
                                                            +{dayEvents.length - 3} more
                                                       </div>
                                                  )}
                                             </div>
                                        </div>
                                   );
                              })}
                         </div>
                    </div>
               </div>
          </div>
     );
}
