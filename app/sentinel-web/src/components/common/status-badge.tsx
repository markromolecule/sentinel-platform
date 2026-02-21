import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
     status: string;
     variant?: "default" | "secondary" | "destructive" | "outline";
     className?: string;
     label?: string; // Optional custom label if different from status
}

export function StatusBadge({
     status,
     variant = "default",
     className,
     label,
}: StatusBadgeProps) {
     const getStatusColor = (status: string) => {
          const normalizedStatus = status.toLowerCase();
          switch (normalizedStatus) {
               case "active":
               case "published":
               case "completed":
               case "approved":
                    return "bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-400";
               case "inactive":
               case "draft":
               case "pending":
               case "archived":
                    return "bg-gray-100 text-gray-700 hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-400";
               case "error":
               case "failed":
               case "rejected":
               case "suspended":
                    return "bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-400";
               case "warning":
               case "flagged":
                    return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400";
               case "info":
               case "processing":
               case "scheduled":
               case "in progress":
               case "in_progress":
                    return "bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-400";
               default:
                    return "";
          }
     };

     return (
          <Badge
               variant={variant}
               className={cn("capitalize font-medium shadow-none border-0", getStatusColor(status), className)}
          >
               {label || status.toLowerCase().replace(/_/g, ' ')}
          </Badge>
     );
}
