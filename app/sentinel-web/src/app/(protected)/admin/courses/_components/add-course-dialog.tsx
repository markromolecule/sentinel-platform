"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useCourseStore } from "@/stores/use-course-store";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { courseSchema, CourseFormValues } from '@sentinel/shared/schema';;

export function AddCourseDialog() {
     const addCourse = useCourseStore((state) => state.addCourse);
     const [open, setOpen] = useState(false);

     const form = useForm<CourseFormValues>({
          resolver: zodResolver(courseSchema),
          defaultValues: {
               code: "",
               title: "",
               department: "",
               description: "",
          },
     });

     function onSubmit(values: CourseFormValues) {
          addCourse(values);
          toast.success(`Course ${values.code} added successfully`);
          setOpen(false);
          form.reset();
     }

     return (
          <Dialog open={open} onOpenChange={setOpen}>
               <DialogTrigger asChild>
                    <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                         <Plus className="w-4 h-4 mr-2" />
                         Add Course
                    </Button>
               </DialogTrigger>
               <DialogContent
                    className="sm:max-w-[500px] data-[state=open]:animate-none data-[state=closed]:animate-none"
                    overlayClassName="data-[state=open]:animate-none data-[state=closed]:animate-none"
               >
                    <DialogHeader>
                         <DialogTitle>Add Course</DialogTitle>
                         <DialogDescription>
                              Create a new academic program or course.
                         </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                         <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                              <FormField
                                   control={form.control}
                                   name="code"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Course Code</FormLabel>
                                             <FormControl>
                                                  <Input placeholder="e.g., BSIT-MWA" {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name="title"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Descriptive Title</FormLabel>
                                             <FormControl>
                                                  <Input placeholder="e.g., Bachelor of Science in Information Technology..." {...field} />
                                             </FormControl>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <FormField
                                   control={form.control}
                                   name="department"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Department</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl>
                                                       <SelectTrigger>
                                                            <SelectValue placeholder="Select Department" />
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                       <SelectItem value="School of Engineering, Computing, and Architecture">School of Engineering, Computing, and Architecture</SelectItem>
                                                       <SelectItem value="School of Business, Management, and Accountancy">School of Business, Management, and Accountancy</SelectItem>
                                                       <SelectItem value="School of Arts, Sciences, and Education">School of Arts, Sciences, and Education</SelectItem>
                                                  </SelectContent>
                                             </Select>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <DialogFooter>
                                   <Button type="submit">Create Course</Button>
                              </DialogFooter>
                         </form>
                    </Form>
               </DialogContent>
          </Dialog>
     );
}
