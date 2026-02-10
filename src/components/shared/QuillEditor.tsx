'use client';

import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
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

      // Register custom Image blot with width support
      const BaseImage = Quill.import('formats/image') as any;
      class ResizableImage extends BaseImage {
        static create(value: string) {
          const node = super.create(value) as HTMLElement;
          if (typeof value === 'string') {
            node.setAttribute('src', value);
          }
          return node;
        }

        static formats(domNode: HTMLElement) {
          const formats: Record<string, string> = {};
          if (domNode.hasAttribute('width')) formats['width'] = domNode.getAttribute('width')!;
          if (domNode.hasAttribute('style')) formats['style'] = domNode.getAttribute('style')!;
          return formats;
        }

        format(name: string, value: string) {
          if (name === 'width' || name === 'style') {
            if (value) {
              this.domNode.setAttribute(name, value);
            } else {
              this.domNode.removeAttribute(name);
            }
          } else {
            super.format(name, value);
          }
        }
      }
      ResizableImage.blotName = 'image';
      ResizableImage.tagName = 'IMG';
      Quill.register(ResizableImage, true);
    }

    return mod;
  },
  {
    ssr: false,
    loading: () => (
      <div className="h-[200px] panel-inset animate-pulse" style={{ backgroundColor: 'var(--mdt-input-bg)' }} />
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

const IMAGE_SIZES = [
  { label: 'Mały', width: '200px' },
  { label: 'Średni', width: '400px' },
  { label: 'Duży', width: '600px' },
  { label: 'Pełna szerokość', width: '100%' },
];

const IMAGE_POSITIONS = [
  { label: 'Lewa', style: 'display:block;margin-right:auto;margin-left:0;' },
  { label: 'Środek', style: 'display:block;margin-left:auto;margin-right:auto;' },
  { label: 'Prawa', style: 'display:block;margin-left:auto;margin-right:0;' },
];

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

/**
 * QuillEditor - Shared rich text editor (MDT Terminal Theme)
 *
 * Features:
 * - Headers (H1/H2/H3), Bold, Italic, Underline, Strikethrough
 * - Text/Background Color, Font, Alignment
 * - Links, Images (with resize popup)
 * - Horizontal Rule, Emoji Picker, Undo
 * - Sticky toolbar
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
  const [imagePopup, setImagePopup] = useState<{ img: HTMLImageElement; top: number; left: number } | null>(null);

  // Ref-based toggle for emoji (accessible from toolbar handler)
  const emojiToggleRef = useRef<() => void>(() => {});
  emojiToggleRef.current = () => setShowEmojiPicker((prev) => !prev);

  // Stable toolbar modules (prevent Quill re-initialization)
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          [{ font: [] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ script: 'super' }, { script: 'sub' }],
          [{ color: [] }, { background: [] }],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['link', 'image', 'video'],
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

  // Image click handler - show resize popup
  const handleImageClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' && target.closest('.ql-editor')) {
      const img = target as HTMLImageElement;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const wrapperRect = wrapper.getBoundingClientRect();
      const imgRect = img.getBoundingClientRect();

      setImagePopup({
        img,
        top: imgRect.bottom - wrapperRect.top + 4,
        left: imgRect.left - wrapperRect.left,
      });
    }
  }, []);

  // Resize image (preserves existing position)
  const resizeImage = (width: string) => {
    if (!imagePopup) return;
    const img = imagePopup.img;
    const currentDisplay = img.style.display;
    const currentMarginL = img.style.marginLeft;
    const currentMarginR = img.style.marginRight;
    img.style.width = width;
    img.style.height = 'auto';
    // Preserve position if already set
    if (currentDisplay === 'block') {
      img.style.display = 'block';
      img.style.marginLeft = currentMarginL;
      img.style.marginRight = currentMarginR;
    }
    triggerQuillChange();
    setImagePopup(null);
  };

  // Position image (preserves existing size)
  const positionImage = (posStyle: string) => {
    if (!imagePopup) return;
    const img = imagePopup.img;
    const currentWidth = img.style.width;
    // Parse position style string
    const styles = posStyle.split(';').filter(Boolean);
    for (const s of styles) {
      const [prop, val] = s.split(':').map((x) => x.trim());
      if (prop && val) img.style.setProperty(prop, val);
    }
    // Preserve size if already set
    if (currentWidth) img.style.width = currentWidth;
    img.style.height = 'auto';
    triggerQuillChange();
    setImagePopup(null);
  };

  // Trigger Quill content change
  const triggerQuillChange = () => {
    const quill = quillInstanceRef.current;
    if (quill) {
      const html = quill.root.innerHTML;
      onChange(html);
    }
  };

  // Add tooltips to toolbar buttons after mount
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const timeout = setTimeout(() => {
      const toolbar = wrapper.querySelector('.ql-toolbar');
      if (!toolbar) return;

      const tooltips: Record<string, string> = {
        '.ql-header .ql-picker-label': 'Nagłówek',
        '.ql-font .ql-picker-label': 'Czcionka',
        '.ql-bold': 'Pogrubienie',
        '.ql-italic': 'Kursywa',
        '.ql-underline': 'Podkreślenie',
        '.ql-strike': 'Przekreślenie',
        'button.ql-script[value="super"]': 'Indeks górny',
        'button.ql-script[value="sub"]': 'Indeks dolny',
        '.ql-color .ql-picker-label': 'Kolor tekstu',
        '.ql-background .ql-picker-label': 'Kolor tła',
        '.ql-blockquote': 'Cytat',
        '.ql-code-block': 'Blok kodu',
        'button.ql-list[value="ordered"]': 'Lista numerowana',
        'button.ql-list[value="bullet"]': 'Lista punktowana',
        '.ql-align .ql-picker-label': 'Wyrównanie tekstu',
        '.ql-link': 'Wstaw link',
        '.ql-image': 'Wstaw obraz',
        '.ql-video': 'Wstaw wideo (YouTube/Vimeo)',
        '.ql-divider': 'Linia pozioma',
        '.ql-emoji': 'Emoji',
        '.ql-undo': 'Cofnij',
        '.ql-clean': 'Usuń formatowanie',
      };

      for (const [selector, title] of Object.entries(tooltips)) {
        const el = toolbar.querySelector(selector);
        if (el) (el as HTMLElement).title = title;
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  // Image click listener
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener('click', handleImageClick);
    return () => wrapper.removeEventListener('click', handleImageClick);
  }, [handleImageClick]);

  // Close popups on outside click
  useEffect(() => {
    if (!showEmojiPicker && !imagePopup) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (showEmojiPicker && !target.closest('.quill-emoji-picker') && !target.closest('.ql-emoji')) {
        setShowEmojiPicker(false);
      }

      if (imagePopup && !target.closest('.quill-image-popup') && target.tagName !== 'IMG') {
        setImagePopup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, imagePopup]);

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
        <div
          className="quill-emoji-picker absolute z-50 top-[46px] right-0 panel-raised p-3 w-[280px]"
          style={{
            backgroundColor: 'var(--mdt-btn-face)',
          }}
        >
          <div className="grid grid-cols-10 gap-1">
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-7 h-7 flex items-center justify-center text-base cursor-pointer hover:opacity-80 panel-inset"
                style={{ backgroundColor: 'var(--mdt-input-bg)' }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Resize Popup */}
      {imagePopup && (
        <div
          className="quill-image-popup absolute z-50 panel-raised p-2"
          style={{
            top: imagePopup.top,
            left: imagePopup.left,
            backgroundColor: 'var(--mdt-btn-face)',
          }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs px-1" style={{ color: 'var(--mdt-muted-text)' }}>Rozmiar:</span>
              {IMAGE_SIZES.map((size) => (
                <button
                  key={size.width}
                  type="button"
                  onClick={() => resizeImage(size.width)}
                  className="btn-win95 font-mono text-xs !py-1 !px-2"
                >
                  {size.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs px-1" style={{ color: 'var(--mdt-muted-text)' }}>Pozycja:</span>
              {IMAGE_POSITIONS.map((pos) => (
                <button
                  key={pos.label}
                  type="button"
                  onClick={() => positionImage(pos.style)}
                  className="btn-win95 font-mono text-xs !py-1 !px-2"
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
