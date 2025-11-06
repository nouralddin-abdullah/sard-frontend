import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { translateGenre } from "../../utils/translate-genre";
import { 
  Heart, 
  Swords, 
  Wand2, 
  Rocket, 
  Search, 
  Zap, 
  Drama, 
  Laugh, 
  Ghost, 
  Compass 
} from "lucide-react";

// Icon mapping for genres
const GENRE_ICONS = {
  romance: Heart,
  action: Swords,
  fantasy: Wand2,
  "science-fiction": Rocket,
  mystery: Search,
  thriller: Zap,
  drama: Drama,
  comedy: Laugh,
  horror: Ghost,
  adventure: Compass,
};

const GenreShowcase = () => {
  const navigate = useNavigate();
  const { data: genres, isLoading } = useGetGenresList();

  const handleGenreClick = (genreSlug) => {
    navigate(`/genre/${genreSlug}`);
  };

  if (isLoading) {
    return (
      <section className="w-full py-12 px-4 bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="h-8 bg-[#3A3A3A] rounded w-48 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-[#3A3A3A] rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-48 bg-[#3A3A3A] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 bg-gradient-to-b from-[#2A2A2A] to-[#1A1A1A]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-3 noto-sans-arabic-extrabold">
            استكشف حسب النوع
          </h2>
          <p className="text-[#AAAAAA] text-lg noto-sans-arabic-medium">
            اختر النوع المفضل لديك واكتشف أفضل الروايات
          </p>
        </div>

        {/* Genre Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {genres?.map((genre) => {
            const IconComponent = GENRE_ICONS[genre.slug] || Compass;
            
            return (
              <button
                key={genre.id}
                onClick={() => handleGenreClick(genre.slug)}
                className="group relative bg-gradient-to-br from-[#3A3A3A] to-[#2A2A2A] rounded-2xl p-6 hover:from-[#4A9EFF] hover:to-[#3A7EDF] transition-all duration-500 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
                style={{ 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(74, 158, 255, 0.1)'
                }}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 20% 80%, rgba(74, 158, 255, 0.3) 0%, transparent 50%)`
                  }} />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px] gap-4">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4A9EFF]/20 to-[#3A7EDF]/20 flex items-center justify-center group-hover:from-white/20 group-hover:to-white/10 transition-all duration-500 group-hover:scale-110">
                    <IconComponent className="w-8 h-8 text-[#4A9EFF] group-hover:text-white transition-colors duration-500" />
                  </div>

                  {/* Genre Name */}
                  <div className="text-center">
                    <h3 className="text-white text-lg font-bold noto-sans-arabic-bold mb-1 group-hover:scale-105 transition-transform duration-300">
                      {translateGenre(genre.name)}
                    </h3>
                    <p className="text-[#AAAAAA] text-xs noto-sans-arabic-regular line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                      {genre.description}
                    </p>
                  </div>
                </div>

                {/* Hover Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GenreShowcase;
