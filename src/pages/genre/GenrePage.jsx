import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  TrendingUp, 
  Star, 
  Eye, 
  Clock, 
  MessageSquare, 
  Sparkles,
  ChevronDown,
  CheckCircle,
  BookOpen,
  Filter
} from "lucide-react";
import Header from "../../components/common/Header";
import NovelCard from "../../components/novel/NovelCard";
import NovelCardSkeleton from "../../components/novel/NovelCardSkeleton";
import { useGetGenreNovels } from "../../hooks/genre/useGetGenreNovels";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { formatViews } from "../../utils/format-views";
import { translateGenre } from "../../utils/translate-genre";

const SORTING_OPTIONS = [
  { value: "popular", label: "الأكثر مشاهدة", icon: Eye },
  { value: "rating", label: "الأعلى تقييماً", icon: Star },
  { value: "most_reviewed", label: "الأكثر مراجعة", icon: MessageSquare },
  { value: "newest", label: "الأحدث", icon: Clock },
  { value: "new", label: "نجم صاعد", icon: Sparkles },
  { value: "trending", label: "رائج", icon: TrendingUp },
  { value: "top_rated", label: "الأفضل", icon: Star },
];

const COMPLETION_OPTIONS = [
  { value: null, label: "الكل" },
  { value: false, label: "مستمرة" },
  { value: true, label: "مكتملة" },
];

const GenrePage = () => {
  const { genreSlug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get filters from URL or set defaults
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [sorting, setSorting] = useState(searchParams.get("sorting") || "popular");
  const [isCompleted, setIsCompleted] = useState(() => {
    const param = searchParams.get("completed");
    if (param === "true") return true;
    if (param === "false") return false;
    return null;
  });
  const [showFilters, setShowFilters] = useState(false);

  const pageSize = 20;

  // Fetch genre data
  const { data: genres } = useGetGenresList();
  const currentGenre = genres?.find((g) => g.slug === genreSlug);

  // Fetch novels
  const { data: novelsData, isLoading, error } = useGetGenreNovels({
    genreSlug,
    pageNumber: currentPage,
    pageSize,
    sorting,
    isCompleted,
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (currentPage > 1) params.set("page", currentPage);
    if (sorting !== "popular") params.set("sorting", sorting);
    if (isCompleted !== null) params.set("completed", isCompleted);
    
    setSearchParams(params, { replace: true });
  }, [currentPage, sorting, isCompleted, setSearchParams]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sorting, isCompleted]);

  const handleSortingChange = (newSorting) => {
    setSorting(newSorting);
  };

  const handleCompletionChange = (value) => {
    setIsCompleted(value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!currentGenre && !isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A]">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4 noto-sans-arabic-extrabold">
              النوع غير موجود
            </h1>
            <button
              onClick={() => navigate("/")}
              className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white px-6 py-3 rounded-lg noto-sans-arabic-bold transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-8 md:mt-20">
        {/* Genre Header */}
        <div className="mb-8 bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div style={{
              backgroundImage: `radial-gradient(circle at 80% 20%, rgba(74, 158, 255, 0.3) 0%, transparent 50%)`
            }} className="w-full h-full" />
          </div>
          <div className="relative z-10">
            <h1 className="text-4xl font-bold text-white mb-3 noto-sans-arabic-extrabold">
              {currentGenre ? translateGenre(currentGenre.name) : genreSlug}
            </h1>
            <p className="text-[#AAAAAA] text-lg noto-sans-arabic-medium max-w-3xl">
              {currentGenre?.description || "اكتشف أفضل الروايات في هذا النوع"}
            </p>
            {novelsData && (
              <p className="text-[#4A9EFF] mt-4 noto-sans-arabic-medium">
                {novelsData.totalItemsCount} رواية متوفرة
              </p>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-6 bg-[#2A2A2A] rounded-xl p-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-white noto-sans-arabic-bold mb-4 md:hidden"
          >
            <Filter className="w-5 h-5" />
            الفلاتر
            <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <div className={`grid md:grid md:grid-cols-2 gap-4 ${showFilters ? "grid" : "hidden md:grid"}`}>
            {/* Sorting Filter */}
            <div>
              <label className="block text-white text-right mb-2 noto-sans-arabic-bold text-sm">
                الترتيب حسب
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SORTING_OPTIONS.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSortingChange(option.value)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 noto-sans-arabic-medium text-sm ${
                        sorting === option.value
                          ? "bg-[#4A9EFF] text-white"
                          : "bg-[#3A3A3A] text-[#AAAAAA] hover:bg-[#4A4A4A]"
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Completion Filter */}
            <div>
              <label className="block text-white text-right mb-2 noto-sans-arabic-bold text-sm">
                حالة الرواية
              </label>
              <div className="grid grid-cols-3 gap-2">
                {COMPLETION_OPTIONS.map((option) => (
                  <button
                    key={option.value === null ? "all" : option.value.toString()}
                    onClick={() => handleCompletionChange(option.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 noto-sans-arabic-medium text-sm ${
                      isCompleted === option.value
                        ? "bg-[#4A9EFF] text-white"
                        : "bg-[#3A3A3A] text-[#AAAAAA] hover:bg-[#4A4A4A]"
                    }`}
                  >
                    {option.value === true && <CheckCircle className="w-4 h-4" />}
                    {option.value === false && <BookOpen className="w-4 h-4" />}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(sorting !== "popular" || isCompleted !== null) && (
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="text-[#AAAAAA] noto-sans-arabic-medium text-sm">الفلاتر النشطة:</span>
            {sorting !== "popular" && (
              <span className="bg-[#4A9EFF] text-white px-3 py-1 rounded-full text-xs noto-sans-arabic-medium flex items-center gap-1">
                {SORTING_OPTIONS.find(o => o.value === sorting)?.label}
                <button
                  onClick={() => setSorting("popular")}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
            {isCompleted !== null && (
              <span className="bg-[#4A9EFF] text-white px-3 py-1 rounded-full text-xs noto-sans-arabic-medium flex items-center gap-1">
                {COMPLETION_OPTIONS.find(o => o.value === isCompleted)?.label}
                <button
                  onClick={() => setIsCompleted(null)}
                  className="hover:bg-white/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <NovelCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-lg noto-sans-arabic-medium">
              حدث خطأ أثناء تحميل الروايات
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && novelsData?.items?.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-20 h-20 text-[#4A4A4A] mx-auto mb-4" />
            <p className="text-[#AAAAAA] text-xl noto-sans-arabic-medium">
              لا توجد روايات متاحة بهذه الفلاتر
            </p>
          </div>
        )}

        {/* Novels Grid */}
        {!isLoading && !error && novelsData?.items?.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {novelsData.items.map((novel) => {
                // Add current genre to novel if genresList is empty
                const novelWithGenre = {
                  ...novel,
                  genresList: novel.genresList?.length > 0 
                    ? novel.genresList 
                    : currentGenre 
                      ? [{ id: currentGenre.id, name: currentGenre.name, slug: currentGenre.slug }]
                      : []
                };
                
                return (
                  <NovelCard
                    key={novel.id}
                    novel={novelWithGenre}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {novelsData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium"
                >
                  السابق
                </button>

                <div className="flex gap-2">
                  {[...Array(novelsData.totalPages)].map((_, i) => {
                    const page = i + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === novelsData.totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg transition-colors noto-sans-arabic-medium ${
                            currentPage === page
                              ? "bg-[#4A9EFF] text-white"
                              : "bg-[#3A3A3A] text-white hover:bg-[#4A4A4A]"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-[#AAAAAA]">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === novelsData.totalPages}
                  className="px-4 py-2 bg-[#3A3A3A] text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
};

export default GenrePage;
