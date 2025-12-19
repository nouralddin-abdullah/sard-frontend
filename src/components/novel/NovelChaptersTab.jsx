import React from "react";
import { Link } from "react-router-dom";
import { Lock, Unlock, Eye } from "lucide-react";
import { formatViews } from "../../utils/format-views";

const NovelChaptersTab = ({
  chapters,
  chaptersLoading,
  novelSlug,
  readingProgress,
  privilegeInfo,
  onUnlockPrivilege,
  formatDate,
}) => {
  if (chaptersLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-white text-xl noto-sans-arabic-extrabold">
          جاري تحميل الفصول...
        </p>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <p className="text-white text-center noto-sans-arabic-extrabold py-10">
        لا توجد فصول متاحة حالياً
      </p>
    );
  }

  const lockedChapters = chapters.filter((ch) => ch.isLocked);
  const unlockedChapters = chapters.filter((ch) => !ch.isLocked);
  const isUserSubscribed = privilegeInfo?.isSubscribed;

  return (
    <div className="space-y-2">
      {/* Unlocked Chapters */}
      <div className="divide-y divide-[#4A4A4A]">
        {unlockedChapters.map((chapter) => {
          const chapterNumber = chapters.findIndex((ch) => ch.id === chapter.id) + 1;
          const lastReadChapterNumber = readingProgress?.progress?.lastReadChapterNumber || 0;
          const isRead = chapterNumber < lastReadChapterNumber;
          const isLastRead = chapterNumber === lastReadChapterNumber;

          return (
            <Link
              key={chapter.id}
              to={`/novel/${novelSlug}/chapter/${chapter.id}`}
              className={`flex justify-between items-center py-3 px-2 rounded transition-colors cursor-pointer hover:bg-[#4A4A4A] ${
                isRead ? "opacity-60" : ""
              } ${isLastRead ? "bg-[#4A9EFF]/10" : ""}`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`noto-sans-arabic-medium text-sm truncate max-w-[150px] sm:max-w-[200px] md:max-w-[300px] lg:max-w-[400px] ${
                    isRead ? "text-[#B0B0B0]" : "text-white"
                  } ${isLastRead ? "text-[#4A9EFF]" : ""}`}
                  title={chapter.title}
                >
                  {chapter.title}
                </span>
                {isLastRead && (
                  <span className="text-xs bg-[#4A9EFF] text-white px-2 py-0.5 rounded noto-sans-arabic-medium flex-shrink-0">
                    آخر قراءة
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className={`text-xs noto-sans-arabic-medium flex items-center gap-1 ${
                    isRead ? "text-[#888888]" : "text-[#B0B0B0]"
                  } ${isLastRead ? "text-[#4A9EFF]" : ""}`}
                >
                  {formatViews(chapter.viewsCount)}
                  <Eye className="w-3 h-3" />
                </span>
                <span
                  className={`text-xs noto-sans-arabic-medium ${
                    isRead ? "text-[#888888]" : "text-[#B0B0B0]"
                  } ${isLastRead ? "text-[#4A9EFF]" : ""}`}
                >
                  {formatDate(chapter.createdAt)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Locked Chapters Divider */}
      {privilegeInfo?.isEnabled && lockedChapters.length > 0 && (
        <div className="flex items-center py-4">
          <div className="flex-grow border-t border-dashed border-[#4A4A4A]"></div>
          <span className="flex-shrink mx-4 text-xs text-[#B0B0B0] noto-sans-arabic-medium">
            {lockedChapters.length} فصل مقفل
          </span>
          <div className="flex-grow border-t border-dashed border-[#4A4A4A]"></div>
        </div>
      )}

      {/* Privilege Banner */}
      {privilegeInfo?.isEnabled && privilegeInfo?.lockedChaptersCount > 0 && !isUserSubscribed && (
        <div className="bg-[#2C2C2C] border border-[#4A4A4A] rounded-lg p-4 text-center">
          <h3 className="font-bold text-white noto-sans-arabic-extrabold">اقرأ قبل الجميع!</h3>
          <p className="text-sm text-[#B0B0B0] mt-1 noto-sans-arabic-medium">
            افتح {privilegeInfo.lockedChaptersCount} فصل حصري وادعم الكاتب من خلال شراء وصول نظام الامتيازات.
          </p>
          <button
            onClick={onUnlockPrivilege}
            className="mt-4 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white font-bold py-2 px-6 rounded-lg transition-colors noto-sans-arabic-extrabold"
          >
            كن قارئ امتيازات
          </button>
        </div>
      )}

      {/* Locked Chapters */}
      <div className="divide-y divide-[#4A4A4A]">
        {lockedChapters.map((chapter) => {
          const canAccess = isUserSubscribed;

          return (
            <Link
              key={chapter.id}
              to={canAccess ? `/novel/${novelSlug}/chapter/${chapter.id}` : "#"}
              onClick={(e) => {
                if (!canAccess) {
                  e.preventDefault();
                  onUnlockPrivilege();
                }
              }}
              className="flex justify-between items-center py-3 px-2 rounded transition-colors cursor-pointer hover:bg-[#4A4A4A] text-[#B0B0B0]"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {canAccess ? (
                  <Unlock className="w-4 h-4 text-[#4A9EFF] flex-shrink-0" />
                ) : (
                  <Lock className="w-4 h-4 text-[#4A9EFF] flex-shrink-0" />
                )}
                <span 
                  className="noto-sans-arabic-medium text-sm truncate max-w-[120px] sm:max-w-[180px] md:max-w-[280px] lg:max-w-[380px]"
                  title={chapter.title}
                >
                  {chapter.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded noto-sans-arabic-medium border flex-shrink-0 ${
                    canAccess
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-[#4A9EFF]/20 text-[#4A9EFF] border-[#4A9EFF]/30"
                  }`}
                >
                  {canAccess ? "مفتوح" : "مقفل"}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs noto-sans-arabic-medium flex items-center gap-1 text-[#B0B0B0]">
                  {formatViews(chapter.viewsCount)}
                  <Eye className="w-3 h-3" />
                </span>
                <span className="text-xs noto-sans-arabic-medium">{formatDate(chapter.createdAt)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default NovelChaptersTab;
