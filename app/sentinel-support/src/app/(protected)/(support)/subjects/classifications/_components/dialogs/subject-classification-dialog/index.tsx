import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@sentinel/ui';
import { useSubjectClassificationDialog } from './use-subject-classification-dialog';
import { SubjectClassificationForm } from './subject-classification-form';
import { SubjectClassificationDialogProps } from './_types';

export function SubjectClassificationDialog(props: SubjectClassificationDialogProps) {
    const { open, classification } = props;
    const { handleOpenChange, handleSubmit, setSubjectSearch, ...formProps } =
        useSubjectClassificationDialog(props);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {classification
                            ? 'Edit Subject Classification'
                            : 'Create Subject Classification'}
                    </DialogTitle>
                    <DialogDescription>
                        Group institution subjects so branches inherit the same classification
                        structure.
                    </DialogDescription>
                </DialogHeader>

                <SubjectClassificationForm
                    {...formProps}
                    onCancel={() => handleOpenChange(false)}
                    onSubmit={handleSubmit}
                    onSearchChange={setSubjectSearch}
                />
            </DialogContent>
        </Dialog>
    );
}
