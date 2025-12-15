import { useState, useEffect, useRef, memo, useCallback } from 'react';
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
  const isScrollingRef = useRef(false);
  const lastMousePositionRef = useRef({ x: 0, y: 0 });
  const hoverIntentTimeoutRef = useRef(null);

  // Clear hover state on scroll with debouncing
  useEffect(() => {
    const handleScroll = () => {
      isScrollingRef.current = true;
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Clear any pending hover intent
      if (hoverIntentTimeoutRef.current) {
        clearTimeout(hoverIntentTimeoutRef.current);
        hoverIntentTimeoutRef.current = null;
      }
      
      // Immediately hide if hovering
      if (isHovered) {
        setIsHovered(false);
      }
      
      // Reset scrolling flag after scroll ends (longer delay to ensure scroll truly stopped)
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 200);
    };

    // Listen to both window scroll and any potential scroll container
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    
    // Also check for a scroll container
    const scrollContainer = paragraphRef.current?.closest('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (hoverIntentTimeoutRef.current) {
        clearTimeout(hoverIntentTimeoutRef.current);
      }
    };
  }, [isHovered]);

  // Also detect wheel events to catch scrolling before scroll event fires
  useEffect(() => {
    const handleWheel = () => {
      isScrollingRef.current = true;
      
      if (hoverIntentTimeoutRef.current) {
        clearTimeout(hoverIntentTimeoutRef.current);
        hoverIntentTimeoutRef.current = null;
      }
      
      if (isHovered) {
        setIsHovered(false);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isHovered]);

  // Handle mouse enter with hover intent - only show if mouse stays still
  const handleMouseEnter = useCallback((e) => {
    if (isScrollingRef.current) return;
    
    lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    
    // Clear any existing hover intent timeout
    if (hoverIntentTimeoutRef.current) {
      clearTimeout(hoverIntentTimeoutRef.current);
    }
    
    // Delay showing the icon to ensure intentional hover
    hoverIntentTimeoutRef.current = setTimeout(() => {
      if (!isScrollingRef.current) {
        setIsHovered(true);
      }
    }, 80);
  }, []);

  // Handle mouse move - check if mouse actually moved (not just scroll passing by)
  const handleMouseMove = useCallback((e) => {
    if (isScrollingRef.current) {
      setIsHovered(false);
      return;
    }
    
    const dx = Math.abs(e.clientX - lastMousePositionRef.current.x);
    const dy = Math.abs(e.clientY - lastMousePositionRef.current.y);
    
    // Only trigger hover if mouse actually moved (user intentionally moved mouse)
    if (dx > 3 || dy > 3) {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
      
      if (!isHovered && !hoverIntentTimeoutRef.current) {
        hoverIntentTimeoutRef.current = setTimeout(() => {
          if (!isScrollingRef.current) {
            setIsHovered(true);
          }
          hoverIntentTimeoutRef.current = null;
        }, 50);
      }
    }
  }, [isHovered]);

  const handleMouseLeave = useCallback(() => {
    if (hoverIntentTimeoutRef.current) {
      clearTimeout(hoverIntentTimeoutRef.current);
      hoverIntentTimeoutRef.current = null;
    }
    setIsHovered(false);
  }, []);

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
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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

      {/* Circular Comment Button - Positioned on Left Side */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${(isHovered || hasComments) ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommentClick(paragraph);
          }}
          className="relative group/button flex h-9 w-9 items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] focus:ring-offset-2 focus:ring-offset-[#2C2C2C]"
          style={{
            backgroundColor: 'rgba(74, 74, 74, 0.5)',
            opacity: isHovered ? 1 : 0.7
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#888888';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(74, 74, 74, 0.5)';
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
              className="absolute -top-1 -right-1 noto-sans-arabic-bold bg-slate-700 text-white rounded-full flex items-center justify-center shadow-lg"
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
