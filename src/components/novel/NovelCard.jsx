import { BookOpen, Clock, Eye, Star, CheckCircle, BookMarked, LibraryBig } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import { Link } from "react-router-dom";
import { translateGenre } from "../../utils/translate-genre";
import { useState, useEffect, useRef } from "react";
import AddNovelToReadingListModal from "./AddNovelToReadingListModal";
import AuthRequiredModal from "../common/AuthRequiredModal";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";

const NovelCard = ({ novel }) => {
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const summaryRef = useRef(null);
  const { data: currentUser } = useGetLoggedInUser();
  
  // Check if summary is truncated
  useEffect(() => {
    if (summaryRef.current) {
      const element = summaryRef.current;
      setIsTruncated(element.scrollHeight > element.clientHeight);
    }
  }, [novel.summary]);
  
  // Get status label in Arabic
  const getStatusLabel = (status) => {
    const statusMap = {
      'Ongoing': 'مستمرة',
      'Completed': 'مكتملة',
      'Hiatus': 'متوقفة',
      'Archived': 'مؤرشفة'
    };
    return statusMap[status] || status;
  };

  const handleReadMoreClick = (e) => {
    e.preventDefault();
    setShowFullSummary(!showFullSummary);
  };

  return (
    <div className="relative flex flex-col items-stretch justify-between rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
      {/* Background Cover Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={novel.coverImageUrl}
          alt={novel.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/98 via-[#2C2C2C]/90 to-[#2C2C2C]/80" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-4 md:gap-6 p-6 md:p-8">
        {/* Cover Image Card - Like Novel Details Page */}
        <Link to={`/novel/${novel.slug}`} className="flex-shrink-0 mx-auto md:mx-0">
          <img
            src={novel.coverImageUrl}
            alt={novel.title}
            className="w-32 md:w-40 h-auto object-cover rounded-lg shadow-xl hover:shadow-2xl transition-shadow duration-300"
            loading="lazy"
          />
        </Link>

        {/* Content Section */}
        <div className="flex flex-col flex-grow">
          {/* Header - Title & Author */}
          <div className="flex flex-col gap-1 mb-4">
            <Link 
              to={`/novel/${novel.slug}`}
              className="text-white tracking-tight text-xl md:text-2xl font-bold leading-tight noto-sans-arabic-extrabold hover:text-[#0077FF] transition-colors line-clamp-2"
            >
              {novel.title}
            </Link>
            {novel.authorName && (
              <p className="text-gray-300 text-sm font-medium leading-normal noto-sans-arabic-medium">
                بواسطة {novel.authorName}
              </p>
            )}
          </div>

          {/* Chips - Genres, Status, Rating */}
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Genre Chips */}
            {novel.genresList && novel.genresList.slice(0, 2).map((genre) => (
              <div 
                key={genre.id} 
                className="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-[#0077FF]/20 px-2.5 border border-[#0077FF]/30"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#0077FF]" />
                <p className="text-[#0077FF] text-xs font-medium leading-normal noto-sans-arabic-medium">
                  {translateGenre(genre.name)}
                </p>
              </div>
            ))}

            {/* Status Chip */}
            <div className="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-[#0077FF]/20 px-2.5 border border-[#0077FF]/30">
              <CheckCircle className="w-3.5 h-3.5 text-[#0077FF]" />
              <p className="text-[#0077FF] text-xs font-medium leading-normal noto-sans-arabic-medium">
                {getStatusLabel(novel.status)}
              </p>
            </div>

            {/* Rating Chip */}
            {novel.totalAverageScore > 0 && (
              <div className="flex h-7 shrink-0 items-center justify-center gap-x-1.5 rounded-full bg-[#0077FF]/20 px-2.5 border border-[#0077FF]/30">
                <Star className="w-3.5 h-3.5 text-[#0077FF] fill-[#0077FF]" />
                <p className="text-[#0077FF] text-xs font-medium leading-normal noto-sans-arabic-medium">
                  {novel.totalAverageScore.toFixed(1)}/5
                </p>
              </div>
            )}
          </div>

          {/* Summary */}
          {novel.summary && (
            <div className="mb-3">
              <p 
                ref={summaryRef}
                className={`text-gray-200 text-sm font-normal leading-relaxed noto-sans-arabic-regular ${
                  showFullSummary ? '' : 'line-clamp-2'
                }`}
              >
                {novel.summary}
              </p>
              {isTruncated && (
                <button
                  onClick={handleReadMoreClick}
                  className="text-[#0077FF] text-xs font-semibold leading-normal pt-1 hover:underline cursor-pointer noto-sans-arabic-bold transition-colors"
                >
                  {showFullSummary ? 'إخفاء' : 'اقرأ المزيد'}
                </button>
              )}
            </div>
          )}

          {/* Stats - Views & Last Updated */}
          {(novel.totalViews > 0 || novel.lastUpdatedAt) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 noto-sans-arabic-regular">
              {novel.totalViews > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>
                    {novel.totalViews >= 1000 
                      ? `${(novel.totalViews / 1000).toFixed(1)}k` 
                      : novel.totalViews} مشاهدة
                  </span>
                </div>
              )}
              {novel.lastUpdatedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{getTimeAgo(novel.lastUpdatedAt)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Action Buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 md:p-8 pt-4 md:pt-4 border-t border-white/10">
        {/* Add to Library Button */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            if (!currentUser) {
              setIsAuthModalOpen(true);
              return;
            }
            setIsAddToListModalOpen(true);
          }}
          aria-label="إضافة إلى المكتبة"
          className="flex items-center justify-center h-10 w-10 rounded-full text-gray-300 hover:bg-white/10 hover:text-[#0077FF] transition-colors"
        >
          <LibraryBig className="w-5 h-5" />
        </button>

        {/* Start Reading Button */}
        <Link
          to={`/novel/${novel.slug}`}
          className="flex w-full sm:w-auto min-w-[140px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-5 bg-[#0077FF] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#0066DD] transition-all transform hover:scale-105 noto-sans-arabic-bold"
        >
          <span className="truncate">عرض تفاصيل الرواية</span>
        </Link>
      </div>

      {/* Add to Reading List Modal */}
      <AddNovelToReadingListModal
        isOpen={isAddToListModalOpen}
        onClose={() => setIsAddToListModalOpen(false)}
        novelId={novel.id}
        novelTitle={novel.title}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action="لإضافة الرواية إلى المكتبة"
      />
    </div>
  );
};

export default NovelCard;
