import { Badge, Card, Label, NativeSelect, NativeSelectOption } from '@sentinel/ui';
import type { WizardDraft } from '../_types';
import { LabeledInput, SectionHeader } from '../shared-ui';

export function NamingStep({
    draft,
    updateDraft,
}: {
    draft: WizardDraft;
    updateDraft: (updater: (current: WizardDraft) => WizardDraft) => void;
}) {
    return (
        <section className="space-y-8">
            <SectionHeader title="Institution Standards" countLabel="Configuring" />

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Room Standards */}
                <Card className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Room Standards</h3>
                        <Badge variant="outline">Physical & Virtual</Badge>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <LabeledInput
                            label="Display Label"
                            value={draft.naming.room.label}
                            placeholder="Room"
                            onChange={(val) =>
                                updateDraft((c) => ({
                                    ...c,
                                    naming: {
                                        ...c.naming,
                                        room: { ...c.naming.room, label: val },
                                    },
                                }))
                            }
                        />
                        <LabeledInput
                            label="Physical Prefix"
                            value={draft.naming.room.prefix}
                            placeholder="RM"
                            onChange={(val) =>
                                updateDraft((c) => ({
                                    ...c,
                                    naming: {
                                        ...c.naming,
                                        room: { ...c.naming.room, prefix: val },
                                    },
                                }))
                            }
                        />
                        <LabeledInput
                            label="Virtual Prefix"
                            value={draft.naming.room.virtualPrefix}
                            placeholder="VR"
                            onChange={(val) =>
                                updateDraft((c) => ({
                                    ...c,
                                    naming: {
                                        ...c.naming,
                                        room: { ...c.naming.room, virtualPrefix: val },
                                    },
                                }))
                            }
                        />
                    </div>
                    <div className="mt-6 rounded-lg border border-dashed border-[#323d8f]/20 bg-[#323d8f]/5 p-4">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#323d8f]">
                            Smart Preview
                        </p>
                        <div className="space-y-1 font-mono text-sm">
                            <p className="text-[#323d8f]">
                                {draft.naming.room.label} 501 &mdash; {draft.naming.room.prefix}501
                                &mdash; Laboratory
                            </p>
                            <p className="text-muted-foreground">
                                {draft.naming.room.label} 401 &mdash; {draft.naming.room.prefix}401
                                &mdash; Lecture
                            </p>
                            <p className="text-muted-foreground">
                                Virtual &mdash; {draft.naming.room.virtualPrefix}101
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Section Standards */}
                <Card className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-semibold">Section Conventions</h3>
                        <Badge variant="outline">Course-Scoped</Badge>
                    </div>
                    
                    <div className="space-y-4">
                        {draft.courses.length === 0 ? (
                            <p className="text-muted-foreground text-sm italic">
                                Add courses in the previous step to configure section naming.
                            </p>
                        ) : (
                            draft.courses.map((course) => {
                                const rule = draft.naming.sectionRulesByCourseClientId[course.clientId] || {
                                    format: '{COURSE}-{YEAR}{SECTION}',
                                    preview: `${course.code}-1A`
                                };
                                
                                return (
                                    <div key={course.clientId} className="space-y-2 border-b pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <Label className="font-medium">{course.title || 'Untitled Course'} ({course.code || 'NO-CODE'})</Label>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <LabeledInput
                                                label="Format Pattern"
                                                value={rule.format}
                                                placeholder="{COURSE}-{YEAR}{SECTION}"
                                                onChange={(val) =>
                                                    updateDraft((c) => ({
                                                        ...c,
                                                        naming: {
                                                            ...c.naming,
                                                            sectionRulesByCourseClientId: {
                                                                ...c.naming.sectionRulesByCourseClientId,
                                                                [course.clientId]: {
                                                                    ...rule,
                                                                    format: val,
                                                                    courseClientId: course.clientId,
                                                                    // Simple preview generation for UI feedback
                                                                    preview: val
                                                                        .replace('{COURSE}', course.code || 'BSIT')
                                                                        .replace('{YEAR}', '1')
                                                                        .replace('{SECTION}', 'A')
                                                                }
                                                            }
                                                        },
                                                    }))
                                                }
                                            />
                                            <div className="flex flex-col justify-end">
                                                <div className="rounded border border-dashed border-slate-200 bg-slate-50 p-2 text-xs">
                                                    <span className="text-muted-foreground mr-2 font-bold uppercase tracking-tighter">Preview:</span>
                                                    <span className="font-mono">{rule.preview}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Card>
            </div>
        </section>
    );
}
