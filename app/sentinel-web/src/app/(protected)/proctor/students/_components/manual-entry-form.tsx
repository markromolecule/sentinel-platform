"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useSubjectStore } from "@/stores/use-subject-store";

interface ManualEntryFormProps {
     onSuccess: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
     const [isLoading, setIsLoading] = useState(false);

     // State for form fields
     const [studentNo, setStudentNo] = useState("");
     const [email, setEmail] = useState("");
     const [firstName, setFirstName] = useState("");
     const [lastName, setLastName] = useState("");

     // Auto-suggest and Combobox state
     const [comboboxOpen, setComboboxOpen] = useState(false);
     const [selectedSubjectCode, setSelectedSubjectCode] = useState("");
     const [searchQuery, setSearchQuery] = useState("");
     const [focusedIndex, setFocusedIndex] = useState(0);
     const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

     // Derived state
     const { masterSubjects } = useSubjectStore();

     // Filter subjects based on search query
     const filteredSubjects = useMemo(() => {
          if (!searchQuery) return masterSubjects;
          const lowerQuery = searchQuery.toLowerCase();
          return masterSubjects.filter(
               (s) =>
                    s.code.toLowerCase().includes(lowerQuery) ||
                    s.title.toLowerCase().includes(lowerQuery)
          );
     }, [masterSubjects, searchQuery]);

     // Find selected subject object
     const selectedSubject = masterSubjects.find(s => s.code === selectedSubjectCode);

     // Filter sections based on selected subject
     const filteredSections = selectedSubject?.sections || [];

     // Form fields that can be auto-filled
     const [section, setSection] = useState("");
     const [yearLevel, setYearLevel] = useState("");
     const [term, setTerm] = useState("");

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

     // Effect to auto-fill data when subject changes
     useEffect(() => {
          if (selectedSubject) {
               // Auto-fetch Year Level
               if (selectedSubject.yearLevel) {
                    setYearLevel(selectedSubject.yearLevel);
               }

               // Auto-fetch Term (Simulated default as per requirement)
               setTerm("1st Semester 2025-2026");

               // Auto-suggest Section (Select first available if any)
               if (selectedSubject.sections && selectedSubject.sections.length > 0) {
                    setSection(selectedSubject.sections[0]);
               } else {
                    setSection("");
               }
          }
     }, [selectedSubject]);

     const handleSelectSubject = (subjectCode: string) => {
          const newCode = subjectCode === selectedSubjectCode ? "" : subjectCode;
          setSelectedSubjectCode(newCode);
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

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsLoading(true);

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 1000));

          toast.success("Student added successfully");
          setIsLoading(false);
          onSuccess();
     };

     return (
          <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="studentNo">Student Number</Label>
                         <Input
                              id="studentNo"
                              placeholder="2024-00123"
                              required
                              value={studentNo}
                              onChange={(e) => setStudentNo(e.target.value)}
                         />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="email">Email Address</Label>
                         <Input
                              id="email"
                              type="email"
                              placeholder="student@university.edu"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                         />
                    </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="firstName">First Name</Label>
                         <Input
                              id="firstName"
                              placeholder="Juan"
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                         />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="lastName">Last Name</Label>
                         <Input
                              id="lastName"
                              placeholder="Dela Cruz"
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                         />
                    </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                         <Label>Subject</Label>
                         <div className="grid gap-2 relative">
                              {!comboboxOpen ? (
                                   <Button
                                        type="button"
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={comboboxOpen}
                                        className="w-full justify-between min-w-0"
                                        onClick={() => setComboboxOpen(true)}
                                   >
                                        <span className="truncate flex-1 text-left block max-w-full">
                                             {selectedSubjectCode
                                                  ? masterSubjects.find((s) => s.code === selectedSubjectCode)?.code + " - " + masterSubjects.find((s) => s.code === selectedSubjectCode)?.title
                                                  : "Select subject..."}
                                        </span>
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

                                        <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95 overflow-hidden pointer-events-auto">
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
                                                                      e.preventDefault();
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
                              readOnly // Auto-fetched often implies read-only or at least defaulted
                         />
                    </div>
               </div>

               <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={onSuccess}>
                         Cancel
                    </Button>
                    <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90" disabled={isLoading}>
                         {isLoading ? "Adding..." : "Add Student"}
                    </Button>
               </div>
          </form>
     );
}
