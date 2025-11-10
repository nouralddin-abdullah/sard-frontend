import { useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';

const ChapterParagraph = ({ 
  paragraph, 
  onCommentClick, 
  theme, 
  fontSize,
  textColor
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const themeStyles = {
    dark: {
      text: '#FFFFFF',
      buttonBg: 'rgba(0, 119, 255, 0.9)',
      buttonHover: '#0077FF'
    },
    light: {
      text: '#2C2C2C',
      buttonBg: 'rgba(0, 119, 255, 0.9)',
      buttonHover: '#0077FF'
    },
    sepia: {
      text: '#5C4B37',
      buttonBg: 'rgba(0, 119, 255, 0.9)',
      buttonHover: '#0077FF'
    }
  };

  const currentTheme = themeStyles[theme];
  const paragraphColor = textColor || currentTheme.text;
  const hasComments = paragraph.commentsCount > 0;

  return (
    <div
      className="relative py-3 px-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Paragraph Text - No hover effects, no background changes */}
      <p
        className="leading-[2] whitespace-pre-line px-4 md:px-6 tajawal-regular"
        style={{
          color: paragraphColor,
          fontSize: `${fontSize}px`
        }}
        dangerouslySetInnerHTML={{ __html: paragraph.content }}
      />

      {/* Simple Wattpad-style Comment Button - appears on hover or if has comments */}
      {(isHovered || hasComments) && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick(paragraph);
          }}
          className="absolute left-2 bottom-2 flex items-center justify-center transition-opacity"
          style={{
            width: '34px',
            height: '38px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            opacity: isHovered ? 1 : 0.7
          }}
          aria-label="تعليق على الفقرة"
        >
          <div className="relative">
            <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12H11V9H14V7H11V4H9V7H6V9H9V12ZM0 20V2C0 1.45 0.196 0.979333 0.588 0.588C0.98 0.196667 1.45067 0.000666667 2 0H18C18.55 0 19.021 0.196 19.413 0.588C19.805 0.98 20.0007 1.45067 20 2V14C20 14.55 19.8043 15.021 19.413 15.413C19.0217 15.805 18.5507 16.0007 18 16H4L0 20Z" fill="#797979"/>
            </svg>
            {hasComments && (
              <span 
                className="absolute -top-1 -right-1 noto-sans-arabic-bold"
                style={{ 
                  fontSize: '11px',
                  color: '#797979',
                  backgroundColor: theme === 'dark' ? '#2C2C2C' : theme === 'light' ? '#FFFFFF' : '#F4ECD8',
                  borderRadius: '50%',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {paragraph.commentsCount > 9 ? '9+' : paragraph.commentsCount}
              </span>
            )}
          </div>
        </button>
      )}
    </div>
  );
};

export default ChapterParagraph;
