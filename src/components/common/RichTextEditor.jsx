import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon } from 'lucide-react';

const RichTextEditor = ({ 
  content, 
  onChange, 
  placeholder = "اكتب الفصل كاملاً هنا...", 
  maxLength = 20000,
  className = "",
  dir = "rtl",
  status = "Draft",
  onStatusChange,
  wordCount = 0,
  characterCount: externalCharCount
}) => {
  const [activeFormats, setActiveFormats] = React.useState({
    bold: false,
    italic: false,
    underline: false,
  });
  
  const isInitialMount = React.useRef(true);
  const initialContentRef = React.useRef(content);
  const lastReportedContent = React.useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: 'min-h-[1em]',
          },
        },
        hardBreak: {
          keepMarks: true,
        },
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
      }),
      Bold,
      Italic,
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none tajawal-regular text-base leading-relaxed text-gray-800 dark:text-gray-100 min-h-[60vh]',
        dir: dir,
      },
      handleKeyDown: (view, event) => {
        // If Enter is pressed (not Shift+Enter)
        if (event.key === 'Enter' && !event.shiftKey) {
          // Insert a hard break (<br>) instead of creating a new paragraph
          const { state, dispatch } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Check if we're at the end of an empty paragraph
          if ($from.parent.textContent === '') {
            // If empty paragraph, create a new paragraph (double enter behavior)
            return false; // Let default behavior happen
          }
          
          // Otherwise, insert a hard break
          event.preventDefault();
          view.dispatch(state.tr.replaceSelectionWith(state.schema.nodes.hardBreak.create()).scrollIntoView());
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      
      // Only skip if this is truly the initial mount AND content hasn't actually changed
      // This ensures paste events are captured even on first interaction
      if (isInitialMount.current) {
        isInitialMount.current = false;
        // Check if content actually changed from initial - if so, still call onChange
        // This handles the case where user pastes content as their first action
        if (html === initialContentRef.current || html === lastReportedContent.current) {
          return;
        }
      }
      
      // Only call onChange if content actually changed
      if (text.length <= maxLength && html !== lastReportedContent.current) {
        lastReportedContent.current = html;
        onChange(html);
      }

      // Update active formats
      setActiveFormats({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
      });
    },
    onSelectionUpdate: ({ editor }) => {
      // Update active formats when selection changes
      setActiveFormats({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        underline: editor.isActive('underline'),
      });
    },
  });

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Reset initial mount flag when content changes externally
      isInitialMount.current = true;
      initialContentRef.current = content;
      lastReportedContent.current = content;
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const text = editor.getText({ blockSeparator: ' ' });
  const characterCount = externalCharCount !== undefined ? externalCharCount : text.trim().length;

  const handleFormatClick = (format) => {
    const formatLower = format.toLowerCase();
    editor.chain().focus()[`toggle${format}`]().run();
    
    // Immediately update the state
    setActiveFormats(prev => ({
      ...prev,
      [formatLower]: !prev[formatLower]
    }));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Editor Container */}
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow-lg overflow-hidden">
        {/* Toolbar - Same for both desktop and mobile */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Bold')}
              className={`p-2 rounded transition-colors ${
                activeFormats.bold
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Bold (Ctrl+B)"
            >
              <BoldIcon size={20} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Italic')}
              className={`p-2 rounded transition-colors ${
                activeFormats.italic
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Italic (Ctrl+I)"
            >
              <ItalicIcon size={20} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onTouchStart={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Underline')}
              className={`p-2 rounded transition-colors ${
                activeFormats.underline
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon size={20} />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="p-6">
          <EditorContent editor={editor} />
        </div>

        {/* Footer with Status Toggle and Counters */}
        <div className="p-3 border-t border-gray-700" style={{ backgroundColor: '#2C2C2C' }}>
          <div className="flex items-center justify-between text-white">
            {/* Draft/Published Toggle */}
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

            {/* Counters */}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white noto-sans-arabic-extrabold">{wordCount.toLocaleString()}</span>
                <span className="noto-sans-arabic-medium mr-1" style={{ color: '#B8B8B8' }}>كلمات</span>
              </div>
              <div className="h-4 w-px" style={{ backgroundColor: '#5A5A5A' }}></div>
              <div>
                <span className="font-semibold text-white noto-sans-arabic-extrabold">{characterCount.toLocaleString()}</span>
                <span className="noto-sans-arabic-medium mr-1" style={{ color: '#B8B8B8' }}>أحرف</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom styles */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 60vh;
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: right;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror u {
          text-decoration: underline;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
          min-height: 1.5em;
        }

        .ProseMirror p:first-child {
          margin-top: 0;
        }

        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
