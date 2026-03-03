import Image from "next/image";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { FEATURES } from '@sentinel/shared/constants';;

export default function CompareSection() {
  return (
    <section id="compare" className="min-h-screen flex flex-col justify-center py-20 md:py-32 bg-[#0f0f10] relative overflow-hidden">
      <BackgroundGrid />

      <div className="container mx-auto px-6 relative z-10 w-full max-w-7xl">
        <Header />

        <div className="relative w-full flex justify-center">
          <div className="overflow-x-auto scroller pb-8 w-full max-w-5xl mx-auto">
            <Table className="min-w-[900px] border-separate border-spacing-0 w-full mx-auto">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="py-4 pl-0 text-sm font-semibold text-gray-400 w-[240px] text-left align-bottom pb-6">
                    Features
                  </TableHead>
                  {/* Sentinel Header with highlight */}
                  <TableHead className="p-0 align-bottom w-[200px] relative">
                    <div className="relative bg-[#1c1c1f] rounded-t-3xl border-x border-t border-blue-500/20 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                      <div className="py-6 px-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Image src="/icons/icon0.svg" alt="Sentinel" width={20} height={20} className="w-5 h-5" />
                          <span className="text-xl font-bold text-white">Sentinel</span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10">Recommended</span>
                      </div>
                    </div>
                  </TableHead>

                  <BrandHeader name="ProctorU" />
                  <BrandHeader name="SEB" />
                  <BrandHeader name="ExamSoft" />
                  <BrandHeader name="Respondus" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURES.map((feature, index) => (
                  <ComparisonRow
                    key={index}
                    feature={feature}
                    isLast={index === FEATURES.length - 1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <MobileScrollHint />
        </div>
      </div>
    </section>
  );
}

// --- Sub Components ---
function BackgroundGrid() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-size:40px_40px mask-linear-gradient(to_bottom,black_40%,transparent_100%) pointer-events-none"></div>
  );
}

function Header() {
  return (
    <div className="flex flex-col items-start text-left md:items-center md:text-center mb-16">
      <div className="inline-flex items-center gap-2 mb-6">
        <Image src="/icons/icon0.svg" alt="Sentinel" width={20} height={20} className="w-5 h-5" />
        <span className="text-base text-gray-400 font-medium">Comparisons</span>
      </div>
      <h2 className="text-3xl md:text-5xl font-normal text-blue-200 mb-6 font-sans tracking-tight max-w-[100%] md:whitespace-nowrap leading-tight">
        Comprehensive proctoring comparison.
      </h2>
      <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
        See why Sentinel is the best proctoring solution for your institution.
      </p>
    </div>
  );
}

function BrandHeader({ name }: { name: string }) {
  return (
    <TableHead className="text-center py-4 px-4 text-base font-medium text-gray-500 w-[160px] align-bottom pb-6">
      {name}
    </TableHead>
  );
}

function ComparisonRow({
  feature,
  isLast
}: {
  feature: typeof FEATURES[number],
  isLast: boolean
}) {
  // Shared border styles
  const borderClass = "border-b border-white/[0.03]";
  // Adjusted padding to 'py-4' to lessen height
  const cellPadding = "py-4";

  return (
    <TableRow className="hover:bg-transparent group">
      {/* Feature Label Cell */}
      <TableCell className={cn("pl-0 align-middle", cellPadding, borderClass)}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-blue-400 transition-colors shrink-0">
            <feature.icon className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <span className="text-sm md:text-base font-medium text-gray-300">{feature.name}</span>
        </div>
      </TableCell>

      {/* Sentinel Value Cell - Highlighted */}
      <TableCell className={cn(
        "p-0 align-middle bg-[#1c1c1f] border-x border-blue-500/20 relative",
        isLast ? "rounded-b-3xl border-b" : ""
      )}>
        {/* Inner styling wrapper */}
        <div className={cn(
          "h-full w-full flex flex-col items-center justify-center mx-auto",
          cellPadding,
          !isLast && "border-b border-white/[0.05]"
        )}>
          <ValueDisplay value={feature.sentinel} isPrimary />
        </div>

        {/* Glow effect for active row */}
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
      </TableCell>

      <ComparisonCell value={feature.proctorU} borderClass={borderClass} padding={cellPadding} />
      <ComparisonCell value={feature.seb} borderClass={borderClass} padding={cellPadding} />
      <ComparisonCell value={feature.examSoft} borderClass={borderClass} padding={cellPadding} />
      <ComparisonCell value={feature.respondus} borderClass={borderClass} padding={cellPadding} />
    </TableRow>
  );
}

function ComparisonCell({ value, borderClass, padding }: { value: string | boolean, borderClass: string, padding: string }) {
  return (
    <TableCell className={cn("text-center px-4 align-middle", padding, borderClass)}>
      <div className="flex items-center justify-center">
        <ValueDisplay value={value} isPrimary={false} />
      </div>
    </TableCell>
  );
}

function ValueDisplay({ value, isPrimary }: { value: string | boolean, isPrimary: boolean }) {
  if (value === true) {
    return (
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        isPrimary ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "text-gray-400"
      )}>
        <Check className="w-4 h-4" strokeWidth={3} />
      </div>
    );
  }

  if (value === false) {
    return (
      <X className="w-4 h-4 text-gray-700" strokeWidth={2} />
    );
  }

  return (
    <span className={cn(
      "text-sm font-medium text-center block max-w-[140px]",
      isPrimary ? "text-white" : "text-gray-500"
    )}>
      {value}
    </span>
  );
}

function MobileScrollHint() {
  return (
    <div className="md:hidden flex justify-center mt-6 gap-2 opacity-30">
      <div className="w-1 h-1 rounded-full bg-white"></div>
      <div className="w-1 h-1 rounded-full bg-white"></div>
      <div className="w-1 h-1 rounded-full bg-white"></div>
    </div>
  );
}
