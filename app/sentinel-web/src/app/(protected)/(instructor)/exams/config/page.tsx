"use client";

import { ChevronLeft } from "lucide-react";
import { Button, Separator, PageHeader } from "@sentinel/ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExamConfigForm } from "@/features/exams";
import { useExamConfigurationQuery, useExamQuery, useUpdateExamConfigurationMutation } from '@sentinel/hooks';
import type { ExamConfig } from '@sentinel/shared/types';

export default function ProctorExamConfigPage() {
     const searchParams = useSearchParams();
     const id = searchParams.get('id');
     const backHref = id ? `/exams/${id}/builder` : "/exams";
     const { data: exam } = useExamQuery(id ?? undefined);
     const { data: configurationState } = useExamConfigurationQuery(id ?? undefined);
     const updateConfigurationMutation = useUpdateExamConfigurationMutation();

     const handleSubmit = async (values: ExamConfig) => {
          if (!id) {
               return;
          }

          await updateConfigurationMutation.mutateAsync({
               examId: id,
               payload: {
                    configuration: values,
               },
          });
     };

     return (
          <div className="flex flex-col gap-6 md:p-6 p-4">
               <PageHeader
                    title={exam ? `${exam.title} Security Configuration` : "Exam Configuration"}
                    description="Manage the actual web and mobile proctoring rules persisted for this exam."
               >
                    <div className="flex items-center gap-2">
                         <Button variant="outline" asChild>
                              <Link href={backHref}>
                                   <ChevronLeft className="w-4 h-4 mr-2" />
                                   Back
                              </Link>
                         </Button>
                         <Button type="submit" form="proctor-config-form">
                              Save Changes
                         </Button>
                    </div>
               </PageHeader>

               <Separator />

               {configurationState ? (
                    <ExamConfigForm
                         defaultValues={configurationState.configuration}
                         onSubmit={handleSubmit}
                    />
               ) : null}
          </div>
     );
}
