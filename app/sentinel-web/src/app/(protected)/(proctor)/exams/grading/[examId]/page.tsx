"use client";

import { use } from "react";
import { GradingStudentList } from "@/app/(protected)/(proctor)/exams/grading/[examId]/_components/grading-student-list";
import { 
     useExportGrades,
     useGradingDetail,
} from "@/app/(protected)/(proctor)/exams/grading/_hooks";
import { Button } from "@sentinel/ui";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

interface ExamGradingPageProps {
     params: Promise<{
          examId: string;
     }>;
}

export default function ExamGradingPage({ params }: ExamGradingPageProps) {
     const { examId } = use(params);
     const { exam, students } = useGradingDetail(examId);
     const { exportToExcel } = useExportGrades();

     return (
          <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
               <div className="flex items-center justify-between space-y-2">
                    <div className="space-y-1">
                         <div className="flex items-center gap-2 text-muted-foreground">
                              <Link href="/grading" className="hover:text-foreground transition-colors">
                                   Grading
                              </Link>
                              <span>/</span>
                              <span>{exam.title}</span>
                         </div>
                         <h2 className="text-2xl font-bold tracking-tight">{exam.title}</h2>
                         <p className="text-muted-foreground">
                              {exam.subject} • {new Date(exam.date).toLocaleDateString()}
                         </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button variant="outline" onClick={() => exportToExcel(students, exam.title)}>
                              <Download className="mr-2 h-4 w-4" />
                              Export to Excel
                         </Button>
                         <Button variant="outline" asChild>
                              <Link href="/grading">
                                   <ArrowLeft className="mr-2 h-4 w-4" />
                                   Back to List
                              </Link>
                         </Button>
                    </div>
               </div>
               <GradingStudentList data={students} />
          </div>
     );
}
