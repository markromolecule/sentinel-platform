'use client';

import * as React from 'react';
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Label,
    PermissionDeniedState,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@sentinel/ui';
import {
    useActivePermissions,
    useAnswerKeyExportDownloadMutation,
    useAnswerKeyExportsQuery,
    useCreateAnswerKeyExportMutation,
    useDeleteAnswerKeyExportMutation,
    useExamsQuery,
    useInstitutionsQuery,
    usePdfTemplatesQuery,
    usePreviewPdfTemplateMutation,
    usePublishPdfTemplateMutation,
    useRetryAnswerKeyExportMutation,
    useSavePdfTemplateDraftMutation,
    type FooterConfig,
    type HeaderConfig,
} from '@/data';
import {
    AnswerKeyExportsPanel,
    PdfTemplatePageShell,
    TemplateHeaderFooterFields,
    TemplatePreviewCard,
    TemplateStatusCard,
} from '../_components';
import { toast } from 'sonner';

const DEFAULT_HEADER_CONFIG: HeaderConfig = {
    logo_visible: true,
    logo_placement: 'LEFT',
    logo_max_size_px: 120,
    title_text: 'Examination Answer Key',
    title_alignment: 'LEFT',
    subtitle_text: 'Authorized support export',
    subtitle_alignment: 'LEFT',
    divider_visible: true,
    divider_color: '#D1D5DB',
    accent_color: '#3B82F6',
    sentinel_logo_visible: false,
};

const DEFAULT_FOOTER_CONFIG: FooterConfig = {
    text: 'Contains authorized answer key content.',
    confidentiality_label: 'Restricted',
    divider_visible: true,
    divider_color: '#E5E7EB',
    page_number_visible: true,
    page_number_format: 'PAGE_X_OF_Y',
};

export default function PdfTemplateExaminationsPage() {
    const { hasAnyPermission, hasPermission } = useActivePermissions();
    const canView = hasAnyPermission(['pdf_templates:view', 'pdf_templates:manage']);
    const canManageTemplate = hasPermission('pdf_templates:manage');
    const canExportAnswerKey = hasPermission('examinations:export_answer_key');

    const { data: institutions = [] } = useInstitutionsQuery();
    const [selectedInstitutionId, setSelectedInstitutionId] = React.useState('');
    const [selectedExamId, setSelectedExamId] = React.useState('');
    const [headerConfig, setHeaderConfig] = React.useState<HeaderConfig>(DEFAULT_HEADER_CONFIG);
    const [footerConfig, setFooterConfig] = React.useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
    const [previewBlob, setPreviewBlob] = React.useState<Blob | null>(null);
    const [activeDownloadId, setActiveDownloadId] = React.useState<string | null>(null);
    const [activeRetryId, setActiveRetryId] = React.useState<string | null>(null);
    const [activeDeleteId, setActiveDeleteId] = React.useState<string | null>(null);

    const templatesQuery = usePdfTemplatesQuery({
        payload: {
            institutionId: selectedInstitutionId || null,
            documentKind: 'EXAM_ANSWER_KEY',
        },
        enabled: canView && Boolean(selectedInstitutionId),
    });

    const examsQuery = useExamsQuery(
        {
            institutionId: selectedInstitutionId || undefined,
            viewer: 'staff',
        },
        {
            enabled: canView && Boolean(selectedInstitutionId),
        },
    );

    const answerKeyExportsQuery = useAnswerKeyExportsQuery({
        payload: {
            institutionId: selectedInstitutionId || undefined,
            examId: selectedExamId || undefined,
            page: 1,
            limit: 20,
        },
        enabled: canView && Boolean(selectedInstitutionId),
    });

    const saveDraftMutation = useSavePdfTemplateDraftMutation();
    const publishMutation = usePublishPdfTemplateMutation();
    const previewMutation = usePreviewPdfTemplateMutation();
    const createExportMutation = useCreateAnswerKeyExportMutation();
    const downloadMutation = useAnswerKeyExportDownloadMutation();
    const retryMutation = useRetryAnswerKeyExportMutation();
    const deleteMutation = useDeleteAnswerKeyExportMutation();

    const draftTemplate = React.useMemo(
        () => templatesQuery.data?.find((template) => template.status === 'DRAFT') ?? null,
        [templatesQuery.data],
    );
    const publishedTemplate = React.useMemo(
        () => templatesQuery.data?.find((template) => template.status === 'PUBLISHED') ?? null,
        [templatesQuery.data],
    );
    const workingTemplate = draftTemplate ?? publishedTemplate;

    React.useEffect(() => {
        setHeaderConfig(workingTemplate?.header_config ?? DEFAULT_HEADER_CONFIG);
        setFooterConfig(workingTemplate?.footer_config ?? DEFAULT_FOOTER_CONFIG);
        setPreviewBlob(null);
    }, [workingTemplate?.template_id, workingTemplate?.updated_at, selectedInstitutionId]);

    const hasUnsavedChanges = React.useMemo(() => {
        return (
            JSON.stringify(workingTemplate?.header_config ?? DEFAULT_HEADER_CONFIG) !==
                JSON.stringify(headerConfig) ||
            JSON.stringify(workingTemplate?.footer_config ?? DEFAULT_FOOTER_CONFIG) !==
                JSON.stringify(footerConfig)
        );
    }, [footerConfig, headerConfig, workingTemplate]);

    if (!canView) {
        return <PermissionDeniedState resourceName="pdf templates" />;
    }

    return (
        <PdfTemplatePageShell
            title="Examination Answer Key"
            description="Manage answer key template settings and queue answer key PDF exports for a selected institution and exam."
            actions={
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant="outline"
                        disabled={
                            !selectedInstitutionId ||
                            !canManageTemplate ||
                            !hasUnsavedChanges ||
                            saveDraftMutation.isPending
                        }
                        onClick={async () => {
                            try {
                                await saveDraftMutation.mutateAsync({
                                    institution_id: selectedInstitutionId,
                                    document_kind: 'EXAM_ANSWER_KEY',
                                    header_config: headerConfig,
                                    footer_config: footerConfig,
                                });
                                toast.success('Draft saved');
                            } catch (error: any) {
                                toast.error(error?.message || 'Failed to save the draft.');
                            }
                        }}
                    >
                        {saveDraftMutation.isPending ? 'Saving...' : 'Save draft'}
                    </Button>
                    <Button
                        disabled={
                            !selectedInstitutionId ||
                            !canManageTemplate ||
                            !draftTemplate?.template_id ||
                            publishMutation.isPending
                        }
                        onClick={async () => {
                            if (!draftTemplate?.template_id) {
                                return;
                            }
                            try {
                                await publishMutation.mutateAsync({
                                    templateId: draftTemplate.template_id,
                                    institutionId: selectedInstitutionId,
                                    documentKind: 'EXAM_ANSWER_KEY',
                                });
                                toast.success('Template published');
                            } catch (error: any) {
                                toast.error(error?.message || 'Failed to publish the template.');
                            }
                        }}
                    >
                        {publishMutation.isPending ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            }
        >
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Scope</CardTitle>
                        <CardDescription>
                            Choose an institution first, then filter exams that belong to that
                            institution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="answer-key-institution">Institution</Label>
                            <Select
                                value={selectedInstitutionId}
                                onValueChange={(value) => {
                                    setSelectedInstitutionId(value);
                                    setSelectedExamId('');
                                }}
                            >
                                <SelectTrigger id="answer-key-institution">
                                    <SelectValue placeholder="Choose an institution" />
                                </SelectTrigger>
                                <SelectContent>
                                    {institutions.map((institution) => (
                                        <SelectItem key={institution.id} value={institution.id}>
                                            {institution.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="answer-key-exam">Exam</Label>
                            <Select
                                value={selectedExamId}
                                onValueChange={setSelectedExamId}
                                disabled={!selectedInstitutionId}
                            >
                                <SelectTrigger id="answer-key-exam">
                                    <SelectValue
                                        placeholder={
                                            selectedInstitutionId
                                                ? 'Choose an exam'
                                                : 'Choose an institution first'
                                        }
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {(examsQuery.data ?? []).map((exam) => (
                                        <SelectItem key={exam.id} value={exam.id}>
                                            {exam.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <TemplateHeaderFooterFields
                            headerConfig={headerConfig}
                            footerConfig={footerConfig}
                            onHeaderChange={setHeaderConfig}
                            onFooterChange={setFooterConfig}
                        />
                        <TemplatePreviewCard
                            previewBlob={previewBlob}
                            isGenerating={previewMutation.isPending}
                            onGeneratePreview={async () => {
                                if (!selectedInstitutionId) {
                                    toast.error(
                                        'Choose an institution before generating a preview.',
                                    );
                                    return;
                                }
                                try {
                                    const blob = await previewMutation.mutateAsync({
                                        institution_id: selectedInstitutionId,
                                        document_kind: 'EXAM_ANSWER_KEY',
                                        header_config: headerConfig,
                                        footer_config: footerConfig,
                                    });
                                    setPreviewBlob(blob);
                                } catch (error: any) {
                                    toast.error(error?.message || 'Failed to render the preview.');
                                }
                            }}
                        />
                    </div>

                    <div className="space-y-6">
                        <TemplateStatusCard
                            template={workingTemplate}
                            scopeLabel="Institution answer key template"
                            hasUnsavedChanges={hasUnsavedChanges}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Generate answer key</CardTitle>
                                <CardDescription>
                                    Queue a PDF export using the currently published answer key
                                    template.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button
                                    disabled={
                                        !selectedInstitutionId ||
                                        !selectedExamId ||
                                        !canExportAnswerKey ||
                                        createExportMutation.isPending
                                    }
                                    onClick={async () => {
                                        try {
                                            await createExportMutation.mutateAsync({
                                                exam_id: selectedExamId,
                                                institution_id: selectedInstitutionId,
                                            });
                                            toast.success('Answer key export queued');
                                        } catch (error: any) {
                                            toast.error(
                                                error?.message ||
                                                    'Failed to queue the answer key export.',
                                            );
                                        }
                                    }}
                                >
                                    {createExportMutation.isPending
                                        ? 'Queueing...'
                                        : 'Generate answer key'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <AnswerKeyExportsPanel
                    exports={answerKeyExportsQuery.data?.records ?? []}
                    canExport={canView}
                    canManage={canManageTemplate}
                    activeDownloadId={activeDownloadId}
                    activeRetryId={activeRetryId}
                    activeDeleteId={activeDeleteId}
                    onDownload={async (exportId) => {
                        try {
                            setActiveDownloadId(exportId);
                            const response = await downloadMutation.mutateAsync(exportId);
                            window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
                        } catch (error: any) {
                            toast.error(
                                error?.message || 'Failed to prepare the answer key download.',
                            );
                        } finally {
                            setActiveDownloadId(null);
                        }
                    }}
                    onRetry={async (exportId) => {
                        try {
                            setActiveRetryId(exportId);
                            await retryMutation.mutateAsync({
                                exportId,
                                institutionId: selectedInstitutionId,
                                examId: selectedExamId || undefined,
                            });
                            toast.success('Answer key retry queued');
                        } catch (error: any) {
                            toast.error(error?.message || 'Failed to retry the answer key export.');
                        } finally {
                            setActiveRetryId(null);
                        }
                    }}
                    onDelete={async (exportId) => {
                        try {
                            setActiveDeleteId(exportId);
                            await deleteMutation.mutateAsync({
                                exportId,
                                institutionId: selectedInstitutionId,
                                examId: selectedExamId || undefined,
                            });
                            toast.success('Answer key export deleted');
                        } catch (error: any) {
                            toast.error(
                                error?.message || 'Failed to delete the answer key export.',
                            );
                        } finally {
                            setActiveDeleteId(null);
                        }
                    }}
                />
            </div>
        </PdfTemplatePageShell>
    );
}
