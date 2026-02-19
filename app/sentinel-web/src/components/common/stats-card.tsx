import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";

interface StatsCardProps {
     title: string;
     value: string | number;
     description?: string;
     icon?: LucideIcon;
     trend?: "up" | "down" | "neutral";
     trendValue?: string | number;
     className?: string;
}

export function StatsCard({
     title,
     value,
     description,
     icon: Icon,
     trend,
     trendValue,
     className,
}: StatsCardProps) {
     return (
          <Card className={cn("", className)}>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
               </CardHeader>
               <CardContent>
                    <div className="text-2xl font-bold">{value}</div>
                    {(description || trend) && (
                         <div className="flex items-center pt-1 text-xs text-muted-foreground">
                              {trend && (
                                   <span
                                        className={cn(
                                             "flex items-center mr-2",
                                             trend === "up" && "text-green-500",
                                             trend === "down" && "text-red-500",
                                             trend === "neutral" && "text-muted-foreground"
                                        )}
                                   >
                                        {trend === "up" && <ArrowUp className="h-3 w-3 mr-1" />}
                                        {trend === "down" && <ArrowDown className="h-3 w-3 mr-1" />}
                                        {trend === "neutral" && <Minus className="h-3 w-3 mr-1" />}
                                        {trendValue}
                                   </span>
                              )}
                              {description}
                         </div>
                    )}
               </CardContent>
          </Card>
     );
}
