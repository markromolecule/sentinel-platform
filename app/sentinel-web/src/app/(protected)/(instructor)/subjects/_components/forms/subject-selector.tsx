"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import {
     Command,
     CommandEmpty,
     CommandGroup,
     CommandInput,
     CommandItem,
     CommandList,
} from "@sentinel/ui";
import {
     Popover,
     PopoverContent,
     PopoverTrigger,
} from "@sentinel/ui";
import { type SubjectSelectorProps } from "@/app/(protected)/(instructor)/subjects/_components/forms/_types";

export function SubjectSelector({
     subjects,
     selectedSubjectCode,
     onSelect,
}: SubjectSelectorProps) {
     const [open, setOpen] = useState(false);

     const selectedSubject = subjects.find(
          (subject) => subject.code === selectedSubjectCode
     );

     return (
          <Popover open={open} onOpenChange={setOpen} modal={true}>
               <PopoverTrigger asChild>
                    <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={open}
                         className="w-full justify-between min-w-0"
                    >
                         <span className="truncate text-left mr-2 flex-1">
                              {selectedSubject
                                   ? `${selectedSubject.code} - ${selectedSubject.title}`
                                   : "Select subject..."}
                         </span>
                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
               </PopoverTrigger>

               <PopoverContent
                    className="w-[--radix-popover-trigger-width] p-0 z-[100] pointer-events-auto"
                    align="start"
               >
                    <Command>
                         <CommandInput placeholder="Search subject..." />
                         <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                              <CommandEmpty>No subject found.</CommandEmpty>
                              <CommandGroup>
                                   {subjects.map((subject) => (
                                        <CommandItem
                                             key={subject.code}
                                             value={`${subject.code} ${subject.title}`}
                                             onSelect={() => {
                                                  onSelect(subject.code === selectedSubjectCode ? "" : subject.code);
                                                  setOpen(false);
                                             }}
                                             className="cursor-pointer pointer-events-auto data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                                        >
                                             <Check
                                                  className={cn(
                                                       "mr-2 h-4 w-4",
                                                       selectedSubjectCode === subject.code
                                                            ? "opacity-100"
                                                            : "opacity-0"
                                                  )}
                                             />
                                             <div className="flex flex-col">
                                                  <span className="font-medium">{subject.code}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                       {subject.title}
                                                  </span>
                                             </div>
                                        </CommandItem>
                                   ))}
                              </CommandGroup>
                         </CommandList>
                    </Command>
               </PopoverContent>
          </Popover>
     );
}