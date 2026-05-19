import {
    Input,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';

export type ScopeSelectorsProps = {
    canSelectInstitution: boolean;
    institutionId: string;
    setInstitutionId: (id: string) => void;
    institutions: Array<{ id: string; name: string }>;
    lockedInstitutionName: string | null;
    activeInstitutionId: string;
    lockedDepartmentId: string | null;
    activeDepartmentId: string;
    setDepartmentId: (id: string) => void;
    availableDepartments: Array<{ id: string; code?: string | null; name: string }>;
    lockedCourseId: string | null;
    activeCourseId: string;
    setCourseId: (id: string) => void;
    availableCourses: Array<{ id: string; code?: string | null; title: string }>;
};

/**
 * Renders the 3-column scope selection grid for Institution, Department, and Course dropdowns.
 */
export function ScopeSelectors({
    canSelectInstitution,
    institutionId,
    setInstitutionId,
    institutions,
    lockedInstitutionName,
    activeInstitutionId,
    lockedDepartmentId,
    activeDepartmentId,
    setDepartmentId,
    availableDepartments,
    lockedCourseId,
    activeCourseId,
    setCourseId,
    availableCourses,
}: ScopeSelectorsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {/* Institution Selector */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Institution</p>
                {canSelectInstitution ? (
                    <Select
                        value={institutionId}
                        onValueChange={(value) => {
                            setInstitutionId(value);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select institution" />
                        </SelectTrigger>
                        <SelectContent>
                            {institutions.map((institution) => (
                                <SelectItem
                                    key={institution.id}
                                    value={institution.id}
                                >
                                    {institution.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input
                        value={lockedInstitutionName || 'Loading institution...'}
                        readOnly
                        disabled
                        className="bg-muted text-muted-foreground"
                    />
                )}
            </div>

            {/* Department Selector */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Department</p>
                <Select
                    value={activeDepartmentId}
                    onValueChange={(value) => {
                        setDepartmentId(value);
                    }}
                    disabled={!!lockedDepartmentId || !activeInstitutionId}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                activeInstitutionId
                                    ? 'Select department'
                                    : 'Select institution first'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableDepartments.map((department) => (
                            <SelectItem key={department.id} value={department.id}>
                                {department.code || department.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Course Selector */}
            <div className="space-y-2">
                <p className="text-sm font-medium">Course</p>
                <Select
                    value={activeCourseId}
                    onValueChange={(value) => {
                        setCourseId(value);
                    }}
                    disabled={!!lockedCourseId || !activeDepartmentId}
                >
                    <SelectTrigger>
                        <SelectValue
                            placeholder={
                                activeDepartmentId
                                    ? 'Select course'
                                    : 'Select department first'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.code || course.title}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
