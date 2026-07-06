'use client';

import React, { useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { FontSize, TextStyle } from '@tiptap/extension-text-style';
import {
    AlignCenter, AlignLeft, AlignRight, Bold, Eraser, Highlighter, Italic,
    Link2, List, ListOrdered, Image as ImageIcon, Minus, Quote, Redo,
    Strikethrough, Underline as UnderlineIcon, Undo, Loader2
} from 'lucide-react';

interface MenuBarProps {
    editor: Editor | null;
    onImageUpload?: (file: File) => Promise<string>;
    selectedFontSize: string;
    onFontSizeChange: (fontSize: string, selectionFrom?: number) => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor, onImageUpload, selectedFontSize, onFontSizeChange }) => {
    const [isUploading, setIsUploading] = useState(false);

    if (!editor) {
        return null;
    }

    const iconButtonClass = (active = false) =>
        `shrink-0 rounded-sm border p-1.5 transition-colors ${
            active
                ? 'border-[#e60000] bg-[#e60000] text-white'
                : 'border-transparent text-stone-600 hover:border-stone-200 hover:bg-white hover:text-[#e60000]'
        }`;

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

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('링크 주소를 입력하세요', previousUrl || 'https://');

        if (url === null) return;

        if (url.trim() === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
    };

    const applyFontSize = (fontSize: string) => {
        onFontSizeChange(fontSize, editor.state.selection.from);

        window.requestAnimationFrame(() => {
            const chain = editor.chain().focus();
            if (fontSize === '16px') {
                chain.unsetFontSize().run();
            } else {
                chain.setFontSize(fontSize).run();
            }
        });
    };

    return (
        <div className="flex items-center gap-1 overflow-x-auto border-b border-stone-200 bg-stone-50 p-2">
            <select
                value={selectedFontSize}
                onChange={(event) => {
                    applyFontSize(event.target.value);
                }}
                onInput={(event) => {
                    applyFontSize(event.currentTarget.value);
                }}
                className="h-8 shrink-0 rounded-sm border border-stone-200 bg-white px-2 text-xs font-bold text-[#25282b] outline-none transition-colors focus:border-[#e60000]"
                title="글자 크기"
                aria-label="글자 크기"
            >
                <option value="14px">작게</option>
                <option value="16px">보통</option>
                <option value="20px">크게</option>
                <option value="24px">강조</option>
            </select>

            <div className="mx-1 h-4 w-px shrink-0 bg-stone-300"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={iconButtonClass(editor.isActive('bold'))}
                title="굵게"
            >
                <Bold className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={iconButtonClass(editor.isActive('italic'))}
                title="기울임"
            >
                <Italic className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={iconButtonClass(editor.isActive('underline'))}
                title="밑줄"
            >
                <UnderlineIcon className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={iconButtonClass(editor.isActive('strike'))}
                title="취소선"
            >
                <Strikethrough className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={iconButtonClass(editor.isActive('highlight'))}
                title="강조 표시"
            >
                <Highlighter className="w-4 h-4" />
            </button>

            <div className="mx-1 h-4 w-px shrink-0 bg-stone-300"></div>

            <select
                value={
                    editor.isActive('heading', { level: 1 })
                        ? 'h1'
                        : editor.isActive('heading', { level: 2 })
                          ? 'h2'
                          : 'p'
                }
                onChange={(event) => {
                    const value = event.target.value;
                    if (value === 'h1') {
                        editor.chain().focus().toggleHeading({ level: 1 }).run();
                    } else if (value === 'h2') {
                        editor.chain().focus().toggleHeading({ level: 2 }).run();
                    } else {
                        editor.chain().focus().setParagraph().run();
                    }
                }}
                className="h-8 shrink-0 rounded-sm border border-stone-200 bg-white px-2 text-xs font-bold text-[#25282b] outline-none transition-colors focus:border-[#e60000]"
                title="문단 스타일"
                aria-label="문단 스타일"
            >
                <option value="p">본문</option>
                <option value="h1">제목 1</option>
                <option value="h2">제목 2</option>
            </select>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={iconButtonClass(editor.isActive('blockquote'))}
                title="인용"
            >
                <Quote className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className={iconButtonClass()}
                title="구분선"
            >
                <Minus className="w-4 h-4" />
            </button>

            <div className="mx-1 h-4 w-px shrink-0 bg-stone-300"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={iconButtonClass(editor.isActive('bulletList'))}
                title="글머리 기호"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={iconButtonClass(editor.isActive('orderedList'))}
                title="번호 매기기"
            >
                <ListOrdered className="w-4 h-4" />
            </button>

            <div className="mx-1 h-4 w-px shrink-0 bg-stone-300"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={iconButtonClass(editor.isActive({ textAlign: 'left' }))}
                title="왼쪽 정렬"
            >
                <AlignLeft className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={iconButtonClass(editor.isActive({ textAlign: 'center' }))}
                title="가운데 정렬"
            >
                <AlignCenter className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={iconButtonClass(editor.isActive({ textAlign: 'right' }))}
                title="오른쪽 정렬"
            >
                <AlignRight className="w-4 h-4" />
            </button>

            <div className="mx-1 h-4 w-px shrink-0 bg-stone-300"></div>

            <button
                type="button"
                onClick={setLink}
                className={iconButtonClass(editor.isActive('link'))}
                title="링크"
            >
                <Link2 className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={addImage}
                disabled={isUploading}
                className="shrink-0 rounded-sm border border-transparent p-1.5 text-stone-600 transition-colors hover:border-stone-200 hover:bg-white hover:text-[#e60000] disabled:opacity-50"
                title="이미지 추가"
            >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                className={iconButtonClass()}
                title="서식 지우기"
            >
                <Eraser className="w-4 h-4" />
            </button>

            <div className="min-w-2 shrink-0"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="shrink-0 rounded-sm border border-transparent p-1.5 text-stone-600 transition-colors hover:border-stone-200 hover:bg-white disabled:opacity-30"
                title="되돌리기"
            >
                <Undo className="w-4 h-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="shrink-0 rounded-sm border border-transparent p-1.5 text-stone-600 transition-colors hover:border-stone-200 hover:bg-white disabled:opacity-30"
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
    const selectedFontSizeRef = useRef('16px');
    const fontSizeStartRef = useRef<number | null>(null);
    const isApplyingFontSizeRef = useRef(false);
    const [selectedFontSize, setSelectedFontSize] = useState('16px');

    const handleFontSizeChange = (fontSize: string, selectionFrom?: number) => {
        selectedFontSizeRef.current = fontSize;
        fontSizeStartRef.current = fontSize === '16px' ? null : selectionFrom ?? null;
        setSelectedFontSize(fontSize);
    };

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            FontSize,
            Underline,
            Highlight.configure({
                multicolor: false,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                defaultProtocol: 'https',
                HTMLAttributes: {
                    class: 'text-[#3860be] underline underline-offset-2',
                    rel: 'noopener noreferrer nofollow',
                    target: '_blank',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: placeholder || '내용을 입력하세요',
            }),
            Image.configure({
                inline: true,
                allowBase64: false, // Base64 저장을 비활성화하여 URL 사용 강제
            }),
        ],
        content: content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            const fontSize = selectedFontSizeRef.current;
            const start = fontSizeStartRef.current;

            if (!isApplyingFontSizeRef.current && fontSize !== '16px' && start !== null) {
                const textStyle = editor.state.schema.marks.textStyle;
                const to = editor.state.selection.from;
                const from = Math.max(1, Math.min(start, to));

                if (textStyle && to > from) {
                    isApplyingFontSizeRef.current = true;
                    editor.view.dispatch(
                        editor.state.tr
                            .addMark(from, to, textStyle.create({ fontSize }))
                            .setMeta('addToHistory', false)
                    );
                    isApplyingFontSizeRef.current = false;
                }
            }

            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose list-disc prose-stone max-w-none min-h-[300px] p-4 focus:outline-none',
            },
            handleTextInput(view, from, to, text) {
                const fontSize = selectedFontSizeRef.current;

                if (fontSize === '16px') {
                    return false;
                }

                const textStyle = view.state.schema.marks.textStyle;

                if (!textStyle) {
                    return false;
                }

                const existingMarks = view.state.storedMarks || view.state.selection.$from.marks();
                const existingTextStyle = existingMarks.find((mark) => mark.type === textStyle);
                const marks = [
                    ...existingMarks.filter((mark) => mark.type !== textStyle),
                    textStyle.create({
                        ...(existingTextStyle?.attrs || {}),
                        fontSize,
                    }),
                ];
                const transaction = view.state.tr.insertText(text, from, to);

                marks.forEach((mark) => {
                    transaction.addMark(from, from + text.length, mark);
                });

                view.dispatch(transaction);
                return true;
            },
        },
    });

    return (
        <div className="flex max-h-[600px] flex-col overflow-hidden rounded-sm border border-stone-200 bg-white focus-within:border-[#e60000]">
            <MenuBar
                editor={editor}
                onImageUpload={onImageUpload}
                selectedFontSize={selectedFontSize}
                onFontSizeChange={handleFontSizeChange}
            />
            <div className="overflow-y-auto flex-1 cursor-text" onClick={() => editor?.chain().focus().run()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
