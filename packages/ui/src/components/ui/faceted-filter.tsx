import * as React from "react"
import { Check, PlusCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"
import { Button } from "./button"
import {
     Command,
     CommandEmpty,
     CommandGroup,
     CommandInput,
     CommandItem,
     CommandList,
     CommandSeparator,
} from "./command"
import {
     Popover,
     PopoverContent,
     PopoverTrigger,
} from "./popover"
import { Separator } from "./separator"

export interface FacetedFilterOption {
     label: string
     value: string
     icon?: React.ComponentType<{ className?: string }>
}

export interface FacetedFilterProps {
     title?: string
     options: FacetedFilterOption[]
     selectedValues?: Set<string>
     onSelect?: (value: string) => void
     onClear?: () => void
     counts?: Map<string, number>
}

export function FacetedFilter({
     title,
     options,
     selectedValues = new Set(),
     onSelect,
     onClear,
     counts,
}: FacetedFilterProps) {
     return (
          <Popover modal={true}>
               <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                         <PlusCircle className="mr-2 h-4 w-4" />
                         {title}
                         {selectedValues?.size > 0 && (
                              <>
                                   <Separator orientation="vertical" className="mx-2 h-4" />
                                   <Badge
                                        variant="secondary"
                                        className="rounded-sm px-1 font-normal lg:hidden"
                                   >
                                        {selectedValues.size}
                                   </Badge>
                                   <div className="hidden space-x-1 lg:flex">
                                        {selectedValues.size > 2 ? (
                                             <Badge
                                                  variant="secondary"
                                                  className="rounded-sm px-1 font-normal"
                                             >
                                                  {selectedValues.size} selected
                                             </Badge>
                                        ) : (
                                             options
                                                  .filter((option) => selectedValues.has(option.value))
                                                  .map((option) => (
                                                       <Badge
                                                            variant="secondary"
                                                            key={option.value}
                                                            className="rounded-sm px-1 font-normal"
                                                       >
                                                            {option.label}
                                                       </Badge>
                                                  ))
                                        )}
                                   </div>
                              </>
                         )}
                    </Button>
               </PopoverTrigger>
               <PopoverContent className="w-[200px] p-0 pointer-events-auto" align="start">
                    <Command>
                         <CommandInput placeholder={title} />
                         <CommandList>
                              <CommandEmpty>No results found.</CommandEmpty>
                              <CommandGroup>
                                   {options.map((option) => {
                                        const isSelected = selectedValues.has(option.value)
                                        return (
                                             <CommandItem
                                                  key={option.value}
                                                  onSelect={() => onSelect?.(option.value)}
                                                  className="cursor-pointer pointer-events-auto data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                                             >
                                                  <div
                                                       className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isSelected
                                                                 ? "bg-primary text-primary-foreground"
                                                                 : "opacity-50 [&_svg]:invisible"
                                                       )}
                                                  >
                                                       <Check className={cn("h-4 w-4")} />
                                                  </div>
                                                  {option.icon && (
                                                       <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                                                  )}
                                                  <span>{option.label}</span>
                                                  {counts?.get(option.value) && (
                                                       <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                                                            {counts.get(option.value)}
                                                       </span>
                                                  )}
                                             </CommandItem>
                                        )
                                   })}
                              </CommandGroup>
                              {selectedValues.size > 0 && (
                                   <>
                                        <CommandSeparator />
                                        <CommandGroup>
                                             <CommandItem
                                                  onSelect={onClear}
                                                  className="justify-center text-center cursor-pointer pointer-events-auto data-[disabled]:opacity-100 data-[disabled]:pointer-events-auto"
                                             >
                                                  Clear filters
                                             </CommandItem>
                                        </CommandGroup>
                                   </>
                              )}
                         </CommandList>
                    </Command>
               </PopoverContent>
          </Popover>
     )
}
