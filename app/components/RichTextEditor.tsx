'use client';

import React, { useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
    Bold, Italic, Strikethrough, Heading1, Heading2,
    List, ListOrdered, Image as ImageIcon, Undo, Redo, Loader2
} from 'lucide-react';

interface MenuBarProps {
    editor: Editor | null;
    onImageUpload?: (file: File) => Promise<string>;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageUpload }) => {
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const addImage = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (event: Event) => {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                if (onImageUpload) {
                    setIsUploading(true);
                    try {
                        const url = await onImageUpload(file);
                        editor.chain().focus().setImage({ src: url }).run();
                    } catch (error) {
                        console.error('Image upload failed:', error);
                        alert('이미지 업로드에 실패했습니다.');
                    } finally {
                        setIsUploading(false);
                    }
                } else {
                    // Fallback to Base64 if no upload handler provided (but we want to avoid this)
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        if (result) {
                            editor.chain().focus().setImage({ src: result }).run();
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }
        };
        input.click();
    };

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-stone-200 bg-stone-50 p-2">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('bold') ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="굵게"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('italic') ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="기울임"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('strike') ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="취소선"
            >
                <Strikethrough className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-stone-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="제목 1"
            >
                <Heading1 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="제목 2"
            >
                <Heading2 className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-stone-300 mx-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('bulletList') ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="글머리 기호"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`rounded-sm p-1.5 transition-colors hover:bg-stone-200 ${editor.isActive('orderedList') ? 'bg-[#25282b] text-white' : 'text-stone-600'}`}
                title="번호 매기기"
            >
                <ListOrdered className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-stone-300 mx-1"></div>

            <button
                type="button"
                onClick={addImage}
                disabled={isUploading}
                className="rounded-sm p-1.5 text-stone-600 transition-colors hover:bg-stone-200 hover:text-[#e60000] disabled:opacity-50"
                title="이미지 추가"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </button>

            <div className="flex-1"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="rounded-sm p-1.5 text-stone-600 transition-colors hover:bg-stone-200 disabled:opacity-30"
                title="되돌리기"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="rounded-sm p-1.5 text-stone-600 transition-colors hover:bg-stone-200 disabled:opacity-30"
                title="다시 실행"
            >
                <Redo className="w-4 h-4" />
            </button>
        </div>
    );
};

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    onImageUpload?: (file: File) => Promise<string>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder, onImageUpload }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: false, // Base64 저장을 비활성화하여 URL 사용 강제
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose list-disc prose-stone max-w-none p-4 min-h-[300px] focus:outline-none',
            },
        },
    });

    return (
        <div className="flex max-h-[600px] flex-col overflow-hidden rounded-sm border border-stone-200 bg-white focus-within:border-[#e60000]">
            <MenuBar editor={editor} onImageUpload={onImageUpload} />
            <div className="overflow-y-auto flex-1 cursor-text" onClick={() => editor?.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
