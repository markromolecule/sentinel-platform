import { Badge, Input, Label } from '@sentinel/ui';

export function SectionHeader({ title, countLabel }: { title: string; countLabel: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold tracking-normal">{title}</h2>
            <Badge variant="secondary">{countLabel}</Badge>
        </div>
    );
}

export function LabeledInput({
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value ?? ''}
                placeholder={placeholder}
                onChange={(event) => onChange(event.target.value)}
            />
        </div>
    );
}
