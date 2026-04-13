import { format } from "date-fns";
import {
     Calendar as CalendarIcon,
     Clock,
     Users,
     Trash2,
} from "lucide-react";
import {
     Sheet,
     SheetContent,
     SheetDescription,
     SheetHeader,
     SheetTitle,
     Button,
} from "@sentinel/ui";
import { CalendarEvent } from "../../types";

interface DayDetailsSheetProps {
     isOpen: boolean;
     onOpenChange: (open: boolean) => void;
     selectedDate: Date | null;
     getEventsForDate: (date: Date) => CalendarEvent[];
     onDeleteEvent?: (id: string) => void;
     renderActions?: () => React.ReactNode;
}

export function DayDetailsSheet({
     isOpen,
     onOpenChange,
     selectedDate,
     getEventsForDate,
     onDeleteEvent,
     renderActions,
}: DayDetailsSheetProps) {
     const events = selectedDate ? getEventsForDate(selectedDate) : [];

     return (
          <Sheet open={isOpen} onOpenChange={onOpenChange}>
               <SheetContent className="overflow-y-auto">
                    <SheetHeader className="mb-6">
                         <SheetTitle className="flex items-center gap-2">
                              <CalendarIcon className="w-5 h-5 text-primary" />
                              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                         </SheetTitle>
                         <SheetDescription>
                              Events scheduled for this day.
                         </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-6">
                         {renderActions && renderActions()}

                         <div className="space-y-4">
                              {events.length === 0 ? (
                                   <div className="text-center py-10 border border-dashed border-border rounded-xl bg-muted/50">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                                             <CalendarIcon className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <p className="text-muted-foreground">No events scheduled</p>
                                   </div>
                              ) : (
                                   events.map((event) => (
                                        <div 
                                             key={event.id} 
                                             className={cn(
                                                  "p-4 rounded-xl bg-card border shadow-sm group relative",
                                                  event.type === 'exam' && "bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-l-amber-500"
                                             )}
                                        >
                                             <div className="flex justify-between items-start mb-2">
                                                  <div className="space-y-1">
                                                       {event.type === 'exam' && (
                                                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 mb-1">
                                                                 <Clock className="w-4 h-4" />
                                                                 <span className="text-xs font-bold uppercase tracking-wider">Exam</span>
                                                            </div>
                                                       )}
                                                       <h3 className="font-bold text-lg text-foreground">{event.title}</h3>
                                                  </div>
                                                  {onDeleteEvent && event.type === 'note' && (
                                                       <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-muted-foreground hover:text-destructive -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => onDeleteEvent(event.id)}
                                                       >
                                                            <Trash2 className="w-4 h-4" />
                                                       </Button>
                                                  )}
                                             </div>

                                             <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2 font-medium">
                                                  {event.type === 'exam' ? (
                                                       <>
                                                            <div className="flex items-center gap-1">
                                                                 <Clock className="w-3 h-3" />
                                                                 {event.duration} mins
                                                            </div>
                                                            {event.studentsCount !== undefined && (
                                                                 <div className="flex items-center gap-1">
                                                                      <Users className="w-3 h-3" />
                                                                      {event.studentsCount} students
                                                                 </div>
                                                            )}
                                                       </>
                                                  ) : (
                                                       (event.startTime || event.endTime) && (
                                                            <div className="flex items-center gap-1 text-primary font-bold">
                                                                 <Clock className="w-3.5 h-3.5" />
                                                                 {event.startTime || "..."} - {event.endTime || "..."}
                                                            </div>
                                                       )
                                                  )}
                                             </div>
                                             {event.description && (
                                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                                       {event.description}
                                                  </p>
                                             )}
                                        </div>
                                   ))
                              )}
                         </div>
                    </div>
               </SheetContent>
          </Sheet>
     );
}

import { cn } from "@sentinel/ui";
