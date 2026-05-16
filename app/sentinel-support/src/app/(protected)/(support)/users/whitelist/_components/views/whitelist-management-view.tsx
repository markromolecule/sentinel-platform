import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import {
    useDebounce,
    useInstitutionsQuery,
    useDepartmentsQuery,
    useCoursesQuery,
    useStableValue,
    useStudentWhitelistQuery,
} from '@sentinel/hooks';
import {
    PageHeader,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
} from '@sentinel/ui';
import { WhitelistList } from './whitelist-list';

export function WhitelistManagementView() {
    const [search, setSearch] = useState('');
    const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>(undefined);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(undefined);
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(undefined);

    const debouncedSearch = useDebounce(search, 500);

    const { data: institutions = [] } = useInstitutionsQuery();
    const departmentsParams = useStableValue(() => ({
        institutionId: selectedInstitutionId,
        enabled: Boolean(selectedInstitutionId),
    }), [selectedInstitutionId]);

    const { data: departments = [] } = useDepartmentsQuery(departmentsParams);

    const coursesParams = useStableValue(() => ({
        institutionId: selectedInstitutionId,
        departmentId: selectedDepartmentId,
        enabled: Boolean(selectedInstitutionId),
    }), [selectedInstitutionId, selectedDepartmentId]);

    const { data: courses = [] } = useCoursesQuery(coursesParams);

    const whitelistParams = useStableValue(() => ({
        search: debouncedSearch || undefined,
        institution_id: selectedInstitutionId,
    }), [debouncedSearch, selectedInstitutionId]);

    const {
        data: records = [],
        isLoading,
        error,
    } = useStudentWhitelistQuery(whitelistParams);

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <PageHeader
                title="Support Whitelist Management"
                description="Manage approved student identities with strict institutional scoping."
            />

            <div className="flex flex-wrap items-center gap-4">
                <div className="w-[200px]">
                    <Select
                        value={selectedInstitutionId || 'all'}
                        onValueChange={(val) => {
                            setSelectedInstitutionId(val === 'all' ? undefined : val);
                            setSelectedDepartmentId(undefined);
                            setSelectedCourseId(undefined);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Institution" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Institutions</SelectItem>
                            {institutions.map((inst) => (
                                <SelectItem key={inst.id} value={inst.id}>{inst.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[200px]">
                    <Select
                        value={selectedDepartmentId || 'all'}
                        onValueChange={(val) => {
                            setSelectedDepartmentId(val === 'all' ? undefined : val);
                            setSelectedCourseId(undefined);
                        }}
                        disabled={!selectedInstitutionId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((dept) => (
                                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-[200px]">
                    <Select
                        value={selectedCourseId || 'all'}
                        onValueChange={(val) => setSelectedCourseId(val === 'all' ? undefined : val)}
                        disabled={!selectedDepartmentId && !selectedInstitutionId}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Course" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {courses.map((course) => (
                                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Separator />

            {error ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2">
                    <p className="text-destructive font-medium">Failed to load whitelist records.</p>
                </div>
            ) : (
                <div className="relative">
                    <WhitelistList
                        records={records}
                        search={search}
                        onSearchChange={setSearch}
                        isLoading={isLoading}
                    />

                    {isLoading && records.length === 0 && (
                        <div className="bg-background/80 absolute inset-x-0 top-[60px] bottom-0 flex items-center justify-center rounded-md">
                            <Loader2 className="text-primary h-8 w-8 animate-spin" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
