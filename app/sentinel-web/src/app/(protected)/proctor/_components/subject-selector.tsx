"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
     Command,
     CommandEmpty,
     CommandGroup,
     CommandInput,
     CommandItem,
     CommandList,
} from "@/components/ui/command";
import {
     Popover,
     PopoverContent,
     PopoverTrigger,
} from "@/components/ui/popover";
import type { MasterSubject } from "@/app/(protected)/admin/subjects/_types";

interface SubjectSelectorProps {
     subjects: MasterSubject[];
     selectedSubjectCode: string;
     onSelect: (value: string) => void;
}

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
          <Popover open={open} onOpenChange={setOpen}>
               <PopoverTrigger asChild>
                    <Button
                         variant="outline"
                         role="combobox"
                         aria-expanded={open}
                         className="w-full justify-between"
                    >
                         {selectedSubjectCode
                              ? `${selectedSubject?.code} - ${selectedSubject?.title}`
                              : "Select subject..."}
                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
               </PopoverTrigger>
               <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                         <CommandInput placeholder="Search subject..." />
                         <CommandList>
                              <CommandEmpty>No subject found.</CommandEmpty>
                              <CommandGroup>
                                   {subjects.map((subject) => (
                                        <CommandItem
                                             key={subject.code}
                                             value={subject.code}
                                             onSelect={(currentValue) => {
                                                  onSelect(currentValue === selectedSubjectCode ? "" : currentValue);
                                                  setOpen(false);
                                             }}
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
