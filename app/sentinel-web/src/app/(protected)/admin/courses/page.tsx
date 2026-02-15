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
import * as z from "zod";
import { toast } from "sonner";
import { useCourseStore } from "@/stores/use-course-store";
import { DataTable } from "@/components/ui/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Course } from "./_types";
import { DataTableColumnHeader } from "@/components/ui/data-table/data-table-column-header";
import { format } from "date-fns";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";

const courseSchema = z.object({
     code: z.string().min(2, "Course code is required"),
     title: z.string().min(5, "Course title is required"),
     department: z.string().min(1, "Department is required"),
     description: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export const columns: ColumnDef<Course>[] = [
     {
          accessorKey: "code",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Code" />
          ),
          cell: ({ row }) => <div className="font-medium">{row.getValue("code")}</div>,
     },
     {
          accessorKey: "title",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Title" />
          ),
          cell: ({ row }) => <div className="max-w-[400px] truncate" title={row.getValue("title")}>{row.getValue("title")}</div>,
     },
     {
          accessorKey: "department",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Department" />
          ),
     },
     {
          accessorKey: "createdAt",
          header: ({ column }) => (
               <DataTableColumnHeader column={column} title="Created At" />
          ),
          cell: ({ row }) => {
               const date = row.getValue("createdAt") as string;
               return <div className="text-muted-foreground">{format(new Date(date), "MMM d, yyyy")}</div>;
          },
     },
];

export default function AdminCoursesPage() {
     const courses = useCourseStore((state) => state.courses);
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
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                         <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
                         <p className="text-muted-foreground">
                              Manage academic programs and courses.
                         </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                         <DialogTrigger asChild>
                              <Button className="bg-[#323d8f] hover:bg-[#323d8f]/90">
                                   <Plus className="w-4 h-4 mr-2" />
                                   Add Course
                              </Button>
                         </DialogTrigger>
                         <DialogContent className="sm:max-w-[500px]">
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
               </div>
               <DataTable
                    columns={columns}
                    data={courses}
                    searchKey="code"
                    facets={[
                         {
                              columnKey: "department",
                              title: "Department",
                              options: [
                                   { label: "SECA", value: "School of Engineering, Computing, and Architecture" },
                                   { label: "SBMA", value: "School of Business, Management, and Accountancy" },
                                   { label: "SASE", value: "School of Arts, Sciences, and Education" },
                                   { label: "General Education", value: "General Education" }, // Include GenEd if needed
                              ]
                         }
                    ]}
               />
          </div>
     );
}
