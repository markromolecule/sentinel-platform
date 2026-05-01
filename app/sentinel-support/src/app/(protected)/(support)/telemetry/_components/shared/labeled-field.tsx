'use client';

export type LabeledFieldProps = {
    label: string;
    description?: string;
    children: React.ReactNode;
};

export function LabeledField({ label, description, children }: LabeledFieldProps) {
    return (
        <label className="grid gap-2">
            <div className="space-y-1">
                <span className="block text-sm font-semibold tracking-tight">{label}</span>
                {description ? (
                    <span className="text-muted-foreground block text-xs leading-relaxed">
                        {description}
                    </span>
                ) : null}
            </div>
            {children}
        </label>
    );
}
