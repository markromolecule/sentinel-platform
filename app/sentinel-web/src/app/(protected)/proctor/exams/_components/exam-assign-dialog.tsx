"use client";

import { useState } from "react";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogHeader,
     DialogTitle,
     DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_PROCTOR_STUDENTS as MOCK_STUDENTS } from '@sentinel/shared/constants';;
import { toast } from "sonner";
import { Search, ChevronDown, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ExamAssignDialogProps {
     open: boolean;
     onOpenChange: (open: boolean) => void;
     examTitle: string;
}

export function ExamAssignDialog({ open, onOpenChange, examTitle }: ExamAssignDialogProps) {
     const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
     const [searchQuery, setSearchQuery] = useState("");
     const [sectionFilter, setSectionFilter] = useState<string>("all");
     const [subjectFilter, setSubjectFilter] = useState<string>("all");
     const [expandedSections, setExpandedSections] = useState<string[]>([]);

     // Get unique values for filters
     const allSections = Array.from(new Set(MOCK_STUDENTS.map(s => s.section)));
     const allSubjects = Array.from(new Set(MOCK_STUDENTS.map(s => s.subject)));

     const handleToggleStudent = (studentId: string) => {
          setSelectedStudents(prev =>
               prev.includes(studentId)
                    ? prev.filter(id => id !== studentId)
                    : [...prev, studentId]
          );
     };

     const handleToggleSectionSelect = (section: string, studentIds: string[]) => {
          const allSelected = studentIds.every(id => selectedStudents.includes(id));

          if (allSelected) {
               // Deselect all
               setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)));
          } else {
               // Select all
               setSelectedStudents(prev => {
                    const newSelection = new Set([...prev, ...studentIds]);
                    return Array.from(newSelection);
               });
          }
     };

     const toggleSectionExpand = (section: string) => {
          setExpandedSections(prev =>
               prev.includes(section)
                    ? prev.filter(s => s !== section)
                    : [...prev, section]
          );
     };

     const filteredStudents = MOCK_STUDENTS.filter(student => {
          const matchesSearch =
               student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               student.studentNo.includes(searchQuery);
          const matchesSection = sectionFilter === "all" || student.section === sectionFilter;
          const matchesSubject = subjectFilter === "all" || student.subject === subjectFilter;

          return matchesSearch && matchesSection && matchesSubject;
     });

     // Group filtered students by section
     const studentsBySection = filteredStudents.reduce((acc, student) => {
          if (!acc[student.section]) {
               acc[student.section] = [];
          }
          acc[student.section].push(student);
          return acc;
     }, {} as Record<string, typeof MOCK_STUDENTS>);

     const sectionKeys = Object.keys(studentsBySection).sort();

     const handleAssign = () => {
          toast.success(`Exam assigned to ${selectedStudents.length} students`);
          onOpenChange(false);
          setSelectedStudents([]);
          setSearchQuery("");
          setSectionFilter("all");
          setSubjectFilter("all");
     };

     return (
          <Dialog open={open} onOpenChange={onOpenChange}>
               <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                         <DialogTitle>Assign Exam</DialogTitle>
                         <DialogDescription>
                              Assign detailed access for <strong>{examTitle}</strong>.
                         </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                         {/* Search and Filters */}
                         <div className="flex flex-col gap-3">
                              <div className="relative">
                                   <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
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
                                             <div className="flex items-center gap-2 text-muted-foreground">
                                                  <Filter className="w-3 h-3" />
                                                  <SelectValue placeholder="Subject" />
                                             </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="all">All Subjects</SelectItem>
                                             {allSubjects.map(sub => (
                                                  <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                                             ))}
                                        </SelectContent>
                                   </Select>

                                   <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                        <SelectTrigger className="w-full">
                                             <div className="flex items-center gap-2 text-muted-foreground">
                                                  <Filter className="w-3 h-3" />
                                                  <SelectValue placeholder="Section" />
                                             </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                             <SelectItem value="all">All Sections</SelectItem>
                                             {allSections.map(sec => (
                                                  <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                                             ))}
                                        </SelectContent>
                                   </Select>
                              </div>
                         </div>

                         <ScrollArea className="h-[350px] pr-4 border rounded-md p-2">
                              <div className="space-y-4">
                                   {sectionKeys.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-8 text-sm">
                                             No students found matching filters.
                                        </div>
                                   ) : (
                                        sectionKeys.map(section => {
                                             const students = studentsBySection[section];
                                             const allSectionSelected = students.every(s => selectedStudents.includes(s.id));
                                             const isExpanded = expandedSections.includes(section);
                                             const someSelected = students.some(s => selectedStudents.includes(s.id));

                                             return (
                                                  <div key={section} className="space-y-2 border rounded-md overflow-hidden bg-background">
                                                       {/* Section Header */}
                                                       <div className="flex items-center justify-between bg-muted/30 p-2 hover:bg-muted/50 transition-colors">
                                                            <div className="flex items-center space-x-3">
                                                                 <Button
                                                                      variant="ghost"
                                                                      size="icon"
                                                                      className="h-6 w-6 shrink-0"
                                                                      onClick={() => toggleSectionExpand(section)}
                                                                 >
                                                                      {isExpanded ? (
                                                                           <ChevronDown className="h-4 w-4" />
                                                                      ) : (
                                                                           <ChevronRight className="h-4 w-4" />
                                                                      )}
                                                                 </Button>
                                                                 <div className="flex items-center space-x-2">
                                                                      <Checkbox
                                                                           id={`section-${section}`}
                                                                           checked={allSectionSelected}
                                                                           onCheckedChange={() => handleToggleSectionSelect(section, students.map(s => s.id))}
                                                                      />
                                                                      <Label
                                                                           htmlFor={`section-${section}`}
                                                                           className="font-semibold cursor-pointer select-none"
                                                                      >
                                                                           {section}
                                                                           <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                                                ({students.length} students)
                                                                           </span>
                                                                      </Label>
                                                                 </div>
                                                            </div>
                                                            {someSelected && !allSectionSelected && (
                                                                 <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                                                                      {students.filter(s => selectedStudents.includes(s.id)).length} selected
                                                                 </Badge>
                                                            )}
                                                       </div>

                                                       {/* Student List (Collapsible) */}
                                                       {isExpanded && (
                                                            <div className="pl-11 pr-2 pb-2 space-y-2 animate-in slide-in-from-top-1 duration-200">
                                                                 {students.map(student => (
                                                                      <div
                                                                           key={student.id}
                                                                           className="flex items-center justify-between p-1.5 rounded-sm hover:bg-muted/30 group"
                                                                      >
                                                                           <div className="flex items-center space-x-2">
                                                                                <Checkbox
                                                                                     id={student.id}
                                                                                     checked={selectedStudents.includes(student.id)}
                                                                                     onCheckedChange={() => handleToggleStudent(student.id)}
                                                                                />
                                                                                <Label
                                                                                     htmlFor={student.id}
                                                                                     className="text-sm font-normal cursor-pointer w-full flex flex-col sm:flex-row sm:items-center sm:gap-2"
                                                                                >
                                                                                     <span>{student.lastName}, {student.firstName}</span>
                                                                                </Label>
                                                                           </div>
                                                                           <span className="text-xs text-muted-foreground font-mono">
                                                                                {student.studentNo}
                                                                           </span>
                                                                      </div>
                                                                 ))}
                                                            </div>
                                                       )}
                                                  </div>
                                             );
                                        })
                                   )}
                              </div>
                         </ScrollArea>
                         <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
                              <span>{selectedStudents.length} students selected</span>
                              {(selectedStudents.length > 0 || sectionFilter !== "all" || subjectFilter !== "all" || searchQuery) && (
                                   <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-auto p-0 text-xs hover:bg-transparent"
                                        onClick={() => {
                                             setSelectedStudents([]);
                                             setSearchQuery("");
                                             setSectionFilter("all");
                                             setSubjectFilter("all");
                                        }}
                                   >
                                        Reset Filters & Selection
                                   </Button>
                              )}
                         </div>
                    </div>

                    <DialogFooter>
                         <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                         <Button onClick={handleAssign} className="bg-[#323d8f] hover:bg-[#323d8f]/90" disabled={selectedStudents.length === 0}>
                              Assign Exam
                         </Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
