'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Dynamic import with custom blot registration (SSR disabled)
const ReactQuill = dynamic(
  async () => {
    const mod = await import('react-quill-new');
    const Quill = mod.Quill;

    if (Quill) {
      // Register DividerBlot for <hr> support
      const BlockEmbed = Quill.import('blots/block/embed') as any;
      class DividerBlot extends BlockEmbed {
        static blotName = 'divider';
        static tagName = 'hr';
      }
      Quill.register(DividerBlot, true);
    }

    return mod;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] bg-[#0a2818]/50 border border-[#1a4d32] rounded-xl animate-pulse" />
    ),
  }
);

// Emoji categories
const EMOJI_LIST = [
  '😊', '😂', '😍', '😎', '🤔', '😢', '😡', '🤣', '😅', '🥳',
  '👍', '👎', '👏', '🙏', '💪', '🤝', '✌️', '👋', '🫡', '🤙',
  '❤️', '🔥', '⭐', '🎉', '✅', '❌', '⚠️', '💡', '📌', '🏆',
  '🚔', '🚨', '🛡️', '⚖️', '📋', '📝', '🔑', '🎯', '💰', '🔒',
  '➡️', '⬅️', '⬆️', '⬇️', '🔄', '➕', '➖', '❓', '❗', '💬',
];

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

/**
 * QuillEditor - Shared rich text editor (Sheriff Theme)
 *
 * Features:
 * - Bold, Italic, Underline, Strikethrough
 * - Superscript, Subscript
 * - Blockquote, Code Block
 * - Ordered/Bullet Lists
 * - Text Alignment (left, center, right, justify)
 * - Font Family
 * - Links
 * - Horizontal Rule (custom blot)
 * - Emoji Picker (custom popup)
 * - Undo (history)
 * - Remove Formatting
 */
export default function QuillEditor({
  value,
  onChange,
  placeholder = 'Wpisz treść...',
  className = '',
  minHeight = '200px',
}: QuillEditorProps) {
  const quillInstanceRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Ref-based toggle for emoji (accessible from toolbar handler)
  const emojiToggleRef = useRef<() => void>(() => {});
  emojiToggleRef.current = () => setShowEmojiPicker((prev) => !prev);

  // Stable toolbar modules (prevent Quill re-initialization)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ font: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ script: 'super' }, { script: 'sub' }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link'],
          ['divider', 'emoji', 'undo'],
          ['clean'],
        ],
        handlers: {
          divider: function (this: any) {
            const quill = this.quill;
            quillInstanceRef.current = quill;
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'divider', true, 'user');
            quill.setSelection(range.index + 2, 0, 'silent');
          },
          undo: function (this: any) {
            quillInstanceRef.current = this.quill;
            this.quill.history.undo();
          },
          emoji: function (this: any) {
            quillInstanceRef.current = this.quill;
            emojiToggleRef.current();
          },
        },
      },
      history: { delay: 1000, maxStack: 50, userOnly: true },
    }),
    []
  );

  // Insert emoji at cursor position
  const insertEmoji = (emoji: string) => {
    const quill = quillInstanceRef.current;
    if (!quill) return;
    const range = quill.getSelection(true);
    quill.insertText(range.index, emoji, 'user');
    quill.setSelection(range.index + emoji.length, 0, 'silent');
    setShowEmojiPicker(false);
  };

  // Add tooltips to toolbar buttons after mount
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const timeout = setTimeout(() => {
      const toolbar = wrapper.querySelector('.ql-toolbar');
      if (!toolbar) return;

      const tooltips: Record<string, string> = {
        '.ql-bold': 'Pogrubienie',
        '.ql-italic': 'Kursywa',
        '.ql-underline': 'Podkreślenie',
        '.ql-strike': 'Przekreślenie',
        '.ql-blockquote': 'Cytat',
        '.ql-code-block': 'Blok kodu',
        '.ql-link': 'Wstaw link',
        '.ql-clean': 'Usuń formatowanie',
        '.ql-divider': 'Linia pozioma',
        '.ql-emoji': 'Emoji',
        '.ql-undo': 'Cofnij',
        'button.ql-list[value="ordered"]': 'Lista numerowana',
        'button.ql-list[value="bullet"]': 'Lista punktowana',
        'button.ql-script[value="super"]': 'Indeks górny',
        'button.ql-script[value="sub"]': 'Indeks dolny',
        '.ql-align .ql-picker-label': 'Wyrównanie tekstu',
        '.ql-font .ql-picker-label': 'Czcionka',
      };

      for (const [selector, title] of Object.entries(tooltips)) {
        const el = toolbar.querySelector(selector);
        if (el) (el as HTMLElement).title = title;
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.quill-emoji-picker') && !target.closest('.ql-emoji')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  return (
    <div
      ref={wrapperRef}
      className={`quill-editor-wrapper relative ${className}`}
      style={{ '--quill-min-height': minHeight } as React.CSSProperties}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="quill-emoji-picker absolute z-50 top-[42px] right-0 bg-[#051a0f] border border-[#1a4d32] rounded-xl shadow-2xl p-3 w-[280px] animate-fadeIn">
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-7 h-7 flex items-center justify-center text-base hover:bg-[#c9a227]/20 rounded transition-colors cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
