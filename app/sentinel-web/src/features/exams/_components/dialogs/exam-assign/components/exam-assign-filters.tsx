import { Search, Filter } from 'lucide-react';
import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';

interface ExamAssignFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    subjectFilter: string;
    setSubjectFilter: (filter: string) => void;
    sectionFilter: string;
    setSectionFilter: (filter: string) => void;
    allSubjects: string[];
    allSections: string[];
}

export function ExamAssignFilters({
    searchQuery,
    setSearchQuery,
    subjectFilter,
    setSubjectFilter,
    sectionFilter,
    setSectionFilter,
    allSubjects,
    allSections,
}: ExamAssignFiltersProps) {
    return (
        <div className="flex flex-col gap-3">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                <Input
                    placeholder="Search by name or number..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex gap-2">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger className="w-full">
                        <div className="text-muted-foreground flex items-center gap-2">
                            <Filter className="h-3 w-3" />
                            <SelectValue placeholder="Subject" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        {allSubjects.map((sub) => (
                            <SelectItem key={sub} value={sub}>
                                {sub}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                    <SelectTrigger className="w-full">
                        <div className="text-muted-foreground flex items-center gap-2">
                            <Filter className="h-3 w-3" />
                            <SelectValue placeholder="Section" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {allSections.map((sec) => (
                            <SelectItem key={sec} value={sec}>
                                {sec}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
