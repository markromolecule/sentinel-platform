'use client';

import {
    cn,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    Switch,
    Textarea,
} from '@sentinel/ui';
import type { FooterConfig, HeaderConfig } from '@/data';

type TemplateSettingsSection = 'header' | 'footer' | 'both';

type TemplateHeaderFooterFieldsProps = {
    headerConfig: HeaderConfig;
    footerConfig: FooterConfig;
    onHeaderChange: (next: HeaderConfig) => void;
    onFooterChange: (next: FooterConfig) => void;
    isAnalyticsTemplate?: boolean;
    section?: TemplateSettingsSection;
    showSectionChrome?: boolean;
};

function SettingToggleRow({
    title,
    description,
    checked,
    disabled,
    onCheckedChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="space-y-1">
                <p className="text-sm font-medium">{title}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
            </div>
            <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
        </div>
    );
}

function HeaderFields({
    headerConfig,
    onHeaderChange,
    isAnalyticsTemplate,
    showSectionChrome,
}: {
    headerConfig: HeaderConfig;
    onHeaderChange: (next: HeaderConfig) => void;
    isAnalyticsTemplate: boolean;
    showSectionChrome: boolean;
}) {
    return (
        <section className={cn('space-y-5', showSectionChrome && 'rounded-xl border p-4')}>
            <div>
                <h3 className="text-base font-semibold">Header</h3>
                <p className="text-muted-foreground text-sm">
                    Control logo placement, title copy, and divider styling.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="header-title-text">Title</Label>
                    <Input
                        id="header-title-text"
                        value={headerConfig.title_text}
                        onChange={(event) =>
                            onHeaderChange({
                                ...headerConfig,
                                title_text: event.target.value,
                            })
                        }
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="header-subtitle-text">Subtitle</Label>
                    <Input
                        id="header-subtitle-text"
                        value={headerConfig.subtitle_text ?? ''}
                        onChange={(event) =>
                            onHeaderChange({
                                ...headerConfig,
                                subtitle_text: event.target.value || null,
                            })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label>Logo placement</Label>
                    <Select
                        value={headerConfig.logo_placement}
                        onValueChange={(value) =>
                            onHeaderChange({
                                ...headerConfig,
                                logo_placement: value as HeaderConfig['logo_placement'],
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LEFT">Left</SelectItem>
                            <SelectItem value="CENTER">Center</SelectItem>
                            <SelectItem value="RIGHT">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Title alignment</Label>
                    <Select
                        value={headerConfig.title_alignment}
                        onValueChange={(value) =>
                            onHeaderChange({
                                ...headerConfig,
                                title_alignment: value as HeaderConfig['title_alignment'],
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LEFT">Left</SelectItem>
                            <SelectItem value="CENTER">Center</SelectItem>
                            <SelectItem value="RIGHT">Right</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="header-logo-size">Logo max size (px)</Label>
                    <Input
                        id="header-logo-size"
                        type="number"
                        min={10}
                        max={500}
                        value={headerConfig.logo_max_size_px}
                        onChange={(event) =>
                            onHeaderChange({
                                ...headerConfig,
                                logo_max_size_px: Number(event.target.value || 120),
                            })
                        }
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="header-accent-color">Accent color</Label>
                    <Input
                        id="header-accent-color"
                        type="color"
                        value={headerConfig.accent_color}
                        onChange={(event) =>
                            onHeaderChange({
                                ...headerConfig,
                                accent_color: event.target.value,
                            })
                        }
                    />
                </div>
            </div>

            <div className="rounded-xl border px-4">
                <SettingToggleRow
                    title="Show institution logo"
                    description="Uses the uploaded institution branding logo when available."
                    checked={headerConfig.logo_visible}
                    onCheckedChange={(checked) =>
                        onHeaderChange({
                            ...headerConfig,
                            logo_visible: checked,
                        })
                    }
                />
                <Separator />
                <SettingToggleRow
                    title="Show divider"
                    description="Adds a rule beneath the header block."
                    checked={headerConfig.divider_visible}
                    onCheckedChange={(checked) =>
                        onHeaderChange({
                            ...headerConfig,
                            divider_visible: checked,
                        })
                    }
                />
                <Separator />
                <SettingToggleRow
                    title="Sentinel logo"
                    description={
                        isAnalyticsTemplate
                            ? 'Required for overall analytics reports.'
                            : 'Optional for answer key templates.'
                    }
                    checked={headerConfig.sentinel_logo_visible}
                    disabled={isAnalyticsTemplate}
                    onCheckedChange={(checked) =>
                        onHeaderChange({
                            ...headerConfig,
                            sentinel_logo_visible: checked,
                        })
                    }
                />
            </div>
        </section>
    );
}

function FooterFields({
    footerConfig,
    onFooterChange,
    showSectionChrome,
}: {
    footerConfig: FooterConfig;
    onFooterChange: (next: FooterConfig) => void;
    showSectionChrome: boolean;
}) {
    return (
        <section className={cn('space-y-5', showSectionChrome && 'rounded-xl border p-4')}>
            <div>
                <h3 className="text-base font-semibold">Footer</h3>
                <p className="text-muted-foreground text-sm">
                    Add footer notes, confidentiality labels, and page numbering.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="footer-text">Footer text</Label>
                <Textarea
                    id="footer-text"
                    value={footerConfig.text}
                    onChange={(event) =>
                        onFooterChange({
                            ...footerConfig,
                            text: event.target.value,
                        })
                    }
                    rows={3}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="footer-confidentiality">Confidentiality label</Label>
                <Input
                    id="footer-confidentiality"
                    value={footerConfig.confidentiality_label ?? ''}
                    onChange={(event) =>
                        onFooterChange({
                            ...footerConfig,
                            confidentiality_label: event.target.value || null,
                        })
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Page number format</Label>
                    <Select
                        value={footerConfig.page_number_format}
                        onValueChange={(value) =>
                            onFooterChange({
                                ...footerConfig,
                                page_number_format: value as FooterConfig['page_number_format'],
                            })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PAGE_X_OF_Y">Page X of Y</SelectItem>
                            <SelectItem value="SIMPLE_X">Simple X</SelectItem>
                            <SelectItem value="BRACKET_X">[X]</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="footer-divider-color">Divider color</Label>
                    <Input
                        id="footer-divider-color"
                        type="color"
                        value={footerConfig.divider_color}
                        onChange={(event) =>
                            onFooterChange({
                                ...footerConfig,
                                divider_color: event.target.value,
                            })
                        }
                    />
                </div>
            </div>

            <div className="rounded-xl border px-4">
                <SettingToggleRow
                    title="Show divider"
                    description="Adds a rule above the footer content."
                    checked={footerConfig.divider_visible}
                    onCheckedChange={(checked) =>
                        onFooterChange({
                            ...footerConfig,
                            divider_visible: checked,
                        })
                    }
                />
                <Separator />
                <SettingToggleRow
                    title="Show page numbers"
                    description="Repeats page numbering across the exported PDF."
                    checked={footerConfig.page_number_visible}
                    onCheckedChange={(checked) =>
                        onFooterChange({
                            ...footerConfig,
                            page_number_visible: checked,
                        })
                    }
                />
            </div>
        </section>
    );
}

export function TemplateHeaderFooterFields({
    headerConfig,
    footerConfig,
    onHeaderChange,
    onFooterChange,
    isAnalyticsTemplate = false,
    section = 'both',
    showSectionChrome = true,
}: TemplateHeaderFooterFieldsProps) {
    if (section === 'header') {
        return (
            <HeaderFields
                headerConfig={headerConfig}
                onHeaderChange={onHeaderChange}
                isAnalyticsTemplate={isAnalyticsTemplate}
                showSectionChrome={showSectionChrome}
            />
        );
    }

    if (section === 'footer') {
        return (
            <FooterFields
                footerConfig={footerConfig}
                onFooterChange={onFooterChange}
                showSectionChrome={showSectionChrome}
            />
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-2">
            <HeaderFields
                headerConfig={headerConfig}
                onHeaderChange={onHeaderChange}
                isAnalyticsTemplate={isAnalyticsTemplate}
                showSectionChrome={showSectionChrome}
            />
            <FooterFields
                footerConfig={footerConfig}
                onFooterChange={onFooterChange}
                showSectionChrome={showSectionChrome}
            />
        </div>
    );
}
