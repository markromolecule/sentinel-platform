"use client";

import { useManualEntry } from "../_hooks/use-manual-entry";
import { StudentInfoFields } from "./student-info-fields";
import { EnrollmentDetails } from "./enrollment-details";
import { Button } from "@/components/ui/button";

interface ManualEntryFormProps {
     onSuccess: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
     const {
          isLoading,
          studentNo,
          setStudentNo,
          email,
          setEmail,
          firstName,
          setFirstName,
          lastName,
          setLastName,
          selectedSubjectCode,
          handleSubjectSelect,
          section,
          setSection,
          yearLevel,
          setYearLevel,
          term,
          setTerm,
          masterSubjects,
          filteredSections,
          handleSubmit,
     } = useManualEntry({ onSuccess });

     return (
          <form onSubmit={handleSubmit} className="space-y-4">
               <StudentInfoFields
                    studentNo={studentNo}
                    setStudentNo={setStudentNo}
                    email={email}
                    setEmail={setEmail}
                    firstName={firstName}
                    setFirstName={setFirstName}
                    lastName={lastName}
                    setLastName={setLastName}
               />

               <EnrollmentDetails
                    masterSubjects={masterSubjects}
                    selectedSubjectCode={selectedSubjectCode}
                    onSubjectSelect={handleSubjectSelect}
                    filteredSections={filteredSections}
                    section={section}
                    setSection={setSection}
                    yearLevel={yearLevel}
                    setYearLevel={setYearLevel}
                    term={term}
                    setTerm={setTerm}
               />

               <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                         Cancel
                    </Button>
                    <Button
                         type="submit"
                         className="bg-[#323d8f] hover:bg-[#323d8f]/90"
                         disabled={isLoading}
                    >
                         {isLoading ? "Adding..." : "Add Student"}
                    </Button>
               </div>
          </form>
     );
}
