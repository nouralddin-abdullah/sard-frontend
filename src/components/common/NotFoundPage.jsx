import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowRight, Search } from "lucide-react";
import Header from "./Header";

const NotFoundPage = ({
  title = "الصفحة غير موجودة",
  message = "عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.",
  showBackButton = true,
  showHomeButton = true,
  showSearchButton = false,
  customAction = null,
}) => {
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#2C2C2C] flex items-center justify-center px-4" dir="rtl">
        <div className="text-center max-w-md">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-[120px] md:text-[150px] font-black text-[#4A9EFF] opacity-20 leading-none noto-sans-arabic-extrabold">
              404
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white noto-sans-arabic-extrabold mb-4">
            {title}
          </h1>

          {/* Message */}
          <p className="text-[#B0B0B0] text-base md:text-lg noto-sans-arabic-medium mb-8 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-6 py-3 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white rounded-lg transition-colors noto-sans-arabic-extrabold"
              >
                <ArrowRight className="w-5 h-5" />
                <span>العودة للخلف</span>
              </button>
            )}

            {showHomeButton && (
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-lg transition-colors noto-sans-arabic-extrabold"
              >
                <Home className="w-5 h-5" />
                <span>الصفحة الرئيسية</span>
              </Link>
            )}

            {showSearchButton && (
              <Link
                to="/search"
                className="flex items-center gap-2 px-6 py-3 bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white rounded-lg transition-colors noto-sans-arabic-extrabold"
              >
                <Search className="w-5 h-5" />
                <span>البحث</span>
              </Link>
            )}

            {customAction}
          </div>
        </div>
      </main>
    </>
  );
};

export default NotFoundPage;
