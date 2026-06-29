'use client';

import { PageHeader, Separator } from '@sentinel/ui';
import { ESSAY_RUBRIC_CRITERIA } from '@sentinel/shared';

/**
 * ProctorGuideRubricPage renders the standardized essay rubric table in full-width.
 */
export default function ProctorGuideRubricPage() {
    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Standardized Essay Rubric"
                description="This rubric is automatically applied to all essay-type questions to ensure consistent grading standards."
            />

            <Separator />

            <div className="bg-card overflow-hidden rounded-lg border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr className="bg-muted/50 border-b">
                                <th className="text-muted-foreground w-1/4 p-4 font-semibold">
                                    Criterion
                                </th>
                                <th className="text-muted-foreground w-20 p-4 text-center font-semibold">
                                    Weight
                                </th>
                                <th className="text-muted-foreground p-4 font-semibold">
                                    Description & Grading Levels
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {ESSAY_RUBRIC_CRITERIA.map((criterion) => (
                                <tr key={criterion.key} className="hover:bg-muted/10">
                                    <td className="text-foreground p-4 align-top font-semibold">
                                        {criterion.name}
                                    </td>
                                    <td className="p-4 text-center align-top font-mono text-sm font-semibold">
                                        {criterion.weight * 100}%
                                    </td>
                                    <td className="space-y-3 p-4 align-top">
                                        <p className="text-foreground text-sm font-medium">
                                            {criterion.description}
                                        </p>
                                        <div className="grid grid-cols-1 gap-2 pt-2 text-xs xl:grid-cols-5">
                                            {[4, 3, 2, 1, 0].map((level) => (
                                                <div
                                                    key={level}
                                                    className="bg-muted/30 border-muted-foreground/10 flex flex-col gap-1 rounded-md border p-2.5 shadow-2xs"
                                                >
                                                    <span className="text-foreground font-bold">
                                                        Score {level}
                                                    </span>
                                                    <span className="text-muted-foreground leading-snug">
                                                        {criterion.levels[level]}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
