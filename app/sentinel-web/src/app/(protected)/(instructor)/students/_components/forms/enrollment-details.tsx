'use client';

import { Input } from '@sentinel/ui';
import { Label } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import type {
    EnrollmentSectionOption,
    EnrollmentSubjectOption,
} from '@/app/(protected)/(instructor)/students/_types/enrollment-target';

interface EnrollmentDetailsProps {
    subjects: EnrollmentSubjectOption[];
    selectedSubjectId: string;
    onSubjectSelect: (id: string) => void;
    filteredSections: EnrollmentSectionOption[];
    section: string;
    setSection: (value: string) => void;
    onSectionSelect: (value: string) => void;
    yearLevel: string;
    setYearLevel: (value: string) => void;
    term: string;
    setTerm: (value: string) => void;
    isYearLevelLocked: boolean;
}

export function EnrollmentDetails({
    subjects,
    selectedSubjectId,
    onSubjectSelect,
    filteredSections,
    section,
    setSection,
    onSectionSelect,
    yearLevel,
    setYearLevel,
    term,
    setTerm,
    isYearLevelLocked,
}: EnrollmentDetailsProps) {
    return (
        <div className="min-w-0 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-2">
                    <Label>Subject</Label>
                    <div className="relative grid gap-2">
                        <Select
                            required
                            value={selectedSubjectId || undefined}
                            onValueChange={onSubjectSelect}
                        >
                            <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.code} - {subject.title}
                                        {subject.term ? ` • ${subject.term}` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="min-w-0 space-y-2">
                    <Label htmlFor="section">Section</Label>
                    {filteredSections.length > 0 ? (
                        <Select required value={section} onValueChange={onSectionSelect}>
                            <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Select Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSections.map((sectionOption) => (
                                    <SelectItem key={sectionOption.id} value={sectionOption.name}>
                                        {sectionOption.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <Input
                            id="section"
                            placeholder="BSCS-3A"
                            required
                            value={section}
                            onChange={(e) => setSection(e.target.value)}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0 space-y-2">
                    <Label htmlFor="yearLevel">Year Level</Label>
                    {isYearLevelLocked ? (
                        <Input id="yearLevel" value={yearLevel} readOnly />
                    ) : (
                        <Select required value={yearLevel} onValueChange={setYearLevel}>
                            <SelectTrigger className="w-full min-w-0">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1st Year">1st Year</SelectItem>
                                <SelectItem value="2nd Year">2nd Year</SelectItem>
                                <SelectItem value="3rd Year">3rd Year</SelectItem>
                                <SelectItem value="4th Year">4th Year</SelectItem>
                                <SelectItem value="5th Year">5th Year</SelectItem>
                            </SelectContent>
                        </Select>
                    )}
                </div>
                <div className="min-w-0 space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Input
                        id="term"
                        placeholder="1st Semester 2025-2026"
                        required
                        value={term}
                        onChange={(e) => setTerm(e.target.value)}
                        readOnly
                    />
                </div>
            </div>
        </div>
    );
}
