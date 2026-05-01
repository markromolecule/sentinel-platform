export function SandboxRolloutNotes() {
    return (
        <div className="bg-muted/30 space-y-4 rounded-xl border p-6">
            <h3 className="text-base font-semibold tracking-tight">Rollout readiness notes</h3>
            <ul className="grid gap-3 sm:grid-cols-2">
                <li className="text-muted-foreground flex items-start gap-3 text-xs leading-relaxed">
                    <span className="bg-primary/40 mt-1 size-1.5 shrink-0 rounded-full" />
                    Support should validate single-face, no-face, and multiple-face scenarios in
                    this sandbox before enabling student rollout toggles.
                </li>
                <li className="text-muted-foreground flex items-start gap-3 text-xs leading-relaxed">
                    <span className="bg-primary/40 mt-1 size-1.5 shrink-0 rounded-full" />
                    Checkup capture should come before live attempt emission so calibration noise is
                    tuned in a lower-risk step.
                </li>
                <li className="text-muted-foreground flex items-start gap-3 text-xs leading-relaxed">
                    <span className="bg-primary/40 mt-1 size-1.5 shrink-0 rounded-full" />
                    Raw video frames and landmarks remain browser-local in v1. Only telemetry
                    payload previews are generated here.
                </li>
                <li className="text-muted-foreground flex items-start gap-3 text-xs leading-relaxed">
                    <span className="bg-primary/40 mt-1 size-1.5 shrink-0 rounded-full" />
                    Existing telemetry rules still decide persistence and severity once attempt
                    emission is wired into the production runtime.
                </li>
            </ul>
        </div>
    );
}
