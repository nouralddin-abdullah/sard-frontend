import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
  AlignCenter,
  Bold as BoldIcon,
  ImagePlus,
  Italic as ItalicIcon,
  Loader2,
  Minus,
  Quote,
  Strikethrough,
  Underline as UnderlineIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChapterImage, ParagraphKind, SceneBreak } from '../editor/chapter-extensions';

// The chapter editor, matching the app's (chapter format v1, backend #74): Enter starts a new paragraph (each paragraph
// is what readers comment on), Shift+Enter breaks the line inside one (a poem's lines, a list of messages). A paragraph
// can be centered or set off as a quote; a scene break and pictures (with an optional caption) are blocks of their own.

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const imageFilesOf = (dataTransfer) =>
  Array.from(dataTransfer?.files ?? []).filter((file) => file.type.startsWith('image/'));

const ToolbarButton = ({ active = false, disabled = false, onClick, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => e.preventDefault()}
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    aria-label={title}
    title={title}
    className={`flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? 'bg-[#4A9EFF] text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`}
  >
    {children}
  </button>
);

const ToolbarSeparator = () => <span className="mx-0.5 md:mx-1 h-6 w-px bg-gray-300 dark:bg-gray-600" aria-hidden="true" />;

const RichTextEditor = ({
  content,
  onChange,
  onContentLoaded,
  onUploadImage,
  placeholder = "اكتب الفصل كاملاً هنا...",
  maxLength = 100000,
  className = "",
  dir = "rtl",
  status = "Draft",
  onStatusChange,
  wordCount = 0,
  characterCount: externalCharCount
}) => {
  const [, forceToolbarUpdate] = React.useReducer((n) => n + 1, 0);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);

  const lastReportedContent = React.useRef(content);
  const onChangeRef = React.useRef(onChange);
  const onContentLoadedRef = React.useRef(onContentLoaded);
  const onUploadImageRef = React.useRef(onUploadImage);
  const editorRef = React.useRef(null);
  onChangeRef.current = onChange;
  onContentLoadedRef.current = onContentLoaded;
  onUploadImageRef.current = onUploadImage;

  // Uploads pictures one after another and inserts each where the cursor is, as the app does.
  const uploadAndInsert = React.useCallback(async (files) => {
    const editor = editorRef.current;
    const upload = onUploadImageRef.current;
    if (!editor || !files.length) return;
    if (!upload) {
      toast.error('احفظ الفصل أولًا ثم أضف الصور.');
      return;
    }
    setIsUploading(true);
    try {
      for (const file of files) {
        if (!IMAGE_TYPES.includes(file.type)) {
          toast.error('يجب أن تكون الصورة JPEG أو PNG أو WebP.');
          continue;
        }
        if (file.size > IMAGE_MAX_BYTES) {
          toast.error('يجب ألا يتجاوز حجم الصورة 5 ميغابايت.');
          continue;
        }
        try {
          const url = await upload(file);
          editor.chain().focus().insertChapterImage({ src: url }).run();
        } catch (error) {
          toast.error(error?.message || 'تعذّر رفع الصورة، حاول مرة أخرى.');
        }
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        link: false,
        underline: false,
        hardBreak: {
          keepMarks: true,
        },
      }),
      Underline,
      ParagraphKind,
      SceneBreak,
      ChapterImage,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'sard-chapter-editor max-w-none focus:outline-none tajawal-regular text-base leading-relaxed text-gray-800 dark:text-gray-100 min-h-[60vh]',
        dir: dir,
      },
      handlePaste: (_view, event) => {
        const files = imageFilesOf(event.clipboardData);
        if (!files.length) return false;
        event.preventDefault();
        uploadAndInsert(files);
        return true;
      },
      handleDrop: (_view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFilesOf(event.dataTransfer);
        if (!files.length) return false;
        event.preventDefault();
        uploadAndInsert(files);
        return true;
      },
    },
    onCreate: ({ editor }) => {
      editorRef.current = editor;
      // The editor writes the loaded chapter its own way (attribute order, <b> as <strong>...): that is the baseline,
      // not a change the author made.
      const html = editor.getHTML();
      lastReportedContent.current = html;
      onContentLoadedRef.current?.(html);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Every change is reported, also past the length limit: the page shows the count and refuses to save, instead of
      // silently dropping what the author typed or pasted.
      if (html !== lastReportedContent.current) {
        lastReportedContent.current = html;
        onChangeRef.current?.(html);
      }
    },
    onTransaction: () => forceToolbarUpdate(),
  });
  // The live editor (React's StrictMode creates one, destroys it and creates another: never keep the first).
  editorRef.current = editor;

  React.useEffect(() => {
    if (editor && content !== lastReportedContent.current && content !== editor.getHTML()) {
      // Content loaded from outside (the saved chapter, a reload after a conflict): not an edit.
      editor.commands.setContent(content || '', { emitUpdate: false });
      const html = editor.getHTML();
      lastReportedContent.current = html;
      onContentLoadedRef.current?.(html);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const characterCount = externalCharCount !== undefined
    ? externalCharCount
    : editor.getText({ blockSeparator: ' ' }).trim().length;
  const overLimit = characterCount > maxLength;
  const isKind = (kind) => editor.isActive('paragraph', { kind });
  const inParagraph = editor.isActive('paragraph');

  return (
    <div className={`relative ${className}`}>
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow-lg overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 p-2 md:p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-[#242526]">
          <div className="flex flex-wrap items-center gap-0.5 md:gap-1" role="toolbar" aria-label="تنسيق الفصل">
            <ToolbarButton title="عريض (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
              <BoldIcon size={18} />
            </ToolbarButton>
            <ToolbarButton title="مائل (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
              <ItalicIcon size={18} />
            </ToolbarButton>
            <ToolbarButton title="تسطير (Ctrl+U)" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
              <UnderlineIcon size={18} />
            </ToolbarButton>
            <ToolbarButton title="يتوسطه خط" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
              <Strikethrough size={18} />
            </ToolbarButton>

            <ToolbarSeparator />

            <ToolbarButton
              title="فقرة في الوسط (شعر، عنوان داخل الفصل، لافتة)"
              active={isKind('center')}
              disabled={!inParagraph}
              onClick={() => editor.chain().focus().toggleParagraphKind('center').run()}
            >
              <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
              title="اقتباس (رسالة، مذكرة، ذكرى، صوت من مكان آخر)"
              active={isKind('quote')}
              disabled={!inParagraph}
              onClick={() => editor.chain().focus().toggleParagraphKind('quote').run()}
            >
              <Quote size={18} />
            </ToolbarButton>

            <ToolbarSeparator />

            <ToolbarButton title="فاصل مشهد" onClick={() => editor.chain().focus().insertSceneBreak().run()}>
              <Minus size={18} />
            </ToolbarButton>
            <ToolbarButton
              title={onUploadImage ? 'إضافة صورة (JPEG أو PNG أو WebP، حتى 5 ميغابايت)' : 'احفظ الفصل أولًا لإضافة الصور'}
              disabled={isUploading || !onUploadImage}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
            </ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = '';
                uploadAndInsert(files);
              }}
            />
            {isUploading && (
              <span className="ms-2 text-xs text-gray-500 dark:text-gray-400 noto-sans-arabic-medium">جارٍ رفع الصورة...</span>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-4 md:p-6">
          <EditorContent editor={editor} />
        </div>

        {/* Footer with Status Toggle and Counters */}
        <div className="p-3 border-t border-gray-700" style={{ backgroundColor: '#2C2C2C' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold noto-sans-arabic-bold transition-colors ${
                status === "Draft" ? 'text-white' : 'text-gray-500'
              }`}>مسودة</span>
              <label className="relative inline-block w-10 h-5 cursor-pointer">
                <input
                  type="checkbox"
                  className="absolute w-0 h-0 opacity-0"
                  checked={status === "Published"}
                  onChange={(e) => onStatusChange && onStatusChange(e.target.checked ? "Published" : "Draft")}
                  aria-label="منشور"
                />
                <span className={`block w-full h-full rounded-full transition-colors duration-200 ${
                  status === "Published" ? 'bg-[#0077FF]' : 'bg-gray-600'
                }`}>
                  <span
                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200"
                    style={{
                      transform: status === "Published" ? 'translateX(-20px)' : 'translateX(0)'
                    }}
                  />
                </span>
              </label>
              <span className={`text-sm font-semibold noto-sans-arabic-bold transition-colors ${
                status === "Published" ? 'text-white' : 'text-gray-500'
              }`}>منشور</span>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white noto-sans-arabic-extrabold">{wordCount.toLocaleString('ar-EG-u-nu-latn')}</span>
                <span className="noto-sans-arabic-medium ms-1" style={{ color: '#B8B8B8' }}>كلمة</span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: '#5A5A5A' }}></div>
              <div>
                <span className={`font-semibold noto-sans-arabic-extrabold ${overLimit ? 'text-red-400' : 'text-white'}`}>
                  {characterCount.toLocaleString('ar-EG-u-nu-latn')}
                </span>
                <span className="noto-sans-arabic-medium ms-1" style={{ color: overLimit ? '#F87171' : '#B8B8B8' }}>
                  / {maxLength.toLocaleString('ar-EG-u-nu-latn')} حرف
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .sard-chapter-editor {
          min-height: 60vh;
          outline: none;
        }
        .sard-chapter-editor p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .sard-chapter-editor strong { font-weight: 700; }
        .sard-chapter-editor em { font-style: italic; }
        .sard-chapter-editor u { text-decoration: underline; }
        .sard-chapter-editor s { text-decoration: line-through; }
        .sard-chapter-editor p {
          margin: 0.75rem 0;
          min-height: 1.5em;
          line-height: 1.9;
        }
        .sard-chapter-editor > :first-child { margin-top: 0; }
        .sard-chapter-editor > :last-child { margin-bottom: 0; }
        .sard-chapter-editor p[data-kind="center"] { text-align: center; }
        .sard-chapter-editor p[data-kind="quote"] {
          border-inline-start: 4px solid #4A9EFF;
          background: rgba(74, 158, 255, 0.08);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
        }
        .sard-chapter-editor hr {
          border: none;
          margin: 1.5rem 0;
          text-align: center;
          height: auto;
          cursor: pointer;
        }
        .sard-chapter-editor hr::after {
          content: "* * *";
          letter-spacing: 0.6em;
          font-size: 1.15rem;
          opacity: 0.7;
        }
        .sard-chapter-editor hr.ProseMirror-selectednode {
          outline: 2px solid #4A9EFF;
          border-radius: 0.375rem;
        }
        .sard-chapter-editor .ProseMirror-gapcursor:after { border-top-color: currentColor; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
