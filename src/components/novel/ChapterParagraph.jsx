import { useState, useEffect, useRef, memo } from 'react';
import { MessageSquarePlus } from 'lucide-react';

const ChapterParagraph = memo(({ 
  paragraph, 
  onCommentClick, 
  theme, 
  fontSize,
  textColor,
  fontFamily
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const paragraphRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Clear hover state on scroll with debouncing
  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Immediately hide if hovering
      if (isHovered) {
        setIsHovered(false);
      }
    };

    const scrollContainer = paragraphRef.current?.closest('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [isHovered]);

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
      ref={paragraphRef}
      className="group relative py-3 px-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Paragraph Text */}
      <p
        className="leading-[2] whitespace-pre-line px-4 md:px-6"
        style={{
          color: paragraphColor,
          fontSize: `${fontSize}px`,
          fontFamily: fontFamily,
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
        dangerouslySetInnerHTML={{ __html: paragraph.content }}
      />

      {/* Circular Comment Button - Positioned on Right Side */}
      <div className={`absolute -right-4 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${(isHovered || hasComments) ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick(paragraph);
          }}
          className="relative group/button flex h-9 w-9 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:ring-offset-2 focus:ring-offset-[#2C2C2C]"
          style={{
            backgroundColor: hasComments ? '#4A9EFF' : 'rgba(74, 74, 74, 0.5)'
          }}
          onMouseEnter={(e) => {
            if (!hasComments) {
              e.currentTarget.style.backgroundColor = '#888888';
            }
          }}
          onMouseLeave={(e) => {
            if (!hasComments) {
              e.currentTarget.style.backgroundColor = 'rgba(74, 74, 74, 0.5)';
            }
          }}
          aria-label="تعليق على الفقرة"
        >
          <MessageSquarePlus size={18} className="text-white" />
          
          {/* Tooltip */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover/button:opacity-100 transition-opacity pointer-events-none z-[100]">
            {hasComments ? `${paragraph.commentsCount} ${paragraph.commentsCount === 1 ? 'تعليق' : 'تعليقات'}` : 'أضف تعليق'}
          </div>
          
          {/* Comment Count Badge */}
          {hasComments && paragraph.commentsCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 noto-sans-arabic-bold bg-[#FF4444] text-white rounded-full flex items-center justify-center shadow-lg"
              style={{ 
                fontSize: '10px',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px'
              }}
            >
              {paragraph.commentsCount > 9 ? '9+' : paragraph.commentsCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
});

ChapterParagraph.displayName = 'ChapterParagraph';

export default ChapterParagraph;
