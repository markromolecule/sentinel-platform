import { Input } from '@sentinel/ui';
import { Label } from '@sentinel/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@sentinel/ui';
import { AcademicInfoFieldsProps } from '../_types';

export function AcademicInfoFields({
    institutions,
    selectedInstitutionId,
    onInstitutionChange,
    departments,
    selectedDepartmentId,
    onDepartmentChange,
    courses,
    selectedCourseId,
    onCourseChange,
    studentNumber,
    onStudentNumberChange,
    isLoadingInstitutions = false,
    isLoadingDepartments = false,
    isLoadingCourses = false,
    disabled = false,
}: AcademicInfoFieldsProps) {
    const selectedInstitution = institutions.find((inst) => inst.id === selectedInstitutionId);
    const selectedDepartment = departments.find((dept) => dept.id === selectedDepartmentId);
    const selectedCourse = courses.find((course) => course.id === selectedCourseId);

    const institutionTooltip = selectedInstitution?.name;
    const departmentTooltip = selectedDepartment
        ? `${selectedDepartment.name}${selectedDepartment.code ? ` (${selectedDepartment.code})` : ''}`
        : undefined;
    const courseTooltip = selectedCourse
        ? `${selectedCourse.title}${selectedCourse.code ? ` (${selectedCourse.code})` : ''}`
        : undefined;

    return (
        <div className="w-full min-w-0 space-y-6">
            <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select
                    value={selectedInstitutionId}
                    onValueChange={onInstitutionChange}
                    disabled={disabled || isLoadingInstitutions}
                >
                    <SelectTrigger
                        id="institution"
                        title={institutionTooltip}
                        className="w-full min-w-0 max-w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white overflow-hidden"
                    >
                        <SelectValue placeholder="Select Institution" className="truncate min-w-0 text-left" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100] max-w-[calc(100vw-2rem)] sm:max-w-md">
                        {institutions.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id} title={inst.name}>
                                <span className="truncate">{inst.name}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                    value={selectedDepartmentId}
                    onValueChange={onDepartmentChange}
                    disabled={disabled || !selectedInstitutionId || isLoadingDepartments}
                >
                    <SelectTrigger
                        id="department"
                        title={departmentTooltip}
                        className="w-full min-w-0 max-w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white overflow-hidden"
                    >
                        <SelectValue
                            placeholder={
                                !selectedInstitutionId
                                    ? 'Select Institution first'
                                    : 'Select Department'
                            }
                            className="truncate min-w-0 text-left"
                        />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100] max-w-[calc(100vw-2rem)] sm:max-w-md">
                        {departments.map((dept) => {
                            const label = `${dept.name} ${dept.code ? `(${dept.code})` : ''}`;
                            return (
                                <SelectItem key={dept.id} value={dept.id} title={label}>
                                    <span className="truncate">{label}</span>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <Select
                    value={selectedCourseId}
                    onValueChange={onCourseChange}
                    disabled={disabled || !selectedDepartmentId || isLoadingCourses}
                >
                    <SelectTrigger
                        id="course"
                        title={courseTooltip}
                        className="w-full min-w-0 max-w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white overflow-hidden"
                    >
                        <SelectValue
                            placeholder={
                                !selectedDepartmentId ? 'Select Department first' : 'Select Course'
                            }
                            className="truncate min-w-0 text-left"
                        />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100] max-w-[calc(100vw-2rem)] sm:max-w-md">
                        {courses.map((course) => {
                            const label = `${course.title} ${course.code ? `(${course.code})` : ''}`;
                            return (
                                <SelectItem key={course.id} value={course.id} title={label}>
                                    <span className="truncate">{label}</span>
                                </SelectItem>
                            );
                        })}
                    </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                    Choose your official program, even if you are currently taking subjects outside
                    it.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input
                    id="studentNumber"
                    placeholder="e.g. 2023-123456"
                    value={studentNumber}
                    onChange={(e) => onStudentNumberChange(e.target.value)}
                    className="border-white/10 bg-[#0f0f10] text-white placeholder:text-gray-500 focus-visible:ring-blue-500"
                    disabled={disabled || !selectedCourseId}
                    maxLength={12}
                />
                <p className="text-xs text-gray-500">
                    This must match the approved whitelist record for your institution.
                </p>
            </div>
        </div>
    );
}
