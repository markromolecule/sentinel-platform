"use client";

interface QuestionMetadataProps {
    difficulty: string;
    points: number;
}

/*
 * Renders the metadata section (difficulty and points) of the question preview.
 */
export function QuestionMetadataSection({
    difficulty,
    points
}: QuestionMetadataProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider text-[10px]">
                Metadata
            </h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Difficulty</p>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500" />
                        <span className="text-sm font-medium">{difficulty}</span>
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Points</p>
                    <span className="text-sm font-medium">{points} pts</span>
                </div>
            </div>
        </div>
    );
}
