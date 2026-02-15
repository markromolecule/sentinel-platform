"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface ManualEntryFormProps {
     onSuccess: () => void;
}

export function ManualEntryForm({ onSuccess }: ManualEntryFormProps) {
     const [isLoading, setIsLoading] = useState(false);

     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                         <Input id="studentNo" placeholder="2024-00123" required />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="email">Email Address</Label>
                         <Input id="email" type="email" placeholder="student@university.edu" required />
                    </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="firstName">First Name</Label>
                         <Input id="firstName" placeholder="Juan" required />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="lastName">Last Name</Label>
                         <Input id="lastName" placeholder="Dela Cruz" required />
                    </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="section">Section</Label>
                         <Input id="section" placeholder="BSCS-3A" required />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="yearLevel">Year Level</Label>
                         <Select required>
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
               </div>

               <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                         <Label htmlFor="subject">Subject</Label>
                         <Input id="subject" placeholder="Data Structures" required />
                    </div>
                    <div className="space-y-2">
                         <Label htmlFor="term">Term</Label>
                         <Input id="term" placeholder="1st Semester 2025-2026" required />
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
