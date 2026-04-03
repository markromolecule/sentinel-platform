"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Badge,
    Button,
    PageHeader,
    Separator,
} from "@sentinel/ui";
import { ArrowLeft } from "lucide-react";
import { QuestionsTable } from "@/app/(protected)/(instructor)/question/bank/_components/questions-table";
import { useQuestionBank } from "@/features/questions/store/use-question-bank";

export default function CollectionQuestionsPage() {
    const router = useRouter();
    const params = useParams<{ collectionId: string }>();
    const { collections, questions } = useQuestionBank();

    const collection = React.useMemo(
        () => collections.find((item) => item.id === params.collectionId),
        [collections, params.collectionId],
    );

    const collectionQuestions = React.useMemo(() => {
        if (!collection) {
            return [];
        }

        return questions.filter((question) => collection.questionIds.includes(question.id));
    }, [collection, questions]);

    if (!collection) {
        return (
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Collection Not Found"
                    description="The collection you are trying to open does not exist anymore."
                >
                    <Button
                        variant="outline"
                        onClick={() => router.push("/question/bank/collections")}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Collections
                    </Button>
                </PageHeader>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/question/bank/collections")}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Collections
                </Button>
            </div>

            <PageHeader
                title={collection.name}
                description={collection.description || "Questions saved inside this collection."}
            >
                <Badge variant="secondary">{collectionQuestions.length} questions</Badge>
            </PageHeader>

            <Separator />

            <QuestionsTable questions={collectionQuestions} />
        </div>
    );
}
