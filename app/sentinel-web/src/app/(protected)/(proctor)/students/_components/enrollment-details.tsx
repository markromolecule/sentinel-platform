"use client";

import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@sentinel/ui";
import { SubjectSelector } from "@/app/(protected)/(proctor)/_components/subject-selector";
import type { MasterSubject } from '@sentinel/shared/types';;

interface EnrollmentDetailsProps {
     masterSubjects: MasterSubject[];
     selectedSubjectCode: string;
     onSubjectSelect: (code: string) => void;
     filteredSections: string[];
     section: string;
     setSection: (value: string) => void;
     yearLevel: string;
     setYearLevel: (value: string) => void;
     term: string;
     setTerm: (value: string) => void;
}

export function EnrollmentDetails({
     masterSubjects,
     selectedSubjectCode,
     onSubjectSelect,
     filteredSections,
     section,
     setSection,
     yearLevel,
     setYearLevel,
     term,
     setTerm,
}: EnrollmentDetailsProps) {
     return (
          <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                         <Label>Subject</Label>
                         <div className="grid gap-2 relative">
                              <SubjectSelector
                                   subjects={masterSubjects}
                                   selectedSubjectCode={selectedSubjectCode}
                                   onSelect={onSubjectSelect}
                              />
                         </div>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="section">Section</Label>
                         {filteredSections.length > 0 ? (
                              <Select
                                   required
                                   value={section}
                                   onValueChange={setSection}
                              >
                                   <SelectTrigger>
                                        <SelectValue placeholder="Select Section" />
                                   </SelectTrigger>
                                   <SelectContent>
                                        {filteredSections.map((sec) => (
                                             <SelectItem key={sec} value={sec}>
                                                  {sec}
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

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="yearLevel">Year Level</Label>
                         <Select
                              required
                              value={yearLevel}
                              onValueChange={setYearLevel}
                         >
                              <SelectTrigger>
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
                    </div>
                    <div className="space-y-2">
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
