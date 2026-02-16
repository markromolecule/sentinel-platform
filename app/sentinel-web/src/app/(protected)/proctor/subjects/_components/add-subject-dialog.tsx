"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useAddSubject } from "@/app/(protected)/proctor/subjects/_hooks/use-add-subject";
import { SubjectSelector } from "@/app/(protected)/proctor/_components/subject-selector";
import { SectionSelector } from "@/app/(protected)/proctor/subjects/_components/section-selector";

export function AddSubjectDialog() {
    const {
        open,
        setOpen,
        selectedSubjectCode,
        selectedSectionIds,
        filteredSubjects,
        selectedSubject,
        availableSections,
        toggleSection,
        handleSelectAll,
        handleSelectSubject,
        handleSubmit,
    } = useAddSubject();

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] !duration-0 !animate-none overflow-visible">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Enroll Subject</DialogTitle>
                        <DialogDescription>
                            Select a subject and one or more sections to enroll.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Subject Selection */}
                        <div className="grid gap-2 relative">
                            <Label htmlFor="subject">Subject</Label>
                            <SubjectSelector
                                subjects={filteredSubjects}
                                selectedSubjectCode={selectedSubjectCode}
                                onSelect={handleSelectSubject}
                            />
                        </div>

                        {selectedSubject && (
                            <>
                                <div className="text-sm bg-muted/50 p-3 rounded-md">
                                    <div className="grid grid-cols-[80px_1fr] gap-1">
                                        <span className="text-muted-foreground">Title:</span>
                                        <span className="font-medium">{selectedSubject.title}</span>
                                        <span className="text-muted-foreground">Dept:</span>
                                        <span className="font-medium">{selectedSubject.department}</span>
                                    </div>
                                </div>

                                {/* Section Selection */}
                                <SectionSelector
                                    sections={availableSections}
                                    selectedSectionIds={selectedSectionIds}
                                    onToggle={toggleSection}
                                    onSelectAll={handleSelectAll}
                                />
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!selectedSubjectCode || selectedSectionIds.length === 0}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white w-full sm:w-auto"
                        >
                            Enroll {selectedSectionIds.length > 0 ? `(${selectedSectionIds.length})` : ""}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
