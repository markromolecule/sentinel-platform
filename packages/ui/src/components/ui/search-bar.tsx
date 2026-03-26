import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "./input"
import { cn } from "../../lib/utils"

export interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string
}

export function SearchBar({
  className,
  containerClassName,
  ...props
}: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center", containerClassName)}>
      <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
      <Input
        {...props}
        className={cn("pl-8", className)}
      />
    </div>
  )
}
