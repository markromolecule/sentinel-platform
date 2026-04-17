interface PreviewPageHeaderProps {
    title: string;
    description: string;
}

export function PreviewPageHeader({ title, description }: PreviewPageHeaderProps) {
    return (
        <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-[30px]">
                {title}
            </h1>
            <p className="text-muted-foreground text-sm leading-6 sm:text-[15px]">
                {description}
            </p>
        </div>
    );
}
