'use client';

import * as React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Button,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@sentinel/ui';
import type { FooterConfig, HeaderConfig, InstitutionPdfBranding, PdfTemplate } from '@/data';
import { BrandingUploadCard } from './branding-upload-card';
import { TemplateHeaderFooterFields } from './template-header-footer-fields';
import { TemplatePreviewCard } from './template-preview-card';
import { TemplateStatusCard } from './template-status-card';

type ScopeOption = {
    value: string;
    label: string;
};

type ReportTemplateEditorProps = {
    scopeValue: string;
    scopeOptions: ScopeOption[];
    onScopeChange: (value: string) => void;
    scopeHint?: string | null;
    scopeError?: string | null;
    isScopeLoading?: boolean;
    template: PdfTemplate | null;
    scopeLabel: string;
    hasUnsavedChanges: boolean;
    headerConfig: HeaderConfig;
    footerConfig: FooterConfig;
    onHeaderChange: (next: HeaderConfig) => void;
    onFooterChange: (next: FooterConfig) => void;
    branding: InstitutionPdfBranding | null;
    brandingDisabled?: boolean;
    brandingGlobalMessage?: string | null;
    isUploadingBranding?: boolean;
    isRemovingBranding?: boolean;
    onUploadBranding: (file: File) => void;
    onRemoveBranding: () => void;
    previewBlob: Blob | null;
    isGeneratingPreview: boolean;
    onGeneratePreview: () => void;
    showResetOverride?: boolean;
    isResettingOverride?: boolean;
    onResetOverride?: () => void;
};

export function ReportTemplateEditor({
    scopeValue,
    scopeOptions,
    onScopeChange,
    scopeHint,
    scopeError,
    isScopeLoading,
    template,
    scopeLabel,
    hasUnsavedChanges,
    headerConfig,
    footerConfig,
    onHeaderChange,
    onFooterChange,
    branding,
    brandingDisabled,
    brandingGlobalMessage,
    isUploadingBranding,
    isRemovingBranding,
    onUploadBranding,
    onRemoveBranding,
    previewBlob,
    isGeneratingPreview,
    onGeneratePreview,
    showResetOverride,
    isResettingOverride,
    onResetOverride,
}: ReportTemplateEditorProps) {
    const [activeTab, setActiveTab] = React.useState<'header' | 'footer' | 'branding'>('header');
    const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
    const panelRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        panelRef.current?.focus();
    }, [activeTab]);

    return (
        <div className="space-y-6">
            <section className="bg-background rounded-2xl border p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="report-template-scope">Template scope</Label>
                            <Select value={scopeValue} onValueChange={onScopeChange}>
                                <SelectTrigger id="report-template-scope">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {scopeOptions.map((scopeOption) => (
                                        <SelectItem
                                            key={scopeOption.value}
                                            value={scopeOption.value}
                                        >
                                            {scopeOption.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {isScopeLoading ? (
                            <p className="text-muted-foreground text-sm">
                                Loading parent institutions…
                            </p>
                        ) : null}
                        {scopeError ? (
                            <p className="text-destructive text-sm">{scopeError}</p>
                        ) : null}
                        {scopeHint ? (
                            <p className="text-muted-foreground text-sm">{scopeHint}</p>
                        ) : null}
                    </div>

                    <div className="flex min-w-0 flex-col gap-3 xl:max-w-md xl:items-end">
                        <TemplateStatusCard
                            template={template}
                            scopeLabel={scopeLabel}
                            hasUnsavedChanges={hasUnsavedChanges}
                            variant="inline"
                        />
                        {showResetOverride ? (
                            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                                <Button
                                    variant="outline"
                                    disabled={isResettingOverride}
                                    onClick={() => setResetDialogOpen(true)}
                                >
                                    {isResettingOverride ? 'Resetting...' : 'Reset to global'}
                                </Button>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Reset this override?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This removes the current institution draft override and
                                            restores the global Sentinel fallback for reports.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                onResetOverride?.();
                                                setResetDialogOpen(false);
                                            }}
                                        >
                                            Confirm reset
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        ) : null}
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) =>
                            setActiveTab(value as 'header' | 'footer' | 'branding')
                        }
                    >
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="header">Header</TabsTrigger>
                            <TabsTrigger value="footer">Footer</TabsTrigger>
                            <TabsTrigger value="branding">Branding</TabsTrigger>
                        </TabsList>

                        <div ref={panelRef} tabIndex={-1} className="outline-none">
                            <TabsContent value="header" className="mt-4 outline-none">
                                <TemplateHeaderFooterFields
                                    headerConfig={headerConfig}
                                    footerConfig={footerConfig}
                                    onHeaderChange={onHeaderChange}
                                    onFooterChange={onFooterChange}
                                    isAnalyticsTemplate
                                    section="header"
                                    showSectionChrome={false}
                                />
                            </TabsContent>

                            <TabsContent value="footer" className="mt-4 outline-none">
                                <TemplateHeaderFooterFields
                                    headerConfig={headerConfig}
                                    footerConfig={footerConfig}
                                    onHeaderChange={onHeaderChange}
                                    onFooterChange={onFooterChange}
                                    isAnalyticsTemplate
                                    section="footer"
                                    showSectionChrome={false}
                                />
                            </TabsContent>

                            <TabsContent value="branding" className="mt-4 outline-none">
                                <BrandingUploadCard
                                    branding={branding}
                                    disabled={brandingDisabled}
                                    onUpload={onUploadBranding}
                                    onRemove={onRemoveBranding}
                                    isUploading={isUploadingBranding}
                                    isRemoving={isRemovingBranding}
                                    variant="panel"
                                    globalMessage={brandingGlobalMessage}
                                />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>

                <div className="xl:sticky xl:top-6 xl:self-start">
                    <TemplatePreviewCard
                        previewBlob={previewBlob}
                        isGenerating={isGeneratingPreview}
                        onGeneratePreview={onGeneratePreview}
                        variant="panel"
                    />
                </div>
            </div>
        </div>
    );
}
