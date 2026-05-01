import { CardFooter, Button, Spinner } from '@sentinel/ui';
import Link from 'next/link';
import { ExamPrimaryAction } from '@/features/exams/_hooks/use-exam-card/_types';

interface ExamCardFooterProps {
    primaryActions: ExamPrimaryAction[];
}

export function ExamCardFooter({ primaryActions }: ExamCardFooterProps) {
    if (!primaryActions || primaryActions.length === 0) return null;

    return (
        <CardFooter className="flex flex-row items-center gap-3 border-t pt-4">
            {primaryActions.map((action, i) => {
                const buttonContent = (
                    <>
                        {action.isLoading ? (
                            <Spinner className="mr-2 h-4 w-4" />
                        ) : (
                            <action.icon className="mr-2 h-4 w-4" />
                        )}
                        {action.label}
                    </>
                );

                if (action.href && !action.disabled) {
                    return (
                        <Button
                            key={i}
                            asChild
                            className="flex-1"
                            variant={action.variant || 'default'}
                        >
                            <Link href={action.href} onClick={action.onClick}>
                                {buttonContent}
                            </Link>
                        </Button>
                    );
                }

                return (
                    <Button
                        key={i}
                        className="flex-1"
                        variant={action.variant || 'default'}
                        onClick={action.onClick}
                        disabled={action.disabled}
                    >
                        {buttonContent}
                    </Button>
                );
            })}
        </CardFooter>
    );
}
