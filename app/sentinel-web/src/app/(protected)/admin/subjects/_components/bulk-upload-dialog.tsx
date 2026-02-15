"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSubjectStore } from "@/stores/use-subject-store";
import { toast } from "sonner";
import { Upload } from "lucide-react";

export function BulkUploadDialog() {
     const [open, setOpen] = useState(false);
     const [csvData, setCsvData] = useState("");
     const addMasterSubject = useSubjectStore((state) => state.addMasterSubject);

     const handleUpload = () => {
          const lines = csvData.trim().split("\n");
          let addedCount = 0;

          lines.forEach(line => {
               // Expected format: Code, Title, Department
               const parts = line.split(",").map(p => p.trim());
               if (parts.length >= 2) {
                    const [code, title, department] = parts;
                    addMasterSubject({
                         code,
                         title,
                         department: department || "General"
                    });
                    addedCount++;
               }
          });

          if (addedCount > 0) {
               toast.success(`Successfully added ${addedCount} subjects to the catalog.`);
               setOpen(false);
               setCsvData("");
          } else {
               toast.error("No valid lines found. Please check the format.");
          }
     };

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogTrigger asChild>
                    <Button variant="outline">
                         <Upload className="w-4 h-4 mr-2" />
                         Bulk Upload
                    </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                         <DialogTitle>Bulk Upload Subjects</DialogTitle>
                         <DialogDescription>
                              Paste subject data in CSV format: <code>Code, Title, Department</code>
                              <br />
                              Example: <code>CS101, Intro to CS, Computer Studies</code>
                         </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                         <Textarea
                              placeholder="CS101, Introduction to Computing, College of Computer Studies&#10;MAT101, Calculus I, Mathematics"
                              className="min-h-[200px] font-mono text-sm"
                              value={csvData}
                              onChange={(e) => setCsvData(e.target.value)}
                         />
                    </div>
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                         <Button onClick={handleUpload} className="bg-[#323d8f] hover:bg-[#323d8f]/90">Import Subjects</Button>
                    </DialogFooter>
               </DialogContent>
          </Dialog>
     );
}
