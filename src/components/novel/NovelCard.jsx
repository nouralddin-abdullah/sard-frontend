import { BookOpen, Clock, Eye } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import { Link } from "react-router-dom";
import StarRating from "../common/StarRating";
import GenreBadge from "../common/GenreBadge";

const NovelCard = ({ novel }) => {
  return (
    <Link
      to={`/novel/${novel.slug}`}
      className="group flex gap-4 bg-[#2A2A2A] rounded-xl overflow-hidden transition-all duration-300 hover:transform hover:scale-[1.01] hover:shadow-2xl p-4"
      style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)' }}
    >
      {/* Cover Image */}
      <div className="relative w-32 sm:w-40 flex-shrink-0 aspect-[3/4] overflow-hidden bg-[#1A1A1A] rounded-lg">
        <img
          src={novel.coverImageUrl}
          alt={novel.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Badge */}
        <div className="absolute top-2 right-2">
          <span 
            className={`px-2 py-1 rounded-full text-xs font-bold noto-sans-arabic-bold ${
              novel.status === 'Completed' 
                ? 'bg-green-500/90 text-white' 
                : 'bg-blue-500/90 text-white'
            }`}
          >
            {novel.status === 'Ongoing' ? 'مستمرة' : 'مكتملة'}
          </span>
        </div>

        {/* Views Badge */}
        {novel.totalViews > 0 && (
          <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
            <Eye className="w-3 h-3 text-[#4A9EFF]" />
            <span className="text-white text-xs font-medium noto-sans-arabic-medium">
              {novel.totalViews >= 1000 
                ? `${(novel.totalViews / 1000).toFixed(1)}k` 
                : novel.totalViews}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Title */}
          <h3 className="text-white text-lg font-bold noto-sans-arabic-extrabold line-clamp-2 mb-2 leading-tight">
            {novel.title}
          </h3>

          {/* Genres */}
          {novel.genresList && novel.genresList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {novel.genresList.slice(0, 3).map((genre) => (
                <GenreBadge key={genre.id} genre={genre} size="sm" />
              ))}
            </div>
          )}

          {/* Rating */}
          {novel.totalAverageScore > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={novel.totalAverageScore} className="w-4 h-4" />
              <span className="text-white text-sm font-bold noto-sans-arabic-bold">
                {novel.totalAverageScore.toFixed(1)}
              </span>
            </div>
          )}

          {/* Summary */}
          {novel.summary && (
            <p className="text-[#AAAAAA] text-sm noto-sans-arabic-regular leading-relaxed mb-3 line-clamp-3 overflow-hidden text-ellipsis">
              {novel.summary}
            </p>
          )}
        </div>

        {/* Footer Stats */}
        <div className="pt-3 flex items-center justify-between text-xs">
          {/* Author */}
          {novel.authorName && (
            <div className="flex items-center gap-1 text-[#888888]">
              <span className="noto-sans-arabic-medium">بواسطة</span>
              <span className="text-[#4A9EFF] noto-sans-arabic-bold truncate max-w-[150px]">
                {novel.authorName}
              </span>
            </div>
          )}

          {/* Last Updated */}
          {novel.lastUpdatedAt && (
            <div className="flex items-center gap-1 text-[#888888]">
              <Clock className="w-3.5 h-3.5" />
              <span className="noto-sans-arabic-medium">
                {getTimeAgo(novel.lastUpdatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NovelCard;
