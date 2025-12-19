import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Library, Trophy, Search, Menu, X, User, Bell, Settings, LogOut, Pen, BookOpen, BarChart3, BookMarked, Award, DollarSign, Globe, ChevronDown } from 'lucide-react';
import { useGetLoggedInUser } from '../../hooks/user/useGetLoggedInUser';
import { useGetUnreadCount } from '../../hooks/notification/useGetUnreadCount';
import { useGetActiveCompetitions, CompetitionStatus } from '../../hooks/competition/useGetCompetitions';
import { useQueryClient } from '@tanstack/react-query';
import useAuthStore from '../../store/authTokenStore';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '../../constants/token-key';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: currentUser, dataUpdatedAt } = useGetLoggedInUser();
  const { data: unreadData } = useGetUnreadCount();
  const queryClient = useQueryClient();
  const { deleteToken } = useAuthStore();
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isContestsExpanded, setIsContestsExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fetch competitions from API (cached for 1 hour)
  const { totalActivePrize, activeCompetitions, completedCompetitions, isLoading: isLoadingCompetitions } = useGetActiveCompetitions();

  // Format prize for display
  const formatPrize = (amount) => {
    if (!amount) return null;
    return amount >= 1000 ? `$${(amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1)}k` : `$${amount}`;
  };

  const unreadCount = unreadData?.unreadCount || 0;

  // Cache-busting for profile photo
  const getProfilePhotoUrl = (url) => {
    if (!url) return null;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${dataUpdatedAt}`;
  };

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleLogout = () => {
    Cookies.remove(TOKEN_KEY);
    deleteToken();
    queryClient.clear();
    setIsDrawerOpen(false);
    navigate('/login');
    window.location.reload();
  };

  // Determine home link based on auth status
  const homeLink = currentUser ? "/home" : "/";

  // Check if current path is active
  const isActive = (path) => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Pages where navigation should be hidden
  const hiddenPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/change-password',
    '/auth/success',
    '/auth/error',
  ];

  // Check if we're in chapter reader
  const isChapterReader = location.pathname.includes('/chapter/');
  
  // Hide navigation on certain pages
  if (hiddenPaths.some(path => location.pathname.startsWith(path)) || isChapterReader) {
    return null;
  }

  const showDefaultIcon = !currentUser || !currentUser.profilePhoto || imageError;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#3C3C3C] bg-[#2C2C2C]/95 backdrop-blur-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex justify-around items-start pt-2 pb-1 px-1">
          {/* Home */}
          <Link 
            to={homeLink}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
          >
            <div className={`relative rounded-full px-4 py-1.5 transition-all ${
              isActive('/home') || isActive('/') 
                ? 'bg-[#4A9EFF]/20' 
                : ''
            }`}>
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill={isActive('/home') || isActive('/') ? '#4A9EFF' : 'none'}
                stroke={isActive('/home') || isActive('/') ? '#4A9EFF' : '#9CA3AF'}
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
            </div>
            <p className={`text-[10px] font-medium ${
              isActive('/home') || isActive('/') ? 'text-[#4A9EFF] font-semibold' : 'text-[#9CA3AF]'
            }`}>الرئيسية</p>
          </Link>

          {/* Library */}
          <Link 
            to="/library"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
          >
            <div className={`relative rounded-full px-4 py-1.5 transition-all ${
              isActive('/library') 
                ? 'bg-[#4A9EFF]/20' 
                : ''
            }`}>
              <Library 
                size={22} 
                className={isActive('/library') ? 'text-[#4A9EFF]' : 'text-[#9CA3AF]'} 
                fill={isActive('/library') ? '#4A9EFF' : 'none'}
              />
            </div>
            <p className={`text-[10px] font-medium ${
              isActive('/library') ? 'text-[#4A9EFF] font-semibold' : 'text-[#9CA3AF]'
            }`}>المكتبة</p>
          </Link>

          {/* Contests - Opens drawer with competitions */}
          <button 
            onClick={() => {
              setIsDrawerOpen(true);
              setIsContestsExpanded(true);
            }}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
          >
            <div className="relative rounded-full px-4 py-1.5 transition-all">
              {/* Trophy/Award Icon for Contests */}
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
              </svg>
              {/* Prize Badge - Red notification style - shows total active prize */}
              {totalActivePrize > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[7px] font-bold px-1 py-0.5 rounded-full whitespace-nowrap shadow-lg animate-pulse">
                  {formatPrize(totalActivePrize)}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-[#9CA3AF]">المسابقات</p>
          </button>

          {/* Leaderboard - New Position (where Search was) */}
          <Link 
            to="/leaderboard"
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
          >
            <div className={`relative rounded-full px-4 py-1.5 transition-all ${
              isActive('/leaderboard') 
                ? 'bg-[#4A9EFF]/20' 
                : ''
            }`}>
              <svg 
                width="22" 
                height="22" 
                viewBox="0 0 24 24" 
                fill={isActive('/leaderboard') ? '#4A9EFF' : 'none'}
                stroke={isActive('/leaderboard') ? '#4A9EFF' : '#9CA3AF'}
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p className={`text-[10px] font-medium ${
              isActive('/leaderboard') ? 'text-[#4A9EFF] font-semibold' : 'text-[#9CA3AF]'
            }`}>المتصدرون</p>
          </Link>

          {/* More Menu */}
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all"
          >
            <div className="relative rounded-full px-4 py-1.5">
              <Menu size={22} className="text-[#9CA3AF]" />
              {currentUser && unreadCount > 0 && (
                <span className="absolute top-0 right-2 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <p className="text-[10px] font-medium text-[#9CA3AF]">المزيد</p>
          </button>
        </div>
      </nav>

      {/* Drawer Backdrop */}
      {isDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside 
        className={`md:hidden fixed top-0 bottom-0 right-0 z-50 w-72 transform transition-transform duration-300 ease-out bg-[#1E1E1E] rounded-l-2xl shadow-2xl flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3C3C3C]">
          <h3 className="text-lg font-bold text-white noto-sans-arabic-extrabold">القائمة</h3>
          <button 
            onClick={() => setIsDrawerOpen(false)}
            className="p-2 rounded-full text-[#9CA3AF] hover:bg-white/5 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* User Info Section */}
        {currentUser && (
          <div className="p-4 border-b border-[#3C3C3C]">
            <Link 
              to={`/profile/${currentUser.userName}`}
              onClick={() => setIsDrawerOpen(false)}
              className="flex items-center gap-3"
            >
              {showDefaultIcon ? (
                <div className="w-12 h-12 rounded-full bg-[#3C3C3C] flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
              ) : (
                <img
                  src={getProfilePhotoUrl(currentUser.profilePhoto)}
                  alt={currentUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold noto-sans-arabic-bold truncate">
                  {currentUser.displayName || currentUser.userName}
                </p>
                <p className="text-[#9CA3AF] text-sm truncate">@{currentUser.userName}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {/* Search - Moved from bottom nav */}
          <Link
            to="/search"
            onClick={() => setIsDrawerOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
              isActive('/search') 
                ? 'bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                : 'text-white hover:bg-white/5'
            }`}
          >
            <Search 
              size={20} 
              className={isActive('/search') ? 'text-[#4A9EFF]' : 'text-[#9CA3AF] group-hover:text-[#4A9EFF]'} 
            />
            <span className="text-sm font-medium noto-sans-arabic-medium">البحث</span>
          </Link>

          {/* Divider after Search */}
          <div className="h-px bg-[#3C3C3C] my-3" />

          {/* Competitions Section - Expandable */}
          <div className="mb-4">
            <button
              onClick={() => setIsContestsExpanded(!isContestsExpanded)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Award size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
                <span className="text-sm font-medium noto-sans-arabic-medium">المسابقات</span>
                {totalActivePrize > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {formatPrize(totalActivePrize)}
                  </span>
                )}
              </div>
              <ChevronDown 
                size={18} 
                className={`text-[#9CA3AF] transition-transform duration-200 ${isContestsExpanded ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Competitions List */}
            {isContestsExpanded && (
              <div className="mt-2 mr-8 space-y-1">
                {isLoadingCompetitions && (
                  <div className="px-3 py-2 text-gray-400 text-sm">جاري التحميل...</div>
                )}

                {/* Active Competitions */}
                {!isLoadingCompetitions && activeCompetitions.length > 0 && (
                  <>
                    {activeCompetitions.map((contest) => (
                      <Link
                        key={contest.id}
                        to={`/contests/${contest.slug || contest.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-white rounded-lg hover:bg-[#4A9EFF] transition-colors"
                      >
                        <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={contest.imageUrl} 
                            alt={contest.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium noto-sans-arabic-medium truncate">{contest.name}</p>
                          <p className="text-[10px] text-gray-400">
                            {contest.status === 'Upcoming' ? 'قادمة' : 'جارية'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </>
                )}

                {/* Completed Competitions */}
                {!isLoadingCompetitions && completedCompetitions.length > 0 && (
                  <>
                    <div className="px-3 pt-2 pb-1">
                      <p className="text-[10px] text-gray-500 noto-sans-arabic-medium">منتهية</p>
                    </div>
                    {completedCompetitions.slice(0, 3).map((contest) => (
                      <Link
                        key={contest.id}
                        to={`/contests/${contest.slug || contest.id}`}
                        onClick={() => setIsDrawerOpen(false)}
                        className="block px-3 py-1.5 text-gray-400 text-sm rounded-lg hover:bg-[#3C3C3C] hover:text-white transition-colors noto-sans-arabic-medium"
                      >
                        {contest.name}
                      </Link>
                    ))}
                  </>
                )}

                {/* Empty state */}
                {!isLoadingCompetitions && activeCompetitions.length === 0 && completedCompetitions.length === 0 && (
                  <div className="px-3 py-2 text-gray-400 text-sm noto-sans-arabic-medium">
                    لا توجد مسابقات حالياً
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-[#3C3C3C] my-3" />

          {/* Author Tools Section - No header text */}
          <div className="mb-4">
            <div className="space-y-1">
              <Link
                to="/dashboard/works"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
              >
                <Pen size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
                <span className="text-sm font-medium noto-sans-arabic-medium">أدوات المؤلف</span>
              </Link>
              <Link
                to={currentUser ? `/profile/${currentUser.userName}?tab=reading-lists` : '/login'}
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
              >
                <BookMarked size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
                <span className="text-sm font-medium noto-sans-arabic-medium">قوائم القراءة</span>
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-[#3C3C3C] my-3" />

          {/* Main Navigation */}
          <div className="space-y-1">
            {currentUser ? (
              <>
                <Link
                  to={`/profile/${currentUser.userName}`}
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive(`/profile/${currentUser.userName}`) 
                      ? 'bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <User 
                    size={20} 
                    className={isActive(`/profile/${currentUser.userName}`) ? 'text-[#4A9EFF]' : 'text-[#9CA3AF] group-hover:text-[#4A9EFF]'} 
                    fill={isActive(`/profile/${currentUser.userName}`) ? '#4A9EFF' : 'none'}
                  />
                  <span className="text-sm font-medium noto-sans-arabic-medium">الملف الشخصي</span>
                </Link>

                <Link
                  to="/notifications"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive('/notifications') 
                      ? 'bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <Bell 
                      size={20} 
                      className={isActive('/notifications') ? 'text-[#4A9EFF]' : 'text-[#9CA3AF] group-hover:text-[#4A9EFF]'} 
                      fill={isActive('/notifications') ? '#4A9EFF' : 'none'}
                    />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium noto-sans-arabic-medium">الإشعارات</span>
                  {unreadCount > 0 && (
                    <span className="mr-auto text-xs font-semibold bg-[#4A9EFF] text-white rounded-full h-5 min-w-5 flex items-center justify-center px-1.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/settings"
                  onClick={() => setIsDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${
                    isActive('/settings') 
                      ? 'bg-[#4A9EFF]/10 text-[#4A9EFF]' 
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  <Settings 
                    size={20} 
                    className={isActive('/settings') ? 'text-[#4A9EFF]' : 'text-[#9CA3AF] group-hover:text-[#4A9EFF]'} 
                  />
                  <span className="text-sm font-medium noto-sans-arabic-medium">الإعدادات</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <User size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
                  <span className="text-sm font-medium noto-sans-arabic-medium">تسجيل الدخول</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <User size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
                  <span className="text-sm font-medium noto-sans-arabic-medium">إنشاء حساب</span>
                </Link>
              </>
            )}
          </div>

          {/* Help Center */}
          <div className="h-px bg-[#3C3C3C] my-3" />
          
          {/* Author Benefits, Earnings, My Wikipedia */}
          <Link
            to="/authorsbenefits"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
          >
            <Award size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
            <span className="text-sm font-medium noto-sans-arabic-medium">مزايا المؤلفين</span>
          </Link>
          <Link
            to="/earnings"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
          >
            <DollarSign size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
            <span className="text-sm font-medium noto-sans-arabic-medium">الأرباح</span>
          </Link>
          <Link
            to="/metwekpeida"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
          >
            <Globe size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
            <span className="text-sm font-medium noto-sans-arabic-medium">موسوعتي</span>
          </Link>

          <div className="h-px bg-[#3C3C3C] my-3" />
          <Link
            to="/help"
            onClick={() => setIsDrawerOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-white/5 transition-colors group"
          >
            <BookOpen size={20} className="text-[#9CA3AF] group-hover:text-[#4A9EFF] transition-colors" />
            <span className="text-sm font-medium noto-sans-arabic-medium">مركز المساعدة</span>
          </Link>
        </nav>

        {/* Logout Button */}
        {currentUser && (
          <div className="p-3 border-t border-[#3C3C3C]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-white rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors group"
            >
              <LogOut size={20} className="text-[#9CA3AF] group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium noto-sans-arabic-medium">تسجيل الخروج</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default MobileNavigation;
