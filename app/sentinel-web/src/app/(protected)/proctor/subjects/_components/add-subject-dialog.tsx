"use client";

import { useState } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSubjectStore } from "@/stores/use-subject-store";
import { useSectionStore } from "@/stores/use-section-store";
import { MOCK_SECTIONS } from "@/app/(protected)/proctor/_constants";

export function AddSubjectDialog() {
    const [open, setOpen] = useState(false);
    const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
    const [selectedSection, setSelectedSection] = useState("");

    const addSubject = useSubjectStore((state) => state.addSubject);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);
    const sections = useSectionStore((state) => state.sections);

    // Get subject details based on selected code from STORE, not static mock
    const selectedSubject = masterSubjects.find(s => s.code === selectedSubjectCode);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedSubject && selectedSection) {
            addSubject({
                title: selectedSubject.title,
                code: selectedSubject.code,
                section: selectedSection,
                department: selectedSubject.department,
            });
            // Reset format
            setSelectedSubjectCode("");
            setSelectedSection("");
            setOpen(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Enroll Subject
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] !duration-0 !animate-none data-[state=open]:!fade-in-0 data-[state=closed]:!fade-out-0 data-[state=closed]:!zoom-out-95 data-[state=open]:!zoom-in-95 data-[state=closed]:!slide-out-to-left-1/2 data-[state=closed]:!slide-out-to-top-[48%] data-[state=open]:!slide-in-from-left-1/2 data-[state=open]:!slide-in-from-top-[48%]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Enroll Subject</DialogTitle>
                        <DialogDescription>
                            Select a subject from the master list to enroll your section.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">
                                Subject
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedSubjectCode} onValueChange={setSelectedSubjectCode}>
                                    <SelectTrigger id="subject">
                                        <SelectValue placeholder="Select subject" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {masterSubjects.map((subject) => (
                                            <SelectItem key={subject.code} value={subject.code}>
                                                {subject.code} - {subject.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {selectedSubject && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-muted-foreground">Title</Label>
                                    <div className="col-span-3 text-sm font-medium">
                                        {selectedSubject.title}
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right text-muted-foreground">Department</Label>
                                    <div className="col-span-3 text-sm font-medium">
                                        {selectedSubject.department}
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="section" className="text-right">
                                Section
                            </Label>
                            <div className="col-span-3">
                                <Select value={selectedSection} onValueChange={setSelectedSection}>
                                    <SelectTrigger id="section">
                                        <SelectValue placeholder="Select section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={section.name}>
                                                {section.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!selectedSubjectCode || !selectedSection}
                            className="bg-[#323d8f] hover:bg-[#323d8f]/90 text-white"
                        >
                            Enroll
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
