import { BookOpen, Clock, Eye } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import { Link } from "react-router-dom";
import StarRating from "../common/StarRating";

const NovelCard = ({ novel }) => {
  return (
    <Link
      to={`/novel/${novel.slug}`}
      className="group flex gap-4 rounded-2xl border p-4 transition-all duration-200 hover:scale-[1.01]"
      style={{ backgroundColor: '#3C3C3C', borderColor: '#5A5A5A' }}
    >
      {/* Cover Image */}
      <div className="relative w-28 h-36 flex-shrink-0 overflow-hidden rounded-xl">
        <img
          src={novel.coverImageUrl}
          alt={novel.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Title and Status */}
        <div>
          <h3 className="text-white text-base noto-sans-arabic-extrabold line-clamp-2 leading-tight mb-2">
            {novel.title}
          </h3>
          
          {/* Genres */}
          {novel.genresList && novel.genresList.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {novel.genresList.slice(0, 2).map((genre) => (
                <span
                  key={genre.id}
                  className="text-xs px-2 py-0.5 rounded-full noto-sans-arabic-medium"
                  style={{ backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2">
          {/* Rating with Stars */}
          {novel.totalAverageScore > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={novel.totalAverageScore} className="w-3.5 h-3.5" />
              <span className="text-xs noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                {novel.totalAverageScore.toFixed(1)}
              </span>
            </div>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Views */}
            <div className="flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" style={{ color: '#0077FF' }} />
              <span className="noto-sans-arabic-medium" style={{ color: '#B8B8B8' }}>
                {novel.totalViews?.toLocaleString() || 0}
              </span>
            </div>

            {/* Chapters */}
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" style={{ color: '#0077FF' }} />
              <span className="noto-sans-arabic-medium" style={{ color: '#B8B8B8' }}>
                {novel.chapterCount} فصل
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center gap-1.5 col-span-2">
              <div 
                className={`h-2 w-2 rounded-full ${novel.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`}
              />
              <span className="noto-sans-arabic-medium" style={{ color: '#B8B8B8' }}>
                {novel.status === 'Ongoing' ? 'مستمرة' : 'مكتملة'}
              </span>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 text-xs mt-2">
          <Clock className="h-3.5 w-3.5" style={{ color: '#797979' }} />
          <span className="noto-sans-arabic-medium" style={{ color: '#797979' }}>
            {getTimeAgo(novel.lastUpdatedAt)}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default NovelCard;
