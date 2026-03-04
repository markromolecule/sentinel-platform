
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Department } from "@sentinel/shared/types";
import { useCreateDepartmentMutation } from "@/hooks/query/departments/use-create-department-mutation";
import { useUpdateDepartmentMutation } from "@/hooks/query/departments/use-update-department-mutation";

// interface for the add department dialog
interface AddDepartmentDialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    departmentToEdit?: Department | null;
}

// add department dialog component
export function AddDepartmentDialog(
    {
        open,
        onOpenChange,
        departmentToEdit
    }: AddDepartmentDialogProps) {
    // state for the form — initialized directly from the prop (no useEffect needed)
    const [name, setName] = useState(departmentToEdit?.name ?? "");
    const [code, setCode] = useState(departmentToEdit?.code ?? "");
    const [isOpen, setIsOpen] = useState(false);

    // create department mutation
    const createDepartment = useCreateDepartmentMutation({
        onSuccess: () => toast.success('Department created successfully'),
        onError: (error: Error) => toast.error(error.message)
    });
    // update department mutation
    const updateDepartment = useUpdateDepartmentMutation({
        onSuccess: () => toast.success('Department updated successfully'),
        onError: (error: Error) => toast.error(error.message)
    });

    const isEditing = !!departmentToEdit;
    const isLoading = createDepartment.isPending || updateDepartment.isPending;

    // handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // handle create or update department
        try {
            if (isEditing && departmentToEdit) {
                await updateDepartment.mutateAsync({
                    id: departmentToEdit.id,
                    payload: {
                        name,
                        code
                    }
                });
            } else {
                await createDepartment.mutateAsync({ name, code });
            }
            // close dialog
            handleOpenChange(false);

            // reset form if creating
            if (!isEditing) {
                setName("");
                setCode("");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // handle open change
    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        if (onOpenChange) {
            onOpenChange(newOpen);
        }
        if (!newOpen && !isEditing) {
            setName("");
            setCode("");
        }
    };

    // Derived state for controlled vs uncontrolled usage
    const show = open !== undefined ? open : isOpen;

    return (
        <Dialog key={`${departmentToEdit?.id ?? 'new'}-${open}`} open={show} onOpenChange={handleOpenChange}>
            {!onOpenChange && (
                <DialogTrigger asChild>
                    <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">Add Department</Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] !animate-none !duration-0 data-[state=open]:!animate-none data-[state=closed]:!animate-none">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Department" : "Add Department"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update department details." : "Create a new department for the institution."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                placeholder="School of..."
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">
                                Code
                            </Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. SASE"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Department"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
