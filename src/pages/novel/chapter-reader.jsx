import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Menu, Settings, X, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import { useGetLoggedInUser } from '../../hooks/user/useGetLoggedInUser';
import { useGetNovelChapters } from '../../hooks/novel/useGetNovelChapters';
import { useGetChapterById } from '../../hooks/novel/useGetChapterById';
import { useGetNovelBySlug } from '../../hooks/novel/useGetNovelBySlug';

const ChapterReaderPage = () => {
  const { novelSlug, chapterId } = useParams();
  const navigate = useNavigate();
  const { data: currentUser } = useGetLoggedInUser();
  
  // Fetch novel data
  const { data: novel, isLoading: novelLoading, error: novelError } = useGetNovelBySlug(novelSlug);
  
  // Fetch chapter data
  const { data: chapter, isLoading: chapterLoading, error: chapterError } = useGetChapterById(
    novel?.id,
    chapterId
  );
  
  // Fetch all chapters for TOC
  const { data: allChapters = [], isLoading: chaptersLoading } = useGetNovelChapters(novel?.id);
  
  const [showTOC, setShowTOC] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // For TOC pagination
  const [showMobileMenu, setShowMobileMenu] = useState(false); // Mobile menu trigger
  
  // Reader settings
  const [theme, setTheme] = useState('dark'); // 'dark', 'light', 'sepia'
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('noto'); // 'noto', 'amiri'
  const [continueReading, setContinueReading] = useState(false); // Auto-load next chapter
  
  const contentRef = useRef(null);
  const dropdownRef = useRef(null);

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

  const showDefaultIcon = !currentUser || !currentUser.profilePhoto || imageError;

  // Helper function to truncate title to max 10 words
  const truncateTitle = (title, maxWords = 10) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= maxWords) return title;
    return words.slice(0, maxWords).join(' ') + '...';
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

  const currentTheme = themeStyles[theme];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: currentTheme.bg }} dir="rtl">
      {/* Top Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4" style={{ backgroundColor: currentTheme.bg, borderBottom: `1px solid ${theme === 'dark' ? '#3C3C3C' : theme === 'light' ? '#E5E5E5' : '#D4C4A8'}` }}>
        {/* Left: Library & User */}
        <div className="flex items-center gap-6">
          <Link to="/library" className="hidden md:block noto-sans-arabic-medium hover:opacity-80 transition-opacity" style={{ color: currentTheme.text }}>
            المكتبة
          </Link>
          
          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
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
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#3C3C3C] rounded-xl shadow-lg overflow-hidden z-50">
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
        </div>

        {/* Center: Book Icon + Title / Chapter */}
        <div className="flex items-center gap-3 flex-1 justify-center">
          <BookOpen size={24} style={{ color: currentTheme.text }} />
          <div className="flex items-center gap-2 text-center" style={{ color: currentTheme.text }}>
            {novel && (
              <>
                <Link 
                  to={`/novel/${novelSlug}`}
                  className="noto-sans-arabic-extrabold text-[16px] hover:opacity-70 transition-opacity"
                >
                  {truncateTitle(novel.title, 10)}
                </Link>
                <span className="hidden md:inline text-[16px]">/</span>
                <span className="hidden md:inline noto-sans-arabic-medium text-[16px]">
                  {chapter?.title || 'جاري التحميل...'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Progress */}
        <div className="flex items-center gap-2" style={{ color: currentTheme.secondary }}>
          <span className="text-[14px]">|</span>
          <span className="noto-sans-arabic-medium text-[14px]">
            {scrollProgress.toFixed(0)}%
          </span>
        </div>
      </div>

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
            {/* Table of Contents Button */}
            <button
              onClick={() => {
                setShowTOC(!showTOC);
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
            setShowTOC(!showTOC);
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
                  {paginatedChapters.map((ch) => (
                    <Link
                      key={ch.id}
                      to={`/novel/${novelSlug}/chapter/${ch.id}`}
                      className={`block p-4 rounded-lg mb-2 transition-colors ${
                        ch.id === chapter?.id
                          ? 'bg-[#4A9EFF] text-white'
                          : 'text-white hover:bg-[#4A4A4A]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="noto-sans-arabic-medium text-[14px] mt-1">{ch.number}</span>
                        <span className="noto-sans-arabic-medium text-[15px] flex-1">{ch.title}</span>
                      </div>
                    </Link>
                  ))}
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
        <div className="fixed right-0 top-0 bottom-0 w-[350px] bg-[#3C3C3C] z-50 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-600">
            <h2 className="text-white noto-sans-arabic-extrabold text-[20px]">إعدادات القراءة</h2>
            <button onClick={() => setShowSettings(false)} className="text-white hover:text-gray-300 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 space-y-8">
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

            {/* Font Family Selection */}
            <div>
              <h3 className="text-white noto-sans-arabic-medium text-[16px] mb-4">الخط</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setFontFamily('noto')}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'noto' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="noto-sans-arabic-medium text-[15px]">Noto Sans</span>
                </button>
                <button
                  onClick={() => setFontFamily('amiri')}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-all ${
                    fontFamily === 'amiri' 
                      ? 'border-[#4A9EFF] bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'border-gray-600 text-white'
                  }`}
                >
                  <span className="text-[15px]" style={{ fontFamily: 'Amiri, serif' }}>أميري</span>
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
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        ref={contentRef}
        className="pt-24 pb-20 px-6 overflow-y-auto custom-scrollbar"
        style={{ 
          maxHeight: '100vh',
          fontFamily: fontFamily === 'noto' ? 'Noto Sans Arabic, sans-serif' : 'Amiri, serif'
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
          <div className="max-w-[800px] mx-auto">
            {/* Chapter Title */}
            <h1 
              className="noto-sans-arabic-extrabold mb-8 text-center"
              style={{ 
                color: currentTheme.text,
                fontSize: `${fontSize + 8}px`,
                lineHeight: '1.6'
              }}
            >
              {chapter.title}
            </h1>

            {/* Chapter Content */}
            <div 
              className="leading-[2] whitespace-pre-line"
              style={{ 
                color: currentTheme.text,
                fontSize: `${fontSize}px`
              }}
            >
              {chapter.content}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t" style={{ borderColor: theme === 'dark' ? '#3C3C3C' : theme === 'light' ? '#E5E5E5' : '#D4C4A8' }}>
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
    </div>
  );
};

export default ChapterReaderPage;
