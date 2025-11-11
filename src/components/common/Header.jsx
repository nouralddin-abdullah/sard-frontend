import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Home, Library, Pen, User as UserIconLucide, LogOut, ChevronDown, Trophy, Bell, X } from 'lucide-react';
import { useGetLoggedInUser } from '../../hooks/user/useGetLoggedInUser';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authTokenStore';
import SearchBar from './SearchBar';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '../../constants/token-key';

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
  </svg>
);

const UserIconSmall = () => (
  <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
  </svg>
);

const Header = () => {
  const { data: currentUser, isLoading } = useGetLoggedInUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { deleteToken } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close on click outside for desktop screens (md and above)
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      if (isDesktop && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Clear cookie
    Cookies.remove(TOKEN_KEY);
    
    // Clear Zustand store
    deleteToken();
    
    // Clear all React Query cache
    queryClient.clear();
    
    // Close dropdown
    setIsDropdownOpen(false);
    
    // Navigate to login
    navigate('/login');
    
    // Reload to ensure clean state
    window.location.reload();
  };

  // Show SVG icon if not logged in, loading, or image failed to load
  const showDefaultIcon = !currentUser || isLoading || !currentUser.profilePhoto || imageError;
  
  // Determine home link based on auth status
  const homeLink = currentUser ? "/home" : "/";
  
  return (
    <header className="bg-[#2C2C2C]" dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block py-4 px-6">
        <div className="max-w-[1920px] mx-auto flex items-center gap-6">
          {/* Logo */}
          <Link to={homeLink} className="flex-shrink-0">
            <h1 className="noto-sans-arabic-extrabold text-white text-[40px] leading-none">
              سَرْد
            </h1>
          </Link>
          {/* User Profile Dropdown */}
          <div className="relative flex-shrink-0" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:opacity-80 transition-opacity flex items-center gap-2 focus:outline-none"
            >
              {showDefaultIcon ? (
                <UserIcon />
              ) : (
                <img
                  src={currentUser.profilePhoto}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
              <ChevronDown
                className={`text-white transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                size={20}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#3C3C3C] rounded-lg shadow-lg overflow-hidden z-50">
                {currentUser ? (
                  // Logged in: Show Profile, Notifications and Logout
                  <>
                    <Link
                      to={`/profile/${currentUser.userName}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={20} />
                      <span className="text-[16px] noto-sans-arabic-extrabold">الملف الشخصي</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <Bell size={20} />
                      <span className="text-[16px] noto-sans-arabic-extrabold">الإشعارات</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <LogOut size={20} />
                      <span className="text-[16px] noto-sans-arabic-extrabold">تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  // Not logged in: Show Login and Signup
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={20} />
                      <span className="text-[16px] noto-sans-arabic-extrabold">تسجيل الدخول</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={20} />
                      <span className="text-[16px] noto-sans-arabic-extrabold">إنشاء حساب</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>


          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            <Link 
              to={homeLink}
              className="noto-sans-arabic-extrabold text-white text-[20px] hover:opacity-80 transition-opacity"
            >
              الرئيسية
            </Link>
            <Link 
              to="/library" 
              className="noto-sans-arabic-extrabold text-white text-[20px] hover:opacity-80 transition-opacity"
            >
              المكتبة
            </Link>
            <Link 
              to="/leaderboard" 
              className="noto-sans-arabic-extrabold text-white text-[20px] hover:opacity-80 transition-opacity"
            >
              المتصدرون
            </Link>
          </nav>

          {/* Author Tools - Before Search */}
          <Link 
            to="/dashboard/works" 
            className="noto-sans-arabic-extrabold text-white text-[20px] hover:opacity-80 transition-opacity mr-auto"
          >
            أدوات المؤلف
          </Link>

          {/* Search Bar */}
          <SearchBar className="flex-1 max-w-[400px]" />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="py-3 px-4 flex items-center justify-between">
          {/* Right: User Profile Dropdown (smaller) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hover:opacity-80 transition-opacity flex items-center gap-1 focus:outline-none"
            >
              {showDefaultIcon ? (
                <UserIconSmall />
              ) : (
                <img
                  src={currentUser.profilePhoto}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
              <ChevronDown
                className={`text-white transition-transform duration-300 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
                size={16}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 bg-[#3C3C3C] rounded-lg shadow-lg overflow-hidden z-50">
                {currentUser ? (
                  // Logged in: Show Profile and Logout
                  <>
                    <Link
                      to={`/profile/${currentUser.userName}`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={18} />
                      <span className="text-[14px] noto-sans-arabic-extrabold">الملف الشخصي</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="text-[14px] noto-sans-arabic-extrabold">تسجيل الخروج</span>
                    </button>
                  </>
                ) : (
                  // Not logged in: Show Login and Signup
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={18} />
                      <span className="text-[14px] noto-sans-arabic-extrabold">تسجيل الدخول</span>
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-white hover:bg-[#4A4A4A] transition-colors"
                    >
                      <UserIconLucide size={18} />
                      <span className="text-[14px] noto-sans-arabic-extrabold">إنشاء حساب</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Logo */}
          <Link to={homeLink} className="flex-shrink-0">
            <h1 className="noto-sans-arabic-extrabold text-white text-[24px] leading-none">
              سَرْد
            </h1>
          </Link>

          {/* Home Icon */}
          <Link 
            to={homeLink}
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="الرئيسية"
          >
            <Home size={24} />
          </Link>

          {/* Library Icon */}
          <Link 
            to="/library" 
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="المكتبة"
          >
            <Library size={24} />
          </Link>

          {/* Leaderboard Icon */}
          <Link 
            to="/leaderboard" 
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="المتصدرون"
          >
            <Trophy size={24} />
          </Link>

          {/* Author Tools Icon */}
          <Link 
            to="/dashboard/works" 
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="أدوات المؤلف"
          >
            <Pen size={24} />
          </Link>

          {/* Search Icon - Navigate to search page on mobile */}
          <Link 
            to="/search"
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="بحث"
          >
            <Search size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
