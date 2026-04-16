import { ExamDescriptionProps } from '@sentinel/shared/types';

export function ExamDescription({ description }: ExamDescriptionProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-foreground mb-2 text-lg font-semibold">Description</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
            </div>

            <div>
                <h3 className="text-foreground mb-3 text-lg font-semibold">Instructions</h3>
                <ul className="space-y-3">
                    {[
                        'Ensure stable internet connection.',
                        'Full-screen mode will be enforced.',
                        'No tab switching allowed.',
                        'Review answers before submitting.',
                    ].map((instruction, i) => (
                        <li key={i} className="text-muted-foreground flex gap-3">
                            <div className="bg-primary mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" />
                            <span>{instruction}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
