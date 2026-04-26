'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sentinel/ui';

type AccessControlGuideTableProps = {
    items: {
        step: string;
        title: string;
        detail: string;
    }[];
};

export function AccessControlGuideTable({ items }: AccessControlGuideTableProps) {
    return (
        <div data-lenis-prevent className="overflow-x-auto">
            <Table className="min-w-[720px] table-fixed">
                <TableHeader>
                    <TableRow className="bg-background hover:bg-background">
                        <TableHead className="w-[18%] whitespace-normal">Step</TableHead>
                        <TableHead className="w-[27%] whitespace-normal">What you do</TableHead>
                        <TableHead className="whitespace-normal">Why it matters</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((item) => (
                        <TableRow key={item.step}>
                            <TableCell className="align-top font-medium whitespace-normal">
                                {item.step}
                            </TableCell>
                            <TableCell className="align-top whitespace-normal">
                                {item.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground align-top whitespace-normal">
                                {item.detail}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
