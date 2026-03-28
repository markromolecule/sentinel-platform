"use client";

import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger,
    Button
} from "@sentinel/ui";
import { MoreHorizontal, Edit, Trash, Shield } from "lucide-react";
import { AdminUser } from "@sentinel/shared/types";
import { toast } from "sonner";

interface AdministratorActionsCellProps {
    administrator: AdminUser;
    onEdit: (admin: AdminUser) => void;
    onDelete: (admin: AdminUser) => void;
}

export function AdministratorActionsCell({ 
    administrator, 
    onEdit, 
    onDelete 
}: AdministratorActionsCellProps) {
    const onCopy = (id: string) => {
        navigator.clipboard.writeText(id);
        toast.success("Administrator ID copied to clipboard.");
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onCopy(administrator.id)}>
                    Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onEdit(administrator)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Shield className="mr-2 h-4 w-4" /> Manage Permissions
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => onDelete(administrator)}
                >
                    <Trash className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
