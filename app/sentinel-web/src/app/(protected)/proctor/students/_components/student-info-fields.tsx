"use client";

import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";

interface StudentInfoFieldsProps {
     studentNo: string;
     setStudentNo: (value: string) => void;
     email: string;
     setEmail: (value: string) => void;
     firstName: string;
     setFirstName: (value: string) => void;
     lastName: string;
     setLastName: (value: string) => void;
}

export function StudentInfoFields({
     studentNo,
     setStudentNo,
     email,
     setEmail,
     firstName,
     setFirstName,
     lastName,
     setLastName,
}: StudentInfoFieldsProps) {
     return (
          <div className="space-y-4">
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
          </div>
     );
}
