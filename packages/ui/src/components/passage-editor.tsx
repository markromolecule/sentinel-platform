'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { ReactNode } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
    Bold,
    Code2,
    Italic,
    Link2,
    List,
    ListOrdered,
    Pilcrow,
    Quote,
    Strikethrough,
    UnderlineIcon,
    Upload,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '../lib/utils';

const lowlight = createLowlight(common);

const basePassageExtensions = [
    StarterKit.configure({
        codeBlock: false,
        heading: {
            levels: [2, 3, 4],
        },
    }),
    Underline,
    Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
            rel: 'noopener noreferrer nofollow',
        },
    }),
    Image.configure({
        allowBase64: false,
        inline: false,
        HTMLAttributes: {
            loading: 'lazy',
        },
    }),
    CodeBlockLowlight.configure({
        lowlight,
    }),
];

function ToolbarButton({
    active,
    label,
    onClick,
    children,
}: {
    active?: boolean;
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <Button
            type="button"
            variant={active ? 'default' : 'outline'}
            size="sm"
            onClick={onClick}
            aria-label={label}
            className="h-8 gap-1.5"
        >
            {children}
        </Button>
    );
}

/**
 * Builds the linked text payload used when the editor toolbar inserts a URL with no selection.
 */
export function buildLinkedTextNode(href: string) {
    return {
        type: 'text',
        text: href,
        marks: [{ type: 'link', attrs: { href } }],
    };
}

/**
 * Derives the passage image alt text from the uploaded file name.
 */
export function getPassageImageAltText(fileName: string) {
    return fileName.replace(/\.[^.]+$/, '').trim() || 'Passage image';
}

export interface PassageEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    onImageUpload?: (file: File) => Promise<string>;
}

/**
 * Renders the shared passage editor toolbar and content surface used by passage-authored questions.
 */
export function PassageEditor({
    value,
    onChange,
    placeholder = 'Write the passage here...',
    className,
    onImageUpload,
}: PassageEditorProps) {
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [imageUploadError, setImageUploadError] = useState<string | null>(null);
    const extensions = useMemo(
        () => [
            ...basePassageExtensions,
            Placeholder.configure({
                placeholder,
            }),
        ],
        [placeholder],
    );

    const editor = useEditor({
        extensions,
        content: value || '<p></p>',
        immediatelyRender: false,
        onUpdate: ({ editor: nextEditor }) => {
            onChange(nextEditor.getHTML());
        },
        editorProps: {
            attributes: {
                class:
                    'min-h-[220px] rounded-md border border-border/60 bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            },
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const current = editor.getHTML();
        if (value !== current) {
            editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
        }
    }, [editor, value]);

    const insertLink = () => {
        if (!editor || !linkUrl.trim()) {
            return;
        }

        const href = linkUrl.trim();

        if (editor.state.selection.empty) {
            editor
                .chain()
                .focus()
                .insertContent(buildLinkedTextNode(href))
                .run();
        } else {
            editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
        }

        setLinkUrl('');
    };

    const insertImage = (src: string, alt: string) => {
        if (!editor || !src.trim() || !alt.trim()) {
            return;
        }

        editor.chain().focus().setImage({ src: src.trim(), alt: alt.trim() }).run();
    };

    const triggerImageUpload = () => {
        setImageUploadError(null);
        imageInputRef.current?.click();
    };

    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!editor || !file || !onImageUpload) {
            return;
        }

        try {
            setIsUploadingImage(true);
            setImageUploadError(null);
            const uploadedUrl = await onImageUpload(file);
            const inferredAlt = getPassageImageAltText(file.name);
            insertImage(uploadedUrl, inferredAlt);
        } catch (error) {
            setImageUploadError(
                error instanceof Error ? error.message : 'Failed to upload image.',
            );
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (!editor) {
        return (
            <div className={cn('space-y-3', className)}>
                <div className="rounded-md border border-dashed border-border/60 px-4 py-6 text-sm text-muted-foreground">
                    Loading passage editor...
                </div>
            </div>
        );
    }

    return (
        <div className={cn('flex h-full flex-col gap-3', className)}>
            <div className="flex flex-wrap gap-2">
                <ToolbarButton
                    label="Paragraph"
                    active={editor.isActive('paragraph')}
                    onClick={() => editor.chain().focus().setParagraph().run()}
                >
                    <Pilcrow className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Heading 2"
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </ToolbarButton>
                <ToolbarButton
                    label="Heading 3"
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    H3
                </ToolbarButton>
                <ToolbarButton
                    label="Heading 4"
                    active={editor.isActive('heading', { level: 4 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                >
                    H4
                </ToolbarButton>
                <ToolbarButton
                    label="Bold"
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Italic"
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Underline"
                    active={editor.isActive('underline')}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Strike"
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Bullet list"
                    active={editor.isActive('bulletList')}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Ordered list"
                    active={editor.isActive('orderedList')}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Blockquote"
                    active={editor.isActive('blockquote')}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    <Quote className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                    label="Code block"
                    active={editor.isActive('codeBlock')}
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                >
                    <Code2 className="h-4 w-4" />
                </ToolbarButton>
            </div>

            <div className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div className="grid gap-2">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Link URL
                        </Label>
                        <Input
                            value={linkUrl}
                            onChange={(event) => setLinkUrl(event.target.value)}
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={insertLink}
                            disabled={!linkUrl.trim()}
                            className="w-full gap-2 sm:w-auto"
                        >
                            <Link2 className="h-4 w-4" />
                            Insert link
                        </Button>
                    </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <div className="flex items-end text-xs text-muted-foreground">
                        Upload a local image to Supabase storage and insert it into the passage.
                    </div>
                    <div className="flex items-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={triggerImageUpload}
                            disabled={!onImageUpload || isUploadingImage}
                            className="w-full gap-2 sm:w-auto"
                        >
                            <Upload className="h-4 w-4" />
                            {isUploadingImage ? 'Uploading...' : 'Upload image'}
                        </Button>
                    </div>
                </div>

                <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleImageUpload}
                />

                {imageUploadError ? (
                    <p className="text-xs text-destructive">{imageUploadError}</p>
                ) : null}
            </div>

            <div className="min-h-[220px] flex-1">
                <EditorContent editor={editor} />
            </div>
            <p className="text-xs text-muted-foreground">
                Uploaded images use the file name as alt text. Code blocks use the shared
                lowlight syntax-highlighting config.
            </p>
        </div>
    );
}
