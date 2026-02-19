"use client";

import { AdminEvent } from "../_types";
import { DayCell } from "./day-cell";

interface CalendarGridProps {
     currentMonth: Date;
     calendarDays: Date[];
     getEventsForDate: (date: Date) => AdminEvent[];
     onDayClick: (day: Date) => void;
}

export function CalendarGrid({
     currentMonth,
     calendarDays,
     getEventsForDate,
     onDayClick,
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
                              {calendarDays.map((day) => (
                                   <DayCell
                                        key={day.toString()}
                                        day={day}
                                        currentMonth={currentMonth}
                                        events={getEventsForDate(day)}
                                        onClick={onDayClick}
                                   />
                              ))}
                         </div>
                    </div>
               </div>
          </div>
     );
}
