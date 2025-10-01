import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Home, Library, Pen } from 'lucide-react';

const UserIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
  </svg>
);

const Header = () => {
  return (
    <header className="bg-[#3C3C3C]" dir="rtl">
      {/* Desktop Header */}
      <div className="hidden md:block py-4 px-6">
        <div className="max-w-[1920px] mx-auto flex items-center gap-6">
          {/* User Icon */}
          <Link 
            to="/profile" 
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <UserIcon />
          </Link>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="noto-sans-arabic-extrabold text-white text-[40px] leading-none">
              سَرْد
            </h1>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
            <Link 
              to="/" 
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
          </nav>

          {/* Author Tools - Before Search */}
          <Link 
            to="/dashboard/works" 
            className="noto-sans-arabic-extrabold text-white text-[20px] hover:opacity-80 transition-opacity mr-auto"
          >
            أدوات المؤلف
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-[400px]">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بأسم الرواية"
                className="noto-sans-arabic-extrabold w-full bg-white rounded-full px-6 py-3 pr-12 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400"
                dir="rtl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="py-3 px-4 flex items-center justify-between">
          {/* Right: User Icon (smaller) */}
          <Link 
            to="/profile" 
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M24 43.5C27.4233 43.505 30.787 42.6046 33.75 40.89V34.5C33.75 32.7098 33.0388 30.9929 31.773 29.727C30.5071 28.4612 28.7902 27.75 27 27.75H21C19.2098 27.75 17.4929 28.4612 16.227 29.727C14.9612 30.9929 14.25 32.7098 14.25 34.5V40.89C17.213 42.6046 20.5767 43.505 24 43.5ZM38.25 34.5V37.311C40.8441 34.5339 42.5702 31.0594 43.2162 27.3145C43.8622 23.5696 43.3998 19.7175 41.886 16.2319C40.3722 12.7462 37.8728 9.77884 34.6952 7.69453C31.5176 5.61022 27.8002 4.49982 24 4.49982C20.1998 4.49982 16.4824 5.61022 13.3048 7.69453C10.1272 9.77884 7.62783 12.7462 6.114 16.2319C4.60016 19.7175 4.13781 23.5696 4.78378 27.3145C5.42975 31.0594 7.15589 34.5339 9.75 37.311V34.5C9.7491 32.1804 10.4652 29.9173 11.8003 28.0205C13.1354 26.1236 15.0242 24.6859 17.208 23.904C16.0752 22.601 15.341 20.9996 15.0932 19.2909C14.8454 17.5822 15.0943 15.8382 15.8102 14.2671C16.5262 12.6959 17.679 11.3638 19.1311 10.4298C20.5832 9.49568 22.2734 8.99902 24 8.99902C25.7266 8.99902 27.4168 9.49568 28.8689 10.4298C30.321 11.3638 31.4738 12.6959 32.1898 14.2671C32.9057 15.8382 33.1546 17.5822 32.9068 19.2909C32.659 20.9996 31.9248 22.601 30.792 23.904C32.9758 24.6859 34.8646 26.1236 36.1997 28.0205C37.5348 29.9173 38.2509 32.1804 38.25 34.5ZM24 48C30.3652 48 36.4697 45.4714 40.9706 40.9706C45.4714 36.4697 48 30.3652 48 24C48 17.6348 45.4714 11.5303 40.9706 7.02944C36.4697 2.52856 30.3652 0 24 0C17.6348 0 11.5303 2.52856 7.02944 7.02944C2.52856 11.5303 0 17.6348 0 24C0 30.3652 2.52856 36.4697 7.02944 40.9706C11.5303 45.4714 17.6348 48 24 48ZM28.5 18C28.5 19.1935 28.0259 20.3381 27.182 21.182C26.3381 22.0259 25.1935 22.5 24 22.5C22.8065 22.5 21.6619 22.0259 20.818 21.182C19.9741 20.3381 19.5 19.1935 19.5 18C19.5 16.8065 19.9741 15.6619 20.818 14.818C21.6619 13.9741 22.8065 13.5 24 13.5C25.1935 13.5 26.3381 13.9741 27.182 14.818C28.0259 15.6619 28.5 16.8065 28.5 18Z" fill="white"/>
            </svg>
          </Link>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="noto-sans-arabic-extrabold text-white text-[24px] leading-none">
              سَرْد
            </h1>
          </Link>

          {/* Home Icon */}
          <Link 
            to="/" 
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

          {/* Author Tools Icon */}
          <Link 
            to="/dashboard/works" 
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="أدوات المؤلف"
          >
            <Pen size={24} />
          </Link>

          {/* Search Icon */}
          <button 
            className="flex-shrink-0 text-white hover:opacity-80 transition-opacity"
            aria-label="بحث"
          >
            <Search size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
