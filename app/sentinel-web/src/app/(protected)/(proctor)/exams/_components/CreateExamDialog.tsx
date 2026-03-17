"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@sentinel/ui";
import { Button } from "@sentinel/ui";
import { Input } from "@sentinel/ui";
import { Label } from "@sentinel/ui";
import { Textarea } from "@sentinel/ui";
import { Switch } from "@sentinel/ui";
import { useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ExamSetupDraft } from "../types";

export const CreateExamDialog = () => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const [formData, setFormData] = useState<ExamSetupDraft>({
        title: "",
        description: "",
        timeLimit: 60,
        passingScore: 75,
        settings: {
            shuffleQuestions: true,
            showCorrectAnswers: false,
            allowReview: true,
            randomizeChoices: true,
        },
    });

    const handleContinue = () => {
        // In a real app, this would save to a database.
        // For now, we'll just navigate to the builder page.
        setOpen(false);
        router.push("/exams/builder?new=true&title=" + encodeURIComponent(formData.title));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all flex gap-2">
                    <Plus className="h-4 w-4" />
                    Create Exam
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Exam</DialogTitle>
                    <DialogDescription>
                        Set up the basic details for your exam. You can add questions in the next step.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6 border-b border-border/50">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-sm font-semibold">Exam Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Data Structures Midterm"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="bg-secondary/30 border-border/50 focus:ring-primary/20"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Briefly describe the coverage and instructions."
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-secondary/30 border-border/50 focus:ring-primary/20"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="timeLimit" className="text-sm font-semibold">Time Limit (minutes)</Label>
                            <Input
                                id="timeLimit"
                                type="number"
                                value={formData.timeLimit}
                                onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                                className="bg-secondary/30 border-border/50 focus:ring-primary/20"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="passingScore" className="text-sm font-semibold">Passing Score (%)</Label>
                            <Input
                                id="passingScore"
                                type="number"
                                value={formData.passingScore}
                                onChange={(e) => setFormData({ ...formData, passingScore: parseInt(e.target.value) })}
                                className="bg-secondary/30 border-border/50 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 py-4">
                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Exam Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                            <Label htmlFor="shuffle" className="text-xs font-semibold cursor-pointer">Shuffle Questions</Label>
                            <Switch
                                id="shuffle"
                                checked={formData.settings.shuffleQuestions}
                                onCheckedChange={(val) => setFormData({ ...formData, settings: { ...formData.settings, shuffleQuestions: val } })}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                            <Label htmlFor="showAnswers" className="text-xs font-semibold cursor-pointer">Show Correct Answers</Label>
                            <Switch
                                id="showAnswers"
                                checked={formData.settings.showCorrectAnswers}
                                onCheckedChange={(val) => setFormData({ ...formData, settings: { ...formData.settings, showCorrectAnswers: val } })}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                            <Label htmlFor="allowReview" className="text-xs font-semibold cursor-pointer">Allow Review</Label>
                            <Switch
                                id="allowReview"
                                checked={formData.settings.allowReview}
                                onCheckedChange={(val) => setFormData({ ...formData, settings: { ...formData.settings, allowReview: val } })}
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                            <Label htmlFor="randomize" className="text-xs font-semibold cursor-pointer">Randomize Choices</Label>
                            <Switch
                                id="randomize"
                                checked={formData.settings.randomizeChoices}
                                onCheckedChange={(val) => setFormData({ ...formData, settings: { ...formData.settings, randomizeChoices: val } })}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-6 border-t border-border/50">
                    <Button variant="ghost" className="font-semibold" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button 
                        disabled={!formData.title} 
                        className="font-bold px-8 shadow-md"
                        onClick={handleContinue}
                    >
                        Continue to Builder
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
