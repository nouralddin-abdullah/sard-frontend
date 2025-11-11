import { useState, useEffect } from 'react';
import { X, Bold, Italic, Underline } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import { Extension } from '@tiptap/core';
import { Mark, mergeAttributes } from '@tiptap/core';

// TextStyle mark for font family
const TextStyle = Mark.create({
  name: 'textStyle',
  
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span',
        getAttrs: element => {
          const hasStyles = element.hasAttribute('style') || element.hasAttribute('class');
          if (!hasStyles) {
            return false;
          }
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addCommands() {
    return {
      removeEmptyTextStyle: () => ({ state, commands }) => {
        const attributes = this.editor.getAttributes('textStyle');
        const hasStyles = Object.entries(attributes).some(([, value]) => !!value);

        if (hasStyles) {
          return true;
        }

        return commands.unsetMark(this.name);
      },
    };
  },
});

// FontFamily extension
const FontFamily = Extension.create({
  name: 'fontFamily',
  
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.className || element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                class: attributes.fontFamily,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

const AddArticleModal = ({ isOpen, onClose, onSave, articleType = 'articles', initialArticle = null }) => {
  const [title, setTitle] = useState('');
  const [selectedFont, setSelectedFont] = useState('noto-sans-arabic-regular');
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
  });
  const isEditMode = !!initialArticle;

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapUnderline,
      TextStyle,
      FontFamily,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] max-h-[400px] overflow-y-auto p-4 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A] text-white focus:outline-none noto-sans-arabic-regular',
        dir: 'rtl',
      },
    },
    onUpdate: ({ editor }) => {
      // Update active formats when content changes
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

  const arabicFonts = [
    { value: 'noto-sans-arabic-regular', label: 'عادي' },
    { value: 'noto-sans-arabic-extrabold', label: 'كبير' }
  ];

  const articleTypeLabels = {
    articles: 'مقالات',
    story: 'قصة',
    backstory: 'خلفية',
    notes: 'ملاحظات'
  };

  const applyFont = (fontClass) => {
    if (editor) {
      editor.chain().focus().setFontFamily(fontClass).run();
      setSelectedFont(fontClass);
    }
  };

  const handleFormatClick = (format) => {
    if (!editor) return;
    
    const formatLower = format.toLowerCase();
    editor.chain().focus()[`toggle${format}`]().run();
    
    // Immediately update the state
    setActiveFormats(prev => ({
      ...prev,
      [formatLower]: !prev[formatLower]
    }));
  };

  const handleSave = () => {
    if (editor && editor.getText().trim()) {
      onSave({
        title: title.trim(),
        type: articleType,
        content: editor.getHTML(),
        font: selectedFont
      });
      setTitle('');
      editor.commands.setContent('');
      onClose();
    }
  };

  // Clear or populate editor when modal opens
  useEffect(() => {
    if (isOpen && editor) {
      if (initialArticle) {
        // Edit mode: populate with existing content
        setTitle(initialArticle.title || '');
        editor.commands.setContent(initialArticle.content);
        setSelectedFont(initialArticle.font || 'noto-sans-arabic-regular');
      } else {
        // Add mode: clear content
        setTitle('');
        editor.commands.setContent('');
        setSelectedFont('noto-sans-arabic-regular');
      }
    }
  }, [isOpen, editor, initialArticle]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[#2C2C2C] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide border border-[#5A5A5A]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
            {isEditMode ? `تعديل ${articleTypeLabels[articleType]}` : `إضافة ${articleTypeLabels[articleType]}`}
          </h3>
          <button
            onClick={onClose}
            className="text-[#797979] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="عنوان المقالة (اختياري)"
            className="w-full px-4 py-2 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A] text-white placeholder-[#797979] focus:outline-none focus:border-[#0077FF] noto-sans-arabic-bold text-lg"
            dir="rtl"
          />
        </div>

        {/* Font Selector */}
        <div className="mb-4">
          <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
            اختر الخط (حدد النص ثم اضغط على الخط المطلوب)
          </label>
          <div className="flex flex-wrap gap-2">
            {arabicFonts.map((font) => (
              <button
                key={font.value}
                onClick={() => applyFont(font.value)}
                className={`px-4 py-2 rounded-lg border transition-colors ${font.value} ${
                  selectedFont === font.value
                    ? 'bg-[#0077FF] border-[#0077FF] text-white'
                    : 'bg-[#3C3C3C] border-[#5A5A5A] text-[#B8B8B8] hover:border-[#0077FF]'
                }`}
                type="button"
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A]">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Bold')}
              className={`p-2 rounded transition-colors ${
                activeFormats.bold
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-[#B8B8B8] hover:bg-[#5A5A5A]'
              }`}
              title="عريض"
            >
              <Bold size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Italic')}
              className={`p-2 rounded transition-colors ${
                activeFormats.italic
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-[#B8B8B8] hover:bg-[#5A5A5A]'
              }`}
              title="مائل"
            >
              <Italic size={18} />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleFormatClick('Underline')}
              className={`p-2 rounded transition-colors ${
                activeFormats.underline
                  ? 'bg-[#4A9EFF] text-white'
                  : 'text-[#B8B8B8] hover:bg-[#5A5A5A]'
              }`}
              title="تحته خط"
            >
              <Underline size={18} />
            </button>
          </div>
        )}

        {/* Rich Text Editor */}
        <EditorContent editor={editor} />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#3C3C3C] hover:bg-[#5A5A5A] rounded-lg transition-colors noto-sans-arabic-medium"
            style={{ color: '#B8B8B8' }}
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 rounded-lg transition-colors noto-sans-arabic-bold text-white"
            style={{ backgroundColor: '#0077FF' }}
          >
            {isEditMode ? 'تحديث' : 'حفظ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddArticleModal;
