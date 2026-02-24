"use client";

import { useState } from "react";
import { useAddSectionForm } from "@/app/(protected)/admin/sections/_hooks/use-add-section-form";
import { Button } from "@/components/ui/button";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from '@/components/ui/dialog';
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DEPARTMENTS, DEPARTMENTS_ABBR, YEAR_LEVELS } from "@sentinel/shared/constants";
import { Plus } from "lucide-react";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";

export function AddSectionDialog() {
     const [open, setOpen] = useState(false);
     const { form, selectedDepartment, filteredCourses, onSubmit } = useAddSectionForm(() => setOpen(false));

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogTrigger asChild>
                    <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Section
                    </Button>
               </DialogTrigger>
               <DialogContent
                    className="sm:max-w-[425px] data-[state=open]:animate-none data-[state=closed]:animate-none"
                    overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
               >
                    <DialogHeader>
                         <DialogTitle>Add Section</DialogTitle>
                         <DialogDescription>
                              Create a new section under a specific course.
                         </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                   control={form.control}
                                   name="department"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Department</FormLabel>
                                             <Select
                                                  onValueChange={(value) => {
                                                       field.onChange(value);
                                                       form.setValue("courseId", "");
                                                  }}
                                                  defaultValue={field.value}
                                             >
                                                  <FormControl>
                                                       <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Dept" />
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                       {DEPARTMENTS.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                                 {DEPARTMENTS_ABBR[dept] || dept}
                                                            </SelectItem>
                                                       ))}
                                                  </SelectContent>
                                             </Select>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name="courseId"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Course</FormLabel>
                                             <Select
                                                  onValueChange={field.onChange}
                                                  defaultValue={field.value}
                                                  disabled={!selectedDepartment}
                                             >
                                                  <FormControl>
                                                       <SelectTrigger className="w-full">
                                                            <div className="flex-1 min-w-0 truncate text-left">
                                                                 <SelectValue placeholder="Select Course" />
                                                            </div>
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent className="max-w-[370px]">
                                                       {filteredCourses.map((course) => (
                                                            <SelectItem key={course.id} value={course.id}>
                                                                 <span className="whitespace-normal break-words block w-full text-left">
                                                                      {course.code} - {course.title}
                                                                 </span>
                                                            </SelectItem>
                                                       ))}
                                                  </SelectContent>
                                             </Select>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name="name"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Section</FormLabel>
                                             <FormControl>
                                                  <Input placeholder="e.g., INF231" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name="yearLevel"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Year Level</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl>
                                                       <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Year" />
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                       {YEAR_LEVELS.map((year) => (
                                                            <SelectItem key={year} value={year}>
                                                                 {year}
                                                            </SelectItem>
                                                       ))}
                                                  </SelectContent>
                                             </Select>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <DialogFooter>
                                   <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">Add Section</Button>
                              </DialogFooter>
                         </form>
                    </Form>
               </DialogContent>
          </Dialog>
     );
}
