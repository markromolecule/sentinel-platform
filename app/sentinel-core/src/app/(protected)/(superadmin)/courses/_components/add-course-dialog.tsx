"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@sentinel/ui";
import {
     Dialog,
     DialogContent,
     DialogDescription,
     DialogFooter,
     DialogHeader,
     DialogTitle,
     DialogTrigger,
} from "@sentinel/ui";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { useDepartmentsQuery } from "@/hooks/query/departments/use-departments-query";
import { useAddCourseForm } from "../_hooks/use-add-course-form";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@sentinel/ui";

export function AddCourseDialog() {
     const [open, setOpen] = useState(false);
     const { data: departments = [], isLoading: isLoadingDepartments } = useDepartmentsQuery();
     const { form, onSubmit, isPending } = useAddCourseForm(() => setOpen(false));

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
                                   name="department_id"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel>Department</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                                                  <FormControl>
                                                       <SelectTrigger>
                                                            <SelectValue placeholder="Select Department" />
                                                       </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                       {isLoadingDepartments ? (
                                                            <SelectItem value="loading" disabled>Loading departments...</SelectItem>
                                                       ) : departments.map((dept) => (
                                                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                                       ))}
                                                  </SelectContent>
                                             </Select>
                                             <FormMessage />
                                        </FormItem>
                                   )}
                              />
                              <DialogFooter>
                                   <Button type="submit" disabled={isPending}>
                                        {isPending ? "Creating..." : "Create Course"}
                                   </Button>
                              </DialogFooter>
                         </form>
                    </Form>
               </DialogContent>
          </Dialog>
     );
}
