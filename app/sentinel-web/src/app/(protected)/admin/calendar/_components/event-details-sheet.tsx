"use client";

import {
     Sheet,
     SheetContent,
     SheetDescription,
     SheetHeader,
     SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, Trash2, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AdminEvent } from "../_types";

interface EventDetailsSheetProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     selectedDate: Date | null;
     getEventsForDate: (date: Date) => AdminEvent[];
     onAddEvent: () => void;
     onDeleteEvent: (id: string) => void;
}

export function EventDetailsSheet({
     open,
     onOpenChange,
     selectedDate,
     getEventsForDate,
     onAddEvent,
     onDeleteEvent,
}: EventDetailsSheetProps) {
     const events = selectedDate ? getEventsForDate(selectedDate) : [];

     return (
          <Sheet open={open} onOpenChange={onOpenChange}>
               <SheetContent className="overflow-y-auto">
                    <SheetHeader className="mb-6">
                         <SheetTitle className="flex items-center gap-2">
                              <CalendarIcon className="w-5 h-5 text-primary" />
                              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                         </SheetTitle>
                         <SheetDescription>
                              Events and announcements for this day.
                         </SheetDescription>
                    </SheetHeader>

                    {selectedDate && (
                         <div className="space-y-6">
                              <Button
                                   className="w-full"
                                   onClick={() => {
                                        onOpenChange(false);
                                        onAddEvent();
                                   }}
                              >
                                   <Plus className="w-4 h-4 mr-2" />
                                   Add Event
                              </Button>

                              <div className="space-y-4">
                                   {events.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                             No events planned
                                        </div>
                                   ) : (
                                        events.map((event) => (
                                             <div
                                                  key={event.id}
                                                  className="p-4 rounded-lg bg-card border shadow-sm group relative"
                                             >
                                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                       <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-destructive"
                                                            onClick={(e) => {
                                                                 e.stopPropagation();
                                                                 onDeleteEvent(event.id);
                                                            }}
                                                       >
                                                            <Trash2 className="w-3 h-3" />
                                                       </Button>
                                                  </div>
                                                  <div className="flex items-center gap-2 mb-2">
                                                       <span
                                                            className={cn(
                                                                 "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded",
                                                                 event.type === "maintenance" &&
                                                                 "bg-destructive/10 text-destructive",
                                                                 event.type === "announcement" &&
                                                                 "bg-amber-500/10 text-amber-600",
                                                                 event.type === "event" &&
                                                                 "bg-primary/10 text-primary"
                                                            )}
                                                       >
                                                            {event.type}
                                                       </span>
                                                       {event.targetAudience !== "all" && (
                                                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                                                                 <Users className="w-3 h-3" />
                                                                 {event.targetAudience}
                                                            </span>
                                                       )}
                                                  </div>
                                                  <h3 className="font-semibold text-base mb-1">
                                                       {event.title}
                                                  </h3>
                                                  {(event.startTime || event.endTime) && (
                                                       <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                                            <Clock className="w-3 h-3" />
                                                            {event.startTime || "--:--"} -{" "}
                                                            {event.endTime || "--:--"}
                                                       </div>
                                                  )}
                                                  <p className="text-sm text-muted-foreground">
                                                       {event.description}
                                                  </p>
                                             </div>
                                        ))
                                   )}
                              </div>
                         </div>
                    )}
               </SheetContent>
          </Sheet>
     );
}
