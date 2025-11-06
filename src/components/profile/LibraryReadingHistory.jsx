import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, BookOpen, Info, ListPlus, LogIn } from "lucide-react";
import AddNovelToReadingListModal from "../novel/AddNovelToReadingListModal";
import { useGetReadingHistory } from "../../hooks/novel/useGetReadingHistory";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const ReadingHistoryCard = ({ novel, onAddToList }) => {
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const handleContinueReading = () => {
    navigate(`/novel/${novel.slug}/chapter/${novel.lastReadChapterId}`);
  };

  const handleNovelDetails = () => {
    navigate(`/novel/${novel.slug}`);
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Novel Cover with Progress Bar */}
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
        <img
          src={novel.coverImageUrl}
          alt={novel.title}
          className="w-full h-full object-cover"
        />
        
        {/* Progress Bar at bottom of cover */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white text-xs noto-sans-arabic-medium">
              الفصل {novel.lastReadChapterNumber} من {novel.totalChapters}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[#0077FF] h-full transition-all duration-300"
              style={{ width: `${novel.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Hover Actions Overlay */}
        {showActions && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-4">
            <button
              onClick={handleContinueReading}
              className="w-full py-2.5 px-4 bg-[#0077FF] hover:bg-[#0066DD] text-white rounded-lg noto-sans-arabic-medium flex items-center justify-center gap-2 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>متابعة القراءة</span>
            </button>
            
            <button
              onClick={handleNovelDetails}
              className="w-full py-2.5 px-4 bg-[#5A5A5A] hover:bg-[#6A6A6A] text-white rounded-lg noto-sans-arabic-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>تفاصيل الرواية</span>
            </button>
            
            <button
              onClick={() => onAddToList(novel)}
              className="w-full py-2.5 px-4 bg-[#5A5A5A] hover:bg-[#6A6A6A] text-white rounded-lg noto-sans-arabic-medium flex items-center justify-center gap-2 transition-colors"
            >
              <ListPlus className="w-5 h-5" />
              <span>أضف لقائمة القراءة</span>
            </button>
          </div>
        )}
      </div>

      {/* Novel Info Below Cover */}
      <div className="mt-3 space-y-2">
        {/* Novel Title */}
        <Link to={`/novel/${novel.slug}`}>
          <h3 className="text-white noto-sans-arabic-bold text-base hover:text-[#0077FF] transition-colors line-clamp-2 leading-tight">
            {novel.title}
          </h3>
        </Link>

        {/* Stats */}
        <div className="flex items-center gap-2 text-[#888888] text-xs noto-sans-arabic-medium">
          <span>★ {novel.totalAverageScore?.toFixed(1) || "0.0"}</span>
          <span>•</span>
          <span>{novel.totalViews?.toLocaleString() || 0} قراءة</span>
        </div>

        {/* Author Info */}
        <Link 
          to={`/profile/${novel.author.userName}`}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img 
            src={novel.author.profilePhoto || "/profilePicture.jpg"} 
            alt={novel.author.displayName}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">
            {novel.author.displayName}
          </span>
        </Link>
      </div>
    </div>
  );
};

const LibraryReadingHistory = () => {
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const navigate = useNavigate();
  
  const token = Cookies.get(TOKEN_KEY);
  const { data: currentUser } = useGetLoggedInUser();
  const { data, isLoading, error } = useGetReadingHistory(1, 20);

  const handleAddToList = (novel) => {
    setSelectedNovel(novel);
    setIsAddToListModalOpen(true);
  };

  // Show auth prompt if not logged in
  if (!token || !currentUser) {
    return (
      <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <LogIn className="w-16 h-16 text-[#0077FF] mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4 noto-sans-arabic-extrabold">
            مكتبتي
          </h2>
          <p className="text-[#B0B0B0] noto-sans-arabic-medium text-lg mb-8">
            سجل الدخول لتتبع تقدمك في القراءة وإدارة مكتبتك الشخصية
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-8 py-3 bg-[#0077FF] hover:bg-[#0066DD] text-white rounded-lg noto-sans-arabic-medium transition-colors flex items-center gap-2 mx-auto"
          >
            <LogIn className="w-5 h-5" />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center text-white">
        <p className="noto-sans-arabic-medium">حدث خطأ في تحميل سجل القراءة</p>
      </div>
    );
  }

  const novels = data?.items || [];

  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white py-8 px-4 sm:px-6 lg:px-12">
      <div className="w-[95%] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold noto-sans-arabic-extrabold mb-2">
            مكتبتي
          </h1>
          <p className="text-[#B0B0B0] noto-sans-arabic-medium text-lg">
            الروايات التي تقرأها حالياً
          </p>
        </div>

        {/* Reading History Grid */}
        {novels.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-[#686868] mx-auto mb-4" />
            <p className="text-[#686868] noto-sans-arabic-medium text-xl">
              لم تبدأ بقراءة أي رواية بعد
            </p>
            <p className="text-[#888888] noto-sans-arabic-medium text-sm mt-2">
              ابحث عن روايات مثيرة واب دأ رحلتك في القراءة
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {novels.map((novel) => (
              <ReadingHistoryCard
                key={novel.novelId}
                novel={novel}
                onAddToList={handleAddToList}
              />
            ))}
          </div>
        )}

        {/* Add to Reading List Modal */}
        {selectedNovel && (
          <AddNovelToReadingListModal
            isOpen={isAddToListModalOpen}
            onClose={() => {
              setIsAddToListModalOpen(false);
              setSelectedNovel(null);
            }}
            novelId={selectedNovel.novelId}
            novelTitle={selectedNovel.title}
          />
        )}
      </div>
    </div>
  );
};

export default LibraryReadingHistory;
