"use client";

import { Checkbox } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { ScrollArea } from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import type { Section } from '@sentinel/shared/types';;

interface SectionSelectorProps {
     sections: Section[];
     selectedSectionIds: string[];
     onToggle: (sectionId: string) => void;
     onSelectAll: () => void;
}

export function SectionSelector({
     sections,
     selectedSectionIds,
     onToggle,
     onSelectAll,
}: SectionSelectorProps) {

     const isAllSelected = sections.length > 0 && selectedSectionIds.length === sections.length;

     return (
          <div className="grid gap-2 animate-in fade-in-0 slide-in-from-top-2">
               <div className="flex items-center justify-between">
                    <Label>Select Sections</Label>
                    <Button
                         type="button"
                         variant="ghost"
                         size="sm"
                         className="h-auto p-0 text-xs text-blue-600"
                         onClick={onSelectAll}
                    >
                         {isAllSelected ? "Deselect All" : "Select All"}
                    </Button>
               </div>
               <div className="border rounded-md">
                    <ScrollArea className="h-[200px] p-4">
                         {sections.length > 0 ? (
                              <div className="space-y-3">
                                   {sections.map((section) => (
                                        <div key={section.id} className="flex items-center space-x-2">
                                             <Checkbox
                                                  id={section.id}
                                                  checked={selectedSectionIds.includes(section.id)}
                                                  onCheckedChange={() => onToggle(section.id)}
                                             />
                                             <Label
                                                  htmlFor={section.id}
                                                  className="flex-1 cursor-pointer font-normal"
                                             >
                                                  {section.name}
                                             </Label>
                                        </div>
                                   ))}
                              </div>
                         ) : (
                              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                   No sections allocated to this subject.
                              </div>
                         )}
                    </ScrollArea>
               </div>
               <div className="text-xs text-muted-foreground text-right">
                    {selectedSectionIds.length} selected
               </div>
          </div>
     );
}
