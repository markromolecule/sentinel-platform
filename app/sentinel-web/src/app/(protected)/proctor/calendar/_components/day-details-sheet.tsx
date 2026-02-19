import { format } from "date-fns";
import {
     Calendar as CalendarIcon,
     Clock,
     Users,
} from "lucide-react";
import {
     Sheet,
     SheetContent,
     SheetDescription,
     SheetHeader,
     SheetTitle,
} from "@/components/ui/sheet";
import { CalendarEvent } from "../_hooks/use-calendar";

interface DayDetailsSheetProps {
     isOpen: boolean;
     onOpenChange: (open: boolean) => void;
     selectedDate: Date | null;
     getEventsForDate: (date: Date) => CalendarEvent[];
}

export function DayDetailsSheet({
     isOpen,
     onOpenChange,
     selectedDate,
     getEventsForDate,
}: DayDetailsSheetProps) {
     return (
          <Sheet open={isOpen} onOpenChange={onOpenChange}>
               <SheetContent className="overflow-y-auto">
                    <SheetHeader className="mb-6">
                         <SheetTitle className="flex items-center gap-2">
                              <CalendarIcon className="w-5 h-5 text-primary" />
                              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
                         </SheetTitle>
                         <SheetDescription>
                              scheduled exams for this day.
                         </SheetDescription>
                    </SheetHeader>

                    {selectedDate && (
                         <div className="space-y-6">
                              <div className="space-y-4">
                                   {getEventsForDate(selectedDate).length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                                             No exams scheduled
                                        </div>
                                   ) : (
                                        getEventsForDate(selectedDate).map((event) => (
                                             <div key={event.id} className="p-4 rounded-lg bg-card border shadow-sm">
                                                  <h3 className="font-semibold text-base mb-1">{event.title}</h3>
                                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                                       <div className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {event.duration} mins
                                                       </div>
                                                       <div className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {event.studentsCount} students
                                                       </div>
                                                  </div>
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
