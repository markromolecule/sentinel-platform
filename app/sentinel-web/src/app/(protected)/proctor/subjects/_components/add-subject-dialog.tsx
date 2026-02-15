"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Check, ChevronsUpDown, Search } from "lucide-react";
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


import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { useSubjectStore } from "@/stores/use-subject-store";
import { useSectionStore } from "@/stores/use-section-store";
import { MOCK_PROCTOR } from "@/app/(protected)/proctor/_constants";



export function AddSubjectDialog() {
    const [open, setOpen] = useState(false);
    const [comboboxOpen, setComboboxOpen] = useState(false);

    const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
    const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(0);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    const addSubject = useSubjectStore((state) => state.addSubject);
    const masterSubjects = useSubjectStore((state) => state.masterSubjects);
    const sections = useSectionStore((state) => state.sections);

    const filteredSubjects = useMemo(() => {
        if (!searchQuery) return masterSubjects;
        const lowerQuery = searchQuery.toLowerCase();
        return masterSubjects.filter(
            (s) =>
                s.code.toLowerCase().includes(lowerQuery) ||
                s.title.toLowerCase().includes(lowerQuery)
        );
    }, [masterSubjects, searchQuery]);

    // Reset focused index when query changes
    useEffect(() => {
        setFocusedIndex(0);
    }, [searchQuery]);

    // Scroll focused item into view
    useEffect(() => {
        if (comboboxOpen && itemRefs.current[focusedIndex]) {
            itemRefs.current[focusedIndex]?.scrollIntoView({
                block: "nearest",
            });
        }
    }, [focusedIndex, comboboxOpen]);



    // Get subject details based on selected code
    const selectedSubject = useMemo(() =>
        masterSubjects.find(s => s.code === selectedSubjectCode),
        [masterSubjects, selectedSubjectCode]
    );

    // Filter available sections based on Master Subject's defined sections
    const availableSections = useMemo(() => {
        if (!selectedSubject) return [];

        const activeSections = sections.filter(s => s.status === "active");

        // If master subject has specific sections assigned, filter by them
        if (selectedSubject.sections && selectedSubject.sections.length > 0) {
            return activeSections.filter(s => selectedSubject.sections!.includes(s.name));
        }

        return activeSections;
    }, [sections, selectedSubject]);

    const toggleSection = (sectionId: string) => {
        setSelectedSectionIds(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const handleSelectAll = () => {
        if (selectedSectionIds.length === availableSections.length) {
            setSelectedSectionIds([]);
        } else {
            setSelectedSectionIds(availableSections.map(s => s.id));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedSubject && selectedSectionIds.length > 0) {
            selectedSectionIds.forEach(sectionId => {
                const sectionObj = sections.find(s => s.id === sectionId);
                if (sectionObj) {
                    addSubject({
                        title: selectedSubject.title,
                        code: selectedSubject.code,
                        section: sectionObj.name,
                        department: selectedSubject.department,
                        proctorId: MOCK_PROCTOR.id,
                        createdBy: MOCK_PROCTOR.name
                    });
                }
            });

            // Reset format
            setSelectedSubjectCode("");
            setSelectedSectionIds([]);
            setOpen(false);
        }
    };

    const handleSelectSubject = (subjectCode: string) => {
        const newCode = subjectCode === selectedSubjectCode ? "" : subjectCode;
        setSelectedSubjectCode(newCode);
        setSelectedSectionIds([]);
        setComboboxOpen(false);
        setSearchQuery("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!comboboxOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter") {
                setComboboxOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setFocusedIndex((prev) =>
                    prev < filteredSubjects.length - 1 ? prev + 1 : prev
                );
                break;
            case "ArrowUp":
                e.preventDefault();
                setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                break;
            case "Enter":
                e.preventDefault();
                if (filteredSubjects[focusedIndex]) {
                    handleSelectSubject(filteredSubjects[focusedIndex].code);
                }
                break;
            case "Escape":
                e.preventDefault();
                setComboboxOpen(false);
                break;
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
            <DialogContent className="sm:max-w-[500px] !duration-0 !animate-none overflow-visible">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Enroll Subject</DialogTitle>
                        <DialogDescription>
                            Select a subject and one or more sections to enroll.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        {/* Subject Selection (Combobox) */}
                        <div className="grid gap-2 relative">
                            <Label htmlFor="subject">Subject</Label>

                            {!comboboxOpen ? (
                                <Button
                                    type="button"
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={comboboxOpen}
                                    className="w-full justify-between"
                                    onClick={() => setComboboxOpen(true)}
                                >
                                    {selectedSubjectCode
                                        ? `${selectedSubject?.code} - ${selectedSubject?.title}`
                                        : "Select subject..."}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            ) : (
                                <div className="relative">
                                    <div className="flex items-center border rounded-md px-3 bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 z-50 relative">
                                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                        <input
                                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                            placeholder="Search subject..."
                                            autoFocus
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>

                                    {/* Backdrop to close dropdown on click outside */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setComboboxOpen(false)}
                                    />

                                    <div
                                        className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 overflow-hidden pointer-events-auto"
                                    >
                                        <div className="max-h-[200px] overflow-y-auto p-1">
                                            {filteredSubjects.length === 0 ? (
                                                <div className="py-6 text-center text-sm text-muted-foreground">No subject found.</div>
                                            ) : (
                                                filteredSubjects.map((subject, index) => (
                                                    <div
                                                        key={subject.code}
                                                        ref={(el) => {
                                                            itemRefs.current[index] = el;
                                                        }}
                                                        className={cn(
                                                            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none cursor-pointer",
                                                            "hover:bg-accent hover:text-accent-foreground",
                                                            focusedIndex === index && "bg-accent text-accent-foreground"
                                                        )}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Keep focus on input for continued typing/nav if clicking item
                                                            e.stopPropagation();
                                                            handleSelectSubject(subject.code);
                                                        }}
                                                        onMouseEnter={() => setFocusedIndex(index)}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedSubjectCode === subject.code ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{subject.code}</span>
                                                            <span className="text-xs text-muted-foreground">{subject.title}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
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

                                {/* Section Selection (Multi-select Checkboxes) */}
                                <div className="grid gap-2 animate-in fade-in-0 slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Select Sections</Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-xs text-blue-600"
                                            onClick={handleSelectAll}
                                        >
                                            {selectedSectionIds.length === availableSections.length ? "Deselect All" : "Select All"}
                                        </Button>
                                    </div>
                                    <div className="border rounded-md">
                                        <ScrollArea className="h-[200px] p-4">
                                            {availableSections.length > 0 ? (
                                                <div className="space-y-3">
                                                    {availableSections.map((section) => (
                                                        <div key={section.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={section.id}
                                                                checked={selectedSectionIds.includes(section.id)}
                                                                onCheckedChange={() => toggleSection(section.id)}
                                                            />
                                                            <Label
                                                                htmlFor={section.id}
                                                                className="flex-1 cursor-pointer font-normal"
                                                            >
                                                                {section.name}
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                                    No sections allocated to this subject.
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                    <div className="text-xs text-muted-foreground text-right">
                                        {selectedSectionIds.length} selected
                                    </div>
                                </div>
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
        </Dialog >
    );
}
