import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Menu, Settings, X, ChevronRight, ChevronLeft, BookOpen, MessageCircle, MessagesSquare, Facebook, Twitter, Link as LinkIcon, Copy, Check, Lock, Unlock } from 'lucide-react';
import { useGetLoggedInUser } from '../../hooks/user/useGetLoggedInUser';
import { useGetNovelChapters } from '../../hooks/novel/useGetNovelChapters';
import { useGetChapterById } from '../../hooks/novel/useGetChapterById';
import { useGetNovelBySlug } from '../../hooks/novel/useGetNovelBySlug';
import { useTrackReadingProgress } from '../../hooks/novel/useTrackReadingProgress';
import { useToggleFollow } from '../../hooks/user/useToggleFollow';
import { useGetNovelPrivilege } from '../../hooks/novel/useGetNovelPrivilege';
import CommentPanel from '../../components/novel/CommentPanel';
import ChapterParagraph from '../../components/novel/ChapterParagraph';
import PenIcon from '../../components/common/PenIcon';
import AuthRequiredModal from '../../components/common/AuthRequiredModal';
import UnlockPrivilegeModal from '../../components/novel/UnlockPrivilegeModal';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '../../constants/token-key';

const ChapterReaderPage = () => {
  const { novelSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { data: currentUser } = useGetLoggedInUser();
  const token = Cookies.get(TOKEN_KEY);
  
  // Fetch novel data
  const { data: novel, isLoading: novelLoading, error: novelError } = useGetNovelBySlug(novelSlug);
  
  // Fetch chapter data
  const { data: chapter, isLoading: chapterLoading, error: chapterError } = useGetChapterById(
    novel?.id,
    chapterId
  );
  
  // Track reading progress (only for authenticated users)
  const trackProgressMutation = useTrackReadingProgress();
  
  // Toggle follow mutation
  const toggleFollowMutation = useToggleFollow();
  
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContext, setCommentContext] = useState({ type: "chapter", targetId: null, preview: null });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // For TOC pagination
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu trigger
  const [copied, setCopied] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState('');
  const [isUnlockPrivilegeModalOpen, setIsUnlockPrivilegeModalOpen] = useState(false);
  
  // Track if TOC was ever opened (for lazy loading chapters)
  const [tocOpened, setTocOpened] = useState(false);
  
  // Fetch all chapters for TOC - only when TOC is opened (lazy loading)
  const { data: allChapters = [], isLoading: chaptersLoading } = useGetNovelChapters(
    novel?.id, 
    { enabled: tocOpened } // Only fetch when user opens TOC
  );
  
  // Helper to open TOC and trigger chapters fetch
  const openTOC = () => {
    setShowTOC(true);
    setTocOpened(true); // Once opened, chapters will be fetched and cached
  };
  
  // Reader settings with localStorage persistence
  const [theme, setTheme] = useState(() => localStorage.getItem('readerTheme') || 'dark');
  const [fontSize, setFontSize] = useState(() => parseInt(localStorage.getItem('readerFontSize')) || 18);
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('readerFontFamily') || 'noto');
  const [continueReading, setContinueReading] = useState(() => localStorage.getItem('readerContinueReading') === 'true');
  const [customColors, setCustomColors] = useState(() => localStorage.getItem('readerCustomColors') === 'true');
  const [customBgColor, setCustomBgColor] = useState(() => localStorage.getItem('readerCustomBgColor') || '#2C2C2C');
  const [customTextColor, setCustomTextColor] = useState(() => localStorage.getItem('readerCustomTextColor') || '#FFFFFF');
  const [focusMode, setFocusMode] = useState(() => localStorage.getItem('readerFocusMode') === 'true');
  
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('readerTheme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('readerFontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('readerFontFamily', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('readerContinueReading', continueReading.toString());
  }, [continueReading]);

  useEffect(() => {
    localStorage.setItem('readerCustomColors', customColors.toString());
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('readerCustomBgColor', customBgColor);
  }, [customBgColor]);

  useEffect(() => {
    localStorage.setItem('readerCustomTextColor', customTextColor);
  }, [customTextColor]);

  useEffect(() => {
    localStorage.setItem('readerFocusMode', focusMode.toString());
  }, [focusMode]);

  // Privilege info is only needed when:
  // 1. TOC is opened (to show lock icons and subscription status)
  // 2. Current chapter is locked AND user doesn't have access (lockMessage is not null)
  // If isLocked=true but lockMessage=null, user already has access - no need to fetch
  // We explicitly check for true to avoid undefined triggering the condition
  const needsPrivilegeForLockedChapter = chapter?.isLocked === true && chapter?.lockMessage != null;
  const shouldFetchPrivilege = tocOpened || needsPrivilegeForLockedChapter;

  // Fetch privilege info only when actually needed
  const { data: privilegeData } = useGetNovelPrivilege(novel?.id, shouldFetchPrivilege);
  const privilegeInfo = privilegeData?.isEnabled ? privilegeData : null;

  // Pagination for Table of Contents
  const CHAPTERS_PER_PAGE = 100;
  const totalPages = Math.ceil(allChapters.length / CHAPTERS_PER_PAGE);
  
  const paginatedChapters = useMemo(() => {
    const startIndex = (currentPage - 1) * CHAPTERS_PER_PAGE;
    const endIndex = startIndex + CHAPTERS_PER_PAGE;
    return allChapters.slice(startIndex, endIndex).map((ch, index) => ({
      ...ch,
      number: startIndex + index + 1
    }));
  }, [allChapters, currentPage]);

  // Find current chapter index
  const currentChapterIndex = useMemo(() => {
    return allChapters.findIndex(ch => ch.id === chapter?.id);
  }, [allChapters, chapter]);

  // Get previous and next chapter IDs
  const prevChapterId = currentChapterIndex > 0 
    ? allChapters[currentChapterIndex - 1].id
    : null;
    
  const nextChapterId = currentChapterIndex < allChapters.length - 1 
    ? allChapters[currentChapterIndex + 1].id
    : null;

  // Calculate reading progress and auto-load next chapter
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const element = contentRef.current;
        const totalHeight = element.scrollHeight - element.clientHeight;
        // Handle edge case where content fits in viewport (totalHeight = 0)
        const progress = totalHeight > 0 ? (element.scrollTop / totalHeight) * 100 : 0;
        setScrollProgress(Math.min(progress, 100));
        
        // Auto-navigate to next chapter when reaching 98% with continuous reading enabled
        if (continueReading && progress >= 98 && nextChapterId) {
          setTimeout(() => {
            navigate(`/novel/${novelSlug}/chapter/${nextChapterId}`);
          }, 500); // Small delay for better UX
        }
      }
    };

    const content = contentRef.current;
    if (content) {
      // Calculate initial progress
      handleScroll();
      
      content.addEventListener('scroll', handleScroll);
      return () => content.removeEventListener('scroll', handleScroll);
    }
  }, [continueReading, nextChapterId, navigate, novelSlug, chapter]);

  // Track reading progress (only for authenticated users)
  useEffect(() => {
    // Only track if user is logged in and chapter is loaded
    if (token && chapterId && chapter) {
      // Wait 3 seconds before tracking to ensure user is actually reading
      const trackTimer = setTimeout(() => {
        trackProgressMutation.mutate(chapterId);
      }, 3000);

      return () => clearTimeout(trackTimer);
    }
  }, [chapterId, token, chapter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update current page when chapter changes
  useEffect(() => {
    if (currentChapterIndex >= 0) {
      const page = Math.floor(currentChapterIndex / CHAPTERS_PER_PAGE) + 1;
      setCurrentPage(page);
    }
  }, [currentChapterIndex]);

  const handleLogout = () => {
    // Logout logic here
    navigate('/login');
  };

  const handleParagraphClick = (paragraph) => {
    // Strip HTML tags from paragraph content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = paragraph.content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    setCommentContext({
      type: "paragraph",
      targetId: paragraph.id,
      preview: plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '')
    });
    setShowComments(true);
  };

  const showDefaultIcon = !currentUser || !currentUser.profilePhoto || imageError;

  // Helper function to truncate title to max 10 words
  const truncateTitle = (title, maxWords = 10) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= maxWords) return title;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Copy to clipboard function
  const copyToClipboard = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Share URLs
  const shareOnFacebook = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const currentUrl = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`قراءة ${chapter?.title || 'الفصل'} من ${novel?.title || ''}`);
    const shareUrl = `https://twitter.com/intent/tweet?url=${currentUrl}&text=${text}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Follow/Unfollow handler
  const handleFollowToggle = () => {
    if (!currentUser) {
      alert('يرجى تسجيل الدخول أولاً');
      return;
    }
    
    toggleFollowMutation.mutate({
      isFollowed: novel?.author?.isFollowing,
      userId: novel.author.id
    });
  };

  // Theme styles
  const themeStyles = {
    dark: {
      bg: '#2C2C2C',
      text: '#FFFFFF',
      secondary: '#AAAAAA'
    },
    light: {
      bg: '#FFFFFF',
      text: '#2C2C2C',
      secondary: '#666666'
    },
    sepia: {
      bg: '#F4ECD8',
      text: '#5C4B37',
      secondary: '#8B7355'
    }
  };

  // Use custom colors if enabled, otherwise use theme
  const currentTheme = customColors 
    ? {
        bg: customBgColor,
        text: customTextColor,
        secondary: customTextColor + '99' // Add opacity to text color for secondary
      }
    : themeStyles[theme];

  // Separate content color - uses custom text color only for content, not headers
  const contentColor = customColors ? customTextColor : currentTheme.text;
  const headerColor = customColors ? themeStyles[theme].text : currentTheme.text;

  // Font family mapping
  const fontFamilyMap = {
    'noto': 'Noto Sans Arabic, sans-serif',
    'amiri': 'Amiri, serif',
    'tajawal': 'Tajawal, sans-serif',
    'cairo': 'Cairo, sans-serif',
    'scheherazade': 'Scheherazade New, serif'
  };


  return (
    <div className="relative" style={{ backgroundColor: currentTheme.bg }} dir="rtl">
      <Helmet>
        <title>{chapter?.title || 'الفصل'} - {novel?.title || 'رواية'} | سرد</title>
        <meta 
          name="description" 
          content={`اقرأ ${chapter?.title || 'الفصل'} من رواية ${novel?.title || ''} بقلم ${novel?.author?.displayName || ''}. ${chapter?.content?.substring(0, 120) || ''}...`}
        />
        <meta name="keywords" content={`${novel?.title || ''}, ${chapter?.title || ''}, فصل, رواية, ${novel?.author?.displayName || ''}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${chapter?.title || 'الفصل'} - ${novel?.title || 'رواية'}`} />
        <meta property="og:description" content={`اقرأ ${chapter?.title || 'الفصل'} من رواية ${novel?.title || ''}`} />
        <meta property="og:image" content={novel?.coverImageUrl || ''} />
        <meta property="og:url" content={`https://www.sardnovels.com/novel/${novelSlug}/chapter/${chapterId}`} />
        <meta property="og:locale" content="ar_AR" />
        <meta property="article:author" content={novel?.author?.displayName || ''} />
        <meta property="article:published_time" content={chapter?.createdAt || ''} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${chapter?.title || 'الفصل'} - ${novel?.title || 'رواية'}`} />
        <meta name="twitter:description" content={`اقرأ ${chapter?.title || 'الفصل'} من رواية ${novel?.title || ''}`} />
        <meta name="twitter:image" content={novel?.coverImageUrl || ''} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://www.sardnovels.com/novel/${novelSlug}/chapter/${chapterId}`} />
        
        {/* Structured Data - Chapter as Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": chapter?.title || 'الفصل',
            "description": `اقرأ ${chapter?.title || 'الفصل'} من رواية ${novel?.title || ''}`,
            "image": novel?.coverImageUrl || '',
            "author": {
              "@type": "Person",
              "name": novel?.author?.displayName || '',
              "url": `https://www.sardnovels.com/profile/${novel?.author?.userName || ''}`
            },
            "datePublished": chapter?.createdAt || '',
            "inLanguage": "ar",
            "isPartOf": {
              "@type": "Book",
              "name": novel?.title || '',
              "url": `https://www.sardnovels.com/novel/${novelSlug}`
            },
            "url": `https://www.sardnovels.com/novel/${novelSlug}/chapter/${chapterId}`
          })}
        </script>
      </Helmet>
      {/* Top Header Bar */}
      {!focusMode && (
        <div className="fixed top-0 left-0 right-0 z-40 flex items-center px-6 py-4 min-h-[72px]" style={{ backgroundColor: currentTheme.bg, borderBottom: `1px solid ${theme === 'dark' ? '#3C3C3C' : theme === 'light' ? '#E5E5E5' : '#D4C4A8'}` }}>
          {/* Left: SARD Logo + User + Library */}
          <div className="flex items-center gap-6 flex-1">
            <Link to="/home" className="noto-sans-arabic-extrabold text-[24px] leading-none hover:opacity-80 transition-opacity" style={{ color: currentTheme.text }}>
              سَرْد
            </Link>
            
            {/* User Dropdown - Hidden on mobile */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="hover:opacity-80 transition-opacity focus:outline-none"
              >
                {showDefaultIcon ? (
                  <div className="w-10 h-10 rounded-full bg-[#4A4A4A] flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
                    </svg>
                  </div>
                ) : (
                  <img
                    src={currentUser.profilePhoto}
                    alt={currentUser.displayName}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && currentUser && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-[#3C3C3C] rounded-xl shadow-lg overflow-hidden z-50">
                  <Link
                    to={`/profile/${currentUser.userName}`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                  >
                    <span className="text-[15px] noto-sans-arabic-extrabold">الملف الشخصي</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                  >
                    <span className="text-[15px] noto-sans-arabic-extrabold">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
            
            <Link to="/library" className="hidden md:block noto-sans-arabic-medium hover:opacity-80 transition-opacity" style={{ color: currentTheme.text }}>
              المكتبة
            </Link>
          </div>

          {/* Center: Novel Cover + Title - Absolutely centered */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
            {novel && (
              <>
                <Link 
                  to={`/novel/${novelSlug}`}
                  className="hover:opacity-80 transition-opacity"
                >
                  <img 
                    src={novel.coverImageUrl || '/default-cover.png'} 
                    alt={novel.title}
                    className="h-12 w-9 object-cover rounded"
                  />
                </Link>
                <Link 
                  to={`/novel/${novelSlug}`}
                  className="noto-sans-arabic-extrabold text-[16px] hover:opacity-70 transition-opacity"
                  style={{ color: currentTheme.text }}
                >
                  {truncateTitle(novel.title, 10)}
                </Link>
              </>
            )}
          </div>

          {/* Right: Progress */}
          <div className="flex items-center gap-2 flex-1 justify-end" style={{ color: currentTheme.secondary }}>
            <span className="text-[14px]">|</span>
            <span className="noto-sans-arabic-medium text-[14px]">
              {scrollProgress.toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Mobile Floating Menu - Smooth Slide Animation */}
      <div className="md:hidden fixed left-2 top-1/2 -translate-y-1/2 z-40">
        <div className="flex items-center gap-2">
          {/* Hidden buttons that slide in */}
          <div 
            className="flex flex-col gap-3 bg-[#3C3C3C] rounded-2xl p-3 shadow-2xl transition-all duration-300 ease-in-out"
            style={{ 
              transform: showMobileMenu ? 'translateX(0) scale(1)' : 'translateX(-120%) scale(0.8)',
              opacity: showMobileMenu ? 1 : 0,
              pointerEvents: showMobileMenu ? 'auto' : 'none'
            }}
          >
            <button
              onClick={() => {
                setShowComments(!showComments);
                setShowMobileMenu(false);
              }}
              className="p-3 rounded-xl bg-[#5A5A5A] hover:bg-[#6A6A6A] transition-colors text-white relative"
              aria-label="التعليقات"
            >
              <MessageCircle size={20} />
              {chapter?.commentsCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-[#0077FF] text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 noto-sans-arabic-bold">
                  {chapter.commentsCount > 99 ? '99+' : chapter.commentsCount}
                </span>
              )}
            </button>
            {/* Table of Contents Button */}
            <button
              onClick={() => {
                if (!showTOC) {
                  openTOC();
                } else {
                  setShowTOC(false);
                }
                setShowSettings(false);
                setShowMobileMenu(false);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: showTOC ? '#4A9EFF' : '#4A4A4A' }}
            >
              <Menu size={20} color="white" />
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowTOC(false);
                setShowMobileMenu(false);
              }}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: showSettings ? '#4A9EFF' : '#4A4A4A' }}
            >
              <Settings size={20} color="white" />
            </button>
          </div>
          
          {/* Toggle Button - Always visible */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-[#3C3C3C] shadow-xl transition-all hover:scale-110 active:scale-95 border-2 border-[#4A4A4A]"
          >
            <ChevronRight 
              size={22} 
              color="white"
              style={{
                transform: showMobileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease-in-out'
              }}
            />
          </button>
        </div>
      </div>

      {/* Desktop Left Sidebar with Controls */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col gap-6">
        {/* Table of Contents Button */}
        <button
          onClick={() => {
            if (!showTOC) {
              openTOC();
            } else {
              setShowTOC(false);
            }
            setShowSettings(false);
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: showTOC ? '#4A9EFF' : '#3C3C3C' }}
        >
          <Menu size={24} color="white" />
        </button>

        {/* Settings Button */}
        <button
          onClick={() => {
            setShowSettings(!showSettings);
            setShowTOC(false);
          }}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: showSettings ? '#4A9EFF' : '#3C3C3C' }}
        >
          <Settings size={24} color="white" />
        </button>
      </div>

      {/* Desktop Right Sidebar - Author Info & Share */}
      {!focusMode && novel?.author && (
        <div 
          className="hidden xl:flex fixed z-40 flex-col items-center gap-6 p-4 rounded-2xl w-[140px] transition-all duration-300" 
          style={{ 
            right: 'max(20px, calc(50% - 550px))',
            top: '150px'
          }}
        >
          {/* Author Section */}
          <div className="flex flex-col items-center gap-4 pb-5 border-b border-gray-600 w-full">
            {/* Author Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#4A9EFF]">
              <img 
                src={novel.author.profilePhoto || '/default-avatar.png'} 
                alt={novel.author.username}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* By Author Text */}
            <div className="flex items-center gap-1.5">
              <PenIcon className="w-4 h-4 text-[#4A9EFF]" />
              <span className="text-white noto-sans-arabic-medium text-[13px]">بقلم</span>
            </div>
            <span className="text-white noto-sans-arabic-bold text-[14px] text-center px-2 break-words w-full leading-tight">
              {novel.author.displayName || novel.author.username}
            </span>
          </div>

          {/* Share Section */}
          <div className="flex flex-col items-center gap-4 pt-2 w-full">
            <span className="text-white noto-sans-arabic-medium text-[13px] mb-1">مشاركة</span>
            
            {/* Facebook Share */}
            <button
              onClick={shareOnFacebook}
              className="w-12 h-12 rounded-full bg-[#3C3C3C] flex items-center justify-center transition-all hover:bg-[#1877F2] hover:scale-110"
              aria-label="Share on Facebook"
            >
              <Facebook size={20} color="white" />
            </button>

            {/* Twitter/X Share */}
            <button
              onClick={shareOnTwitter}
              className="w-12 h-12 rounded-full bg-[#3C3C3C] flex items-center justify-center transition-all hover:bg-[#1DA1F2] hover:scale-110"
              aria-label="Share on Twitter"
            >
              <Twitter size={20} color="white" />
            </button>

            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="w-12 h-12 rounded-full bg-[#3C3C3C] flex items-center justify-center transition-all hover:bg-[#4A9EFF] hover:scale-110"
              aria-label="Copy link"
            >
              {copied ? (
                <Check size={20} color="white" />
              ) : (
                <LinkIcon size={20} color="white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Table of Contents Sidebar */}
      {showTOC && (
        <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#3C3C3C] z-50 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <h2 className="text-white noto-sans-arabic-extrabold text-[20px]">جدول المحتويات</h2>
            <button onClick={() => setShowTOC(false)} className="text-white hover:text-gray-300 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-80px)] p-4 chapter-scroll">
            {chaptersLoading ? (
              <div className="flex items-center justify-center py-10">
                <span className="text-white noto-sans-arabic-medium">جاري التحميل...</span>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  {paginatedChapters.map((ch) => {
                    const isLocked = ch.isLocked && !privilegeInfo?.isSubscribed;
                    const isPrivilegeChapter = ch.isLocked;
                    const canAccess = !isLocked;
                    
                    return (
                      <Link
                        key={ch.id}
                        to={canAccess ? `/novel/${novelSlug}/chapter/${ch.id}` : '#'}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            // Check if user is logged in
                            if (!currentUser) {
                              setAuthModalAction('لقراءة هذا الفصل');
                              setIsAuthModalOpen(true);
                            } else {
                              setIsUnlockPrivilegeModalOpen(true);
                            }
                          }
                        }}
                        className={`block p-4 rounded-lg mb-2 transition-colors ${
                          ch.id === chapter?.id
                            ? 'bg-[#4A9EFF] text-white'
                            : isPrivilegeChapter
                            ? 'bg-[#2C2C2C] text-white hover:bg-[#3A3A3A]'
                            : 'text-white hover:bg-[#4A4A4A]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="noto-sans-arabic-medium text-[14px] mt-1">{ch.number}</span>
                          <div className="flex-1 flex items-center gap-2">
                            <span className="noto-sans-arabic-medium text-[15px] flex-1">{ch.title}</span>
                            {isPrivilegeChapter && (
                              <>
                                {canAccess ? (
                                  <Unlock className="w-4 h-4 text-green-400 flex-shrink-0" />
                                ) : (
                                  <Lock className="w-4 h-4 text-[#4A9EFF] flex-shrink-0" />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                
                {/* Chapter Range Navigation */}
                {totalPages > 1 && (
                  <div className="flex flex-wrap items-center justify-center gap-2 mt-6 pb-6">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      const start = (page - 1) * CHAPTERS_PER_PAGE + 1;
                      const end = Math.min(page * CHAPTERS_PER_PAGE, allChapters.length);
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-lg noto-sans-arabic-medium text-[14px] transition-colors ${
                            currentPage === page
                              ? 'bg-[#4A9EFF] text-white hover:bg-[#6BB4FF]'
                              : 'bg-[#4A4A4A] text-white hover:bg-[#5A5A5A]'
                          }`}
                        >
                          {start}-{end}
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Settings Sidebar */}
      {showSettings && (
        <div className="fixed right-0 top-0 bottom-0 w-[350px] bg-[#3C3C3C] z-50 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-600 flex-shrink-0">
            <h2 className="text-white noto-sans-arabic-extrabold text-[20px]">إعدادات القراءة</h2>
            <button onClick={() => setShowSettings(false)} className="text-white hover:text-gray-300 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
            {/* Theme Selection */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">الخلفية</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`w-16 h-16 rounded-xl border-2 transition-all ${
                    theme === 'light' ? 'border-[#4A9EFF]' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  {theme === 'light' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#4A9EFF]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setTheme('sepia')}
                  className={`w-16 h-16 rounded-xl border-2 transition-all ${
                    theme === 'sepia' ? 'border-[#4A9EFF]' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: '#F4ECD8' }}
                >
                  {theme === 'sepia' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#4A9EFF]" />
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`w-16 h-16 rounded-xl border-2 transition-all ${
                    theme === 'dark' ? 'border-[#4A9EFF]' : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: '#2C2C2C' }}
                >
                  {theme === 'dark' && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-[#4A9EFF]" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Custom Colors Toggle */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">ألوان مخصصة</h3>
              <button
                onClick={() => setCustomColors(!customColors)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  customColors
                    ? 'border-[#4A9EFF] bg-[#4A9EFF]/10'
                    : 'border-gray-600 bg-transparent'
                }`}
              >
                <span className={`noto-sans-arabic-medium text-[15px] ${customColors ? 'text-[#4A9EFF]' : 'text-white'}`}>
                  استخدام الألوان المخصصة
                </span>
                <div className={`w-12 h-6 rounded-full transition-all relative ${customColors ? 'bg-[#4A9EFF]' : 'bg-[#4A4A4A]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${customColors ? 'right-1' : 'right-7'}`} />
                </div>
              </button>
              
              {/* Color Pickers - Show when custom colors enabled */}
              {customColors && (
                <div className="mt-4 space-y-4 p-4 bg-[#2C2C2C] rounded-xl">
                  {/* Background Color */}
                  <div>
                    <label className="text-white noto-sans-arabic-medium text-[14px] mb-2 block">
                      لون الخلفية
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customBgColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={customBgColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#3C3C3C] text-white rounded-lg border border-gray-600 noto-sans-arabic-medium text-[14px]"
                        placeholder="#2C2C2C"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div>
                    <label className="text-white noto-sans-arabic-medium text-[14px] mb-2 block">
                      لون النص
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customTextColor}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-600"
                      />
                      <input
                        type="text"
                        value={customTextColor}
                        onChange={(e) => setCustomTextColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-[#3C3C3C] text-white rounded-lg border border-gray-600 noto-sans-arabic-medium text-[14px]"
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Font Family Selection */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">الخط</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFontFamily('noto')}
                  className={`px-3 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'noto' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="noto-sans-arabic-medium text-[14px]">Noto Sans</span>
                </button>
                <button
                  onClick={() => setFontFamily('amiri')}
                  className={`px-3 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'amiri' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="text-[14px]" style={{ fontFamily: 'Amiri, serif' }}>أميري</span>
                </button>
                <button
                  onClick={() => setFontFamily('tajawal')}
                  className={`px-3 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'tajawal' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="text-[14px]" style={{ fontFamily: 'Tajawal, sans-serif' }}>تجوال</span>
                </button>
                <button
                  onClick={() => setFontFamily('cairo')}
                  className={`px-3 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'cairo' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="text-[14px]" style={{ fontFamily: 'Cairo, sans-serif' }}>القاهرة</span>
                </button>
                <button
                  onClick={() => setFontFamily('scheherazade')}
                  className={`px-3 py-3 rounded-xl border-2 transition-all col-span-2 ${
                    fontFamily === 'scheherazade' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="text-[14px]" style={{ fontFamily: 'Scheherazade New, serif' }}>شهرزاد</span>
                </button>
              </div>
            </div>

            {/* Font Size Control */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">حجم الخط</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="w-10 h-10 rounded-lg bg-[#4A4A4A] text-white hover:bg-[#5A5A5A] transition-colors flex items-center justify-center"
                >
                  <span className="text-[20px]">-</span>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-white noto-sans-arabic-medium text-[18px]">{fontSize}</span>
                </div>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="w-10 h-10 rounded-lg bg-[#4A4A4A] text-white hover:bg-[#5A5A5A] transition-colors flex items-center justify-center"
                >
                  <span className="text-[20px]">+</span>
                </button>
              </div>
            </div>

            {/* Continue Reading Toggle */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">القراءة المتواصلة</h3>
              <button
                onClick={() => setContinueReading(!continueReading)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  continueReading
                    ? 'border-[#4A9EFF] bg-[#4A9EFF]/10'
                    : 'border-gray-600 bg-transparent'
                }`}
              >
                <span className={`noto-sans-arabic-medium text-[15px] ${continueReading ? 'text-[#4A9EFF]' : 'text-white'}`}>
                  تحميل الفصل التالي تلقائياً
                </span>
                <div className={`w-12 h-6 rounded-full transition-all relative ${continueReading ? 'bg-[#4A9EFF]' : 'bg-[#4A4A4A]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${continueReading ? 'right-1' : 'right-7'}`} />
                </div>
              </button>
              <p className="text-[#AAAAAA] text-[13px] noto-sans-arabic-regular mt-2">
                عند الوصول لنهاية الفصل، سيتم تحميل الفصل التالي تلقائياً
              </p>
            </div>

            {/* Focus Mode Toggle */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">وضع التركيز</h3>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                  focusMode
                    ? 'border-[#4A9EFF] bg-[#4A9EFF]/10'
                    : 'border-gray-600 bg-transparent'
                }`}
              >
                <span className={`noto-sans-arabic-medium text-[15px] ${focusMode ? 'text-[#4A9EFF]' : 'text-white'}`}>
                  إخفاء الشريط العلوي والمؤلف
                </span>
                <div className={`w-12 h-6 rounded-full transition-all relative ${focusMode ? 'bg-[#4A9EFF]' : 'bg-[#4A4A4A]'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${focusMode ? 'right-1' : 'right-7'}`} />
                </div>
              </button>
              <p className="text-[#AAAAAA] text-[13px] noto-sans-arabic-regular mt-2">
                إزالة المشتتات للقراءة دون إزعاج
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="pt-4 pb-8 px-6 overflow-y-auto overflow-x-visible custom-scrollbar transition-all duration-300"
        style={{ 
          height: focusMode ? '100vh' : 'calc(100vh - 72px)',
          marginTop: focusMode ? '0' : '72px',
          fontFamily: fontFamilyMap[fontFamily],
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position'
        }}
      >
        {chapterLoading || novelLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <span className="text-white noto-sans-arabic-medium text-[18px]">جاري تحميل الفصل...</span>
          </div>
        ) : chapterError || novelError ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <span className="text-red-500 noto-sans-arabic-medium text-[18px]">حدث خطأ في تحميل الفصل</span>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-[#4A9EFF] text-white rounded-xl noto-sans-arabic-medium hover:bg-[#6BB4FF] transition-colors"
            >
              العودة
            </button>
          </div>
        ) : chapter ? (
          <div className="max-w-[800px] mx-auto flex flex-col min-h-[calc(100vh-120px)]">
            {/* Chapter Title */}
            <h1 
              className="noto-sans-arabic-extrabold mb-8 text-center"
              style={{ 
                color: headerColor,
                fontSize: `${fontSize + 8}px`,
                lineHeight: '1.6'
              }}
            >
              {chapter.title}
            </h1>

            {/* Chapter Content - Takes available space */}
            <div className="space-y-2 flex-grow">
              {chapter.isLocked && (!chapter.paragraphs || chapter.paragraphs.length === 0) ? (
                // Locked chapter message
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="bg-[#2C2C2C] rounded-2xl p-8 max-w-md w-full border border-[#4A9EFF]/30">
                    <div className="flex flex-col items-center text-center gap-4">
                      <Lock className="w-16 h-16 text-[#4A9EFF]" />
                      <h3 className="text-white text-xl font-bold noto-sans-arabic-extrabold">
                        هذا الفصل مقفل
                      </h3>
                      <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium leading-relaxed">
                        {chapter.lockMessage === 'This chapter is locked by the privilege system. Subscribe to unlock all privilege chapters!' 
                          ? 'هذا الفصل مقفل بنظام الامتيازات. اشترك لفتح جميع الفصول المقفلة!'
                          : chapter.lockMessage || 'هذا الفصل مقفل بنظام الامتيازات. اشترك لفتح جميع الفصول المقفلة!'
                        }
                      </p>
                      {privilegeInfo && (
                        <button
                          onClick={() => {
                            if (!currentUser) {
                              setAuthModalAction('لقراءة هذا الفصل');
                              setIsAuthModalOpen(true);
                            } else {
                              setIsUnlockPrivilegeModalOpen(true);
                            }
                          }}
                          className="mt-4 w-full rounded-xl bg-[#4A9EFF] px-6 py-3 text-center text-base font-bold text-white shadow-lg shadow-[#4A9EFF]/20 transition-all hover:bg-[#3A8EEF] hover:scale-[1.02] active:scale-[0.98] noto-sans-arabic-extrabold"
                        >
                          {currentUser ? 'اشترك الآن' : 'سجل الدخول للاشتراك'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : chapter.paragraphs && chapter.paragraphs.length > 0 ? (
                // New format: Display paragraphs with inline comments
                chapter.paragraphs.map((paragraph) => (
                  <ChapterParagraph
                    key={paragraph.id}
                    paragraph={paragraph}
                    onCommentClick={handleParagraphClick}
                    theme={theme}
                    fontSize={fontSize}
                    textColor={contentColor}
                    fontFamily={fontFamilyMap[fontFamily]}
                  />
                ))
              ) : chapter.content ? (
                // Legacy format: Display old content as-is
                <div 
                  className="leading-[2] whitespace-pre-line py-4 px-4 md:px-6"
                  style={{ 
                    color: contentColor,
                    fontSize: `${fontSize}px`
                  }}
                >
                  {chapter.content}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p style={{ color: currentTheme.secondary }} className="noto-sans-arabic-medium">
                    لا يوجد محتوى لهذا الفصل بعد
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons - Always at bottom */}
            <div className="flex justify-between items-center mt-auto pt-8 pb-2 border-t" style={{ borderColor: theme === 'dark' ? '#3C3C3C' : theme === 'light' ? '#E5E5E5' : '#D4C4A8' }}>
              {prevChapterId ? (
                <button 
                  onClick={() => navigate(`/novel/${novelSlug}/chapter/${prevChapterId}`)}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-[#4A9EFF] text-white rounded-lg md:rounded-xl noto-sans-arabic-medium hover:bg-[#6BB4FF] transition-colors text-[13px] md:text-[15px]"
                >
                  <ChevronRight size={16} className="md:w-5 md:h-5" />
                  <span>الفصل السابق</span>
                </button>
              ) : (
                <div></div>
              )}
              {nextChapterId ? (
                <button 
                  onClick={() => navigate(`/novel/${novelSlug}/chapter/${nextChapterId}`)}
                  className="flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 bg-[#4A9EFF] text-white rounded-lg md:rounded-xl noto-sans-arabic-medium hover:bg-[#6BB4FF] transition-colors text-[13px] md:text-[15px]"
                >
                  <span>الفصل التالي</span>
                  <ChevronLeft size={16} className="md:w-5 md:h-5" />
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {/* Progress Bar */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gray-700 z-40">
        <div 
          className="h-full bg-[#4A9EFF] transition-all duration-300"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Desktop Floating Comments Button */}
      <div className="hidden md:block fixed bottom-24 right-6 z-40">
        <button
          onClick={() => {
            setCommentContext({ type: "chapter", targetId: chapterId, preview: null });
            setShowComments(true);
          }}
          className="relative flex items-center justify-center w-14 h-14 bg-[#0077FF] text-white rounded-full shadow-lg hover:bg-[#0066DD] transition-all hover:scale-110"
          aria-label="فتح التعليقات"
        >
          <MessagesSquare size={24} />
          {chapter?.commentsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#FF4444] text-white text-xs rounded-full min-w-6 h-6 flex items-center justify-center px-1.5 noto-sans-arabic-bold shadow-lg">
              {chapter.commentsCount > 99 ? '99+' : chapter.commentsCount}
            </span>
          )}
        </button>
      </div>

      {/* Unified Comment Panel (handles both chapter and paragraph comments) */}
      <CommentPanel
        isOpen={showComments}
        onClose={() => {
          setShowComments(false);
          setCommentContext({ type: "chapter", targetId: null, preview: null });
        }}
        chapterId={chapterId}
        novelSlug={novelSlug}
        commentType={commentContext.type}
        targetId={commentContext.targetId || chapterId}
        paragraphPreview={commentContext.preview}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action={authModalAction}
      />

      {/* Unlock Privilege Modal */}
      {privilegeInfo && (
        <UnlockPrivilegeModal
          isOpen={isUnlockPrivilegeModalOpen}
          onClose={() => setIsUnlockPrivilegeModalOpen(false)}
          privilegeCost={privilegeInfo.subscriptionCost}
          lockedChaptersCount={privilegeInfo.lockedChaptersCount}
          novelId={novel?.id}
          onSubscribeSuccess={() => {
            // Refetch privilege info to update subscription status
            fetchPrivilegeInfo();
          }}
        />
      )}
    </div>
  );
};

export default ChapterReaderPage;
