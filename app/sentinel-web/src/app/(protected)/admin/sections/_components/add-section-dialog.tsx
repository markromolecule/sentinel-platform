"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSectionStore } from "@/stores/use-section-store";
import { DEPARTMENTS, DEPARTMENTS_ABBR, YEAR_LEVELS } from "@sentinel/shared/src/constants";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";

import { useCourseStore } from "@/stores/use-course-store";

const sectionSchema = z.object({
     courseId: z.string().min(1, "Course is required"),
     name: z.string().min(2, "Section name is required (e.g., INF231)"),
     department: z.string().min(1, "Department is required"),
     yearLevel: z.string().min(1, "Year level is required"),
});

type SectionFormValues = z.infer<typeof sectionSchema>;

export function AddSectionDialog() {
     const [open, setOpen] = useState(false);
     const addSection = useSectionStore((state) => state.addSection);
     const courses = useCourseStore((state) => state.courses);

     const form = useForm<SectionFormValues>({
          resolver: zodResolver(sectionSchema),
          defaultValues: {
               courseId: "",
               name: "",
               department: "",
               yearLevel: "",
          },
     });

     function onSubmit(values: SectionFormValues) {
          addSection(values);
          const course = courses.find((c) => c.id === values.courseId);
          toast.success(`Section ${values.name} added to ${course?.code || "Course"}`);
          setOpen(false);
          form.reset();
     }

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogTrigger asChild>
                    <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Section
                    </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[425px]">
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
                                   name="courseId"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Course</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl>
                                                       <SelectTrigger>
                                                            <SelectValue placeholder="Select Course" />
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                       {courses.map((course) => (
                                                            <SelectItem key={course.id} value={course.id}>
                                                                 {course.code} - {course.title}
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
                              <div className="grid grid-cols-2 gap-4">
                                   <FormField
                                        control={form.control}
                                        name="department"
                                        render={({ field }) => (
                                             <FormItem>
                                                  <FormLabel>Department</FormLabel>
                                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                              </div>
                              <DialogFooter>
                                   <Button type="submit" className="bg-[#323d8f] hover:bg-[#323d8f]/90">Add Section</Button>
                              </DialogFooter>
                         </form>
                    </Form>
               </DialogContent>
          </Dialog>
     );
}
