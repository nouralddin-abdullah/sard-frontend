import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { translateGenre } from "../../utils/translate-genre";
import StarRating from "../common/StarRating";
import PenIcon from "../common/PenIcon";

// Character limit for summary before showing "show more"
const SUMMARY_CHAR_LIMIT = 300;

const NovelHeroSection = ({
  novel,
  chapters,
  readingProgress,
  novelSlug,
  onRateClick,
  formatDate,
  getStatusText,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = novel.summary.length > SUMMARY_CHAR_LIMIT;

  const displayedSummary = shouldTruncate && !isExpanded
    ? novel.summary.substring(0, SUMMARY_CHAR_LIMIT) + "..."
    : novel.summary;

  return (
    <div className="bg-[#3C3C3C] rounded-xl p-6 md:p-8 shadow-lg">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Cover Image */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <img
            src={novel.coverImageUrl}
            alt={novel.title}
            className="w-full max-w-[250px] md:w-64 h-auto object-cover rounded-lg shadow-xl"
          />
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col justify-between">
          <div className="flex flex-col flex-grow">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-white noto-sans-arabic-extrabold mb-3">
              {novel.title}
            </h1>

            {/* Status and Genres Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`text-xs font-medium px-3 py-1.5 rounded-full noto-sans-arabic-extrabold ${
                  novel.status === "Ongoing"
                    ? "bg-green-500/20 text-green-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {getStatusText(novel.status)}
              </span>
              {novel.genresList.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-[#4A4A4A] text-white text-xs font-medium px-3 py-1.5 rounded-full noto-sans-arabic-medium"
                >
                  {translateGenre(genre.name)}
                </span>
              ))}
            </div>

            {/* Summary */}
            <div className="mb-6">
              <p className={`text-[#B0B0B0] text-sm md:text-base leading-relaxed noto-sans-arabic-medium whitespace-pre-line ${
                !isExpanded && shouldTruncate ? "line-clamp-4 md:line-clamp-none" : ""
              }`}>
                {displayedSummary}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center gap-1 text-[#4A9EFF] hover:text-[#3A8EEF] text-sm font-medium mt-2 noto-sans-arabic-medium transition-colors cursor-pointer"
                >
                  <span>{isExpanded ? "عرض أقل" : "عرض المزيد"}</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>

            {/* Spacer to push author row to bottom */}
            <div className="flex-grow"></div>

            {/* Author and Stats Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
              {/* Author */}
              <Link
                to={`/profile/${novel.author.userName}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={novel.author.profilePhoto || "/default-avatar.png"}
                  alt={novel.author.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#4A9EFF] transition-all"
                />
                <span className="font-bold text-white noto-sans-arabic-extrabold group-hover:text-[#4A9EFF] transition-colors">
                  {novel.author.displayName}
                </span>
              </Link>

              {/* Stats */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <StarRating rating={novel.totalAverageScore} className="h-5 w-5" />
                  <span className="font-bold text-white text-sm noto-sans-arabic-extrabold">
                    {novel.totalAverageScore.toFixed(1)} ({novel.reviewCount.toLocaleString()})
                  </span>
                  <button
                    onClick={onRateClick}
                    className="text-[#B0B0B0] hover:text-[#4A9EFF] transition-colors cursor-pointer"
                  >
                    <PenIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Date */}
                <span className="text-sm text-[#B0B0B0] noto-sans-arabic-medium">
                  {formatDate(novel.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            {chapters.length > 0 && (
              <Link
                to={
                  readingProgress?.hasProgress && readingProgress?.progress
                    ? `/novel/${novelSlug}/chapter/${readingProgress.progress.lastReadChapterId}`
                    : `/novel/${novelSlug}/chapter/${chapters[0].id}`
                }
                className="flex-grow bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors noto-sans-arabic-extrabold"
              >
                <BookOpen className="w-5 h-5" />
                <span>
                  {readingProgress?.hasProgress && readingProgress?.progress
                    ? "متابعة القراءة"
                    : "ابدأ القراءة"}
                </span>
              </Link>
            )}
            <button className="bg-[#4A4A4A] hover:bg-[#5A5A5A] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors noto-sans-arabic-extrabold">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelHeroSection;
