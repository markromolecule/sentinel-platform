import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
} from '@sentinel/ui';
import { SubjectFormState } from '../../_hooks/use-subjects-page-state/_types';

export type SubjectFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: SubjectFormState;
    setForm: (form: SubjectFormState) => void;
    onSubmit: () => void;
    isPending: boolean;
};

export function SubjectFormDialog({
    open,
    onOpenChange,
    form,
    setForm,
    onSubmit,
    isPending,
}: SubjectFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
                    <DialogDescription>
                        Subject changes are scoped to the selected template context.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                            value={form.code}
                            onChange={(event) => setForm({ ...form, code: event.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                            value={form.title}
                            onChange={(event) => setForm({ ...form, title: event.target.value })}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={isPending}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
