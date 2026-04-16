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
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select
                    value={selectedInstitutionId}
                    onValueChange={onInstitutionChange}
                    disabled={disabled || isLoadingInstitutions}
                >
                    <SelectTrigger
                        id="institution"
                        className="w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white"
                    >
                        <SelectValue placeholder="Select Institution" />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                        {institutions.map((inst) => (
                            <SelectItem key={inst.id} value={inst.id}>
                                {inst.name}
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
                        className="w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white"
                    >
                        <SelectValue
                            placeholder={
                                !selectedInstitutionId
                                    ? 'Select Institution first'
                                    : 'Select Department'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                        {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                                {dept.name} {dept.code ? `(${dept.code})` : ''}
                            </SelectItem>
                        ))}
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
                        className="w-full touch-manipulation border-white/10 bg-[#0f0f10] text-white"
                    >
                        <SelectValue
                            placeholder={
                                !selectedDepartmentId ? 'Select Department first' : 'Select Course'
                            }
                        />
                    </SelectTrigger>
                    <SelectContent position="popper" className="z-[100]">
                        {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                                {course.title} {course.code ? `(${course.code})` : ''}
                            </SelectItem>
                        ))}
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
