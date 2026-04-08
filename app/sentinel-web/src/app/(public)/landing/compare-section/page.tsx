import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@sentinel/ui';
import { cn } from '@sentinel/ui';
import { FEATURES, type CompareFeature } from '@/app/(public)/landing/compare-section/_constants';

type CompareValueKey = Exclude<keyof CompareFeature, 'name' | 'description'>;

const COMPARISON_COLUMNS: Array<{
    key: CompareValueKey;
    label: string;
    isPrimary?: boolean;
}> = [
    { key: 'sentinel', label: 'Sentinel', isPrimary: true },
    { key: 'proctorU', label: 'ProctorU' },
    { key: 'seb', label: 'SEB' },
    { key: 'examSoft', label: 'ExamSoft' },
    { key: 'respondus', label: 'Respondus' },
];

export default function CompareSection() {
    return (
        <section
            id="compare"
            className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-[#0f0f10] py-24 md:py-32"
        >
            <BackgroundGrid />

            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
                <Header />

                <div className="scroller w-full overflow-x-auto">
                    <div className="mx-auto w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/8 bg-[#111214]/80 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
                        <Table className="mx-auto w-full min-w-[1080px] table-fixed border-separate border-spacing-0">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[340px] border-b border-white/8 px-7 py-6 text-left align-bottom font-sans text-sm font-semibold tracking-[0.16em] text-gray-400 uppercase">
                                        What Matters
                                    </TableHead>
                                    {COMPARISON_COLUMNS.map((column) => (
                                        <BrandHeader key={column.key} column={column} />
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {FEATURES.map((feature: CompareFeature, index: number) => (
                                    <ComparisonRow
                                        key={index}
                                        feature={feature}
                                        isLast={index === FEATURES.length - 1}
                                    />
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
                <MobileScrollHint />
            </div>
        </section>
    );
}

// --- Sub Components ---
function BackgroundGrid() {
    return (
        <div className="bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)]"></div>
    );
}

function Header() {
    return (
        <div className="mb-12 flex flex-col items-start text-left md:mb-16 md:items-center md:text-center">
            <div className="mb-6 inline-flex items-center gap-2">
                <Image
                    src="/icons/icon0.svg"
                    alt="Sentinel"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                />
                <span className="text-base font-medium text-gray-400">Comparisons</span>
            </div>
            <h2 className="max-w-3xl text-3xl leading-tight font-normal tracking-tight text-blue-100 md:text-5xl">
                Compare the essentials at a glance.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-400 md:text-lg">
                A cleaner view of device coverage, monitoring depth, pricing, and support.
            </p>
        </div>
    );
}

function BrandHeader({ column }: { column: (typeof COMPARISON_COLUMNS)[number] }) {
    if (column.isPrimary) {
        return (
            <TableHead className="w-[200px] border-x border-b border-blue-200/12 bg-[linear-gradient(180deg,rgba(122,188,255,0.12),rgba(255,255,255,0.03))] px-6 py-6 text-center align-bottom">
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/icons/icon0.svg"
                            alt="Sentinel"
                            width={20}
                            height={20}
                            className="h-5 w-5"
                        />
                        <span className="font-sans text-base font-semibold tracking-tight text-white">
                            {column.label}
                        </span>
                    </div>
                    <span className="text-[11px] font-medium tracking-[0.18em] text-blue-100 uppercase">
                        Recommended
                    </span>
                </div>
            </TableHead>
        );
    }

    return (
        <TableHead className="w-[135px] border-b border-white/8 px-4 py-6 text-center align-middle font-sans text-sm font-medium text-gray-500">
            {column.label}
        </TableHead>
    );
}

function ComparisonRow({ feature, isLast }: { feature: CompareFeature; isLast: boolean }) {
    const borderClass = isLast ? '' : 'border-b border-white/[0.06]';
    const cellPadding = 'py-6';

    return (
        <TableRow className="group hover:bg-transparent">
            <TableCell className={cn('px-7 align-middle', cellPadding, borderClass)}>
                <div>
                    <p className="font-sans text-[15px] font-semibold tracking-tight text-gray-100 md:text-base">
                        {feature.name}
                    </p>
                    <p className="mt-1 max-w-[240px] text-sm leading-6 text-gray-500">
                        {feature.description}
                    </p>
                </div>
            </TableCell>

            {COMPARISON_COLUMNS.map((column) => (
                <ComparisonCell
                    key={column.key}
                    value={feature[column.key]}
                    borderClass={borderClass}
                    padding={cellPadding}
                    isPrimary={column.isPrimary === true}
                />
            ))}
        </TableRow>
    );
}

function ComparisonCell({
    value,
    borderClass,
    padding,
    isPrimary,
}: {
    value: string | boolean;
    borderClass: string;
    padding: string;
    isPrimary: boolean;
}) {
    return (
        <TableCell
            className={cn(
                'px-3 text-center align-middle md:px-4',
                padding,
                borderClass,
                isPrimary &&
                    'bg-[linear-gradient(180deg,rgba(122,188,255,0.08),rgba(255,255,255,0.02))] px-0',
                isPrimary && 'border-x border-blue-200/12',
            )}
        >
            <div className="flex items-center justify-center">
                <div
                    className={cn(
                        isPrimary && 'flex h-full w-full items-center justify-center px-4',
                    )}
                >
                    <ValueDisplay value={value} isPrimary={isPrimary} />
                </div>
            </div>
        </TableCell>
    );
}

function ValueDisplay({ value, isPrimary }: { value: string | boolean; isPrimary: boolean }) {
    const displayValue = formatValue(value);

    return (
        <div
            className={cn(
                'flex min-h-10 items-center justify-center',
                isPrimary && 'rounded-full border border-blue-100/10 bg-white/[0.02] px-3.5',
            )}
        >
            <span
                className={cn(
                    'block max-w-full text-center text-sm leading-relaxed font-medium break-words whitespace-normal',
                    isPrimary ? 'font-sans text-white' : 'text-gray-400',
                    typeof value === 'boolean' && 'tracking-[0.14em] uppercase',
                    value === false && !isPrimary && 'text-gray-600',
                )}
            >
                {displayValue}
            </span>
        </div>
    );
}

function formatValue(value: string | boolean) {
    if (value === true) {
        return 'Yes';
    }

    if (value === false) {
        return 'No';
    }

    return value;
}

function MobileScrollHint() {
    return (
        <div className="mt-4 flex justify-center md:hidden">
            <span className="text-[11px] tracking-[0.2em] text-gray-500 uppercase">
                Scroll to compare
            </span>
        </div>
    );
}
