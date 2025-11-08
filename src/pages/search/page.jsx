import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, SlidersHorizontal, X, Eye, Star } from "lucide-react";
import ProtectedRoute from "../../components/auth/protected-route";
import Header from "../../components/common/Header";
import GenreBadge from "../../components/common/GenreBadge";
import FollowToggle from "../../components/common/FollowToggle";
import { useSearchNovels } from "../../hooks/search/useSearchNovels";
import { useSearchUsers } from "../../hooks/search/useSearchUsers";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { translateGenre } from "../../utils/translate-genre";

const SORT_OPTIONS = [
  { value: "Relevance", label: "الأكثر صلة" },
  { value: "Newest", label: "الأحدث" },
  { value: "LastUpdated", label: "آخر تحديث" },
  { value: "MostPopular", label: "الأكثر شعبية" },
  { value: "HighestRated", label: "الأعلى تقييماً" },
  { value: "MostReviewed", label: "الأكثر مراجعات" },
];

const CHAPTER_RANGES = [
  { value: "Any", label: "الكل" },
  { value: "Range_1_10", label: "1 - 10 فصول" },
  { value: "Range_10_20", label: "10 - 20 فصل" },
  { value: "Range_20_50", label: "20 - 50 فصل" },
  { value: "Range_50_Plus", label: "50 فصل فأكثر" },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState("novels"); // "novels" or "users"

  // Get query from URL
  const queryFromUrl = searchParams.get("q") || "";

  // Search state
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedChapterRanges, setSelectedChapterRanges] = useState([]);
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("Relevance");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch genres list
  const { data: genresList = [] } = useGetGenresList();

  // Search novels query
  const {
    data: searchResults,
    isLoading: isLoadingNovels,
    error: novelsError,
  } = useSearchNovels({
    query: searchQuery,
    genres: selectedGenres,
    status: showCompletedOnly ? "Completed" : "",
    chapterRanges: selectedChapterRanges,
    sortBy: sortBy,
    pageNumber: currentPage,
    pageSize: 20,
  });

  // Search users query
  const {
    data: usersResults,
    isLoading: isLoadingUsers,
    error: usersError,
  } = useSearchUsers({
    query: searchQuery,
    pageNumber: currentPage,
    pageSize: 20,
  });

  // Update search query when URL changes
  useEffect(() => {
    const newQuery = searchParams.get("q") || "";
    setSearchQuery(newQuery);
  }, [searchParams]);

  // Handle search submit
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  // Handle genre toggle
  const handleGenreToggle = (genreName) => {
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
    setCurrentPage(1);
  };

  // Handle chapter range toggle
  const handleChapterRangeToggle = (range) => {
    if (range === "Any") {
      setSelectedChapterRanges([]);
    } else {
      setSelectedChapterRanges((prev) =>
        prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
      );
    }
    setCurrentPage(1);
  };

  // Handle completed toggle
  const handleCompletedToggle = () => {
    setShowCompletedOnly((prev) => !prev);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if "Any" is selected (when no specific ranges are selected)
  const isAnySelected = selectedChapterRanges.length === 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1C1C1C]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Type Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              onClick={() => setSearchType("novels")}
              className={`flex-1 px-6 py-3 rounded-lg noto-sans-arabic-bold transition-colors ${
                searchType === "novels"
                  ? "bg-[#4A9EFF] text-white"
                  : "bg-[#2C2C2C] text-gray-400 hover:text-white hover:bg-[#3C3C3C]"
              }`}
            >
              الروايات
            </button>
            <button
              onClick={() => setSearchType("users")}
              className={`flex-1 px-6 py-3 rounded-lg noto-sans-arabic-bold transition-colors ${
                searchType === "users"
                  ? "bg-[#4A9EFF] text-white"
                  : "bg-[#2C2C2C] text-gray-400 hover:text-white hover:bg-[#3C3C3C]"
              }`}
            >
              المستخدمين
            </button>
          </div>

          {/* Filters Toggle Button (Mobile) - Only for novels */}
          {searchType === "novels" && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden w-full mb-6 px-4 py-3 bg-[#2C2C2C] text-white rounded-lg flex items-center justify-center gap-2 noto-sans-arabic-bold"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            </button>
          )}

          <div className="flex gap-6">
            {/* Filters Sidebar - Only for novels */}
            {searchType === "novels" && (
              <aside
                className={`${
                  showFilters ? "block" : "hidden"
                } md:block w-full md:w-64 flex-shrink-0 space-y-6`}
              >
              {/* Sort By */}
              <div className="bg-[#2C2C2C] rounded-lg p-4">
                <h3 className="text-white noto-sans-arabic-bold text-lg mb-4">ترتيب حسب</h3>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full bg-[#3C3C3C] text-white rounded-lg px-3 py-2 noto-sans-arabic-medium focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]"
                  dir="rtl"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chapter Count Filter */}
              <div className="bg-[#2C2C2C] rounded-lg p-4">
                <h3 className="text-white noto-sans-arabic-bold text-lg mb-4">عدد الفصول</h3>
                <div className="space-y-2">
                  {CHAPTER_RANGES.map((range) => {
                    const isSelected =
                      range.value === "Any" ? isAnySelected : selectedChapterRanges.includes(range.value);

                    return (
                      <label
                        key={range.value}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleChapterRangeToggle(range.value)}
                          className="w-4 h-4 rounded border-gray-600 text-[#4A9EFF] focus:ring-[#4A9EFF]"
                        />
                        <span className="text-gray-300 noto-sans-arabic-medium text-sm">
                          {range.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div className="bg-[#2C2C2C] rounded-lg p-4">
                <h3 className="text-white noto-sans-arabic-bold text-lg mb-4">الحالة</h3>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompletedOnly}
                    onChange={handleCompletedToggle}
                    className="w-4 h-4 rounded border-gray-600 text-[#4A9EFF] focus:ring-[#4A9EFF]"
                  />
                  <span className="text-gray-300 noto-sans-arabic-medium text-sm">
                    روايات مكتملة فقط
                  </span>
                </label>
              </div>

              {/* Genre Filter */}
              <div className="bg-[#2C2C2C] rounded-lg p-4">
                <h3 className="text-white noto-sans-arabic-bold text-lg mb-4">التصنيفات</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {genresList.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGenres.includes(genre.name)}
                        onChange={() => handleGenreToggle(genre.name)}
                        className="w-4 h-4 rounded border-gray-600 text-[#4A9EFF] focus:ring-[#4A9EFF]"
                      />
                      <span className="text-gray-300 noto-sans-arabic-medium text-sm">
                        {translateGenre(genre.name)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedGenres.length > 0 ||
                selectedChapterRanges.length > 0 ||
                showCompletedOnly) && (
                <button
                  onClick={() => {
                    setSelectedGenres([]);
                    setSelectedChapterRanges([]);
                    setShowCompletedOnly(false);
                    setSortBy("Relevance");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  مسح الفلاتر
                </button>
              )}
            </aside>
            )}

            {/* Search Results */}
            <div className="flex-1">
              {/* Results Header */}
              {searchQuery && (
                <div className="mb-6">
                  <h1 className="text-white noto-sans-arabic-bold text-2xl mb-2">
                    نتائج البحث عن: "{searchQuery}"
                  </h1>
                  {searchType === "novels" && searchResults && (
                    <p className="text-gray-400 noto-sans-arabic-medium">
                      {searchResults.totalCount} رواية
                    </p>
                  )}
                  {searchType === "users" && usersResults && (
                    <p className="text-gray-400 noto-sans-arabic-medium">
                      {usersResults.totalItemsCount} مستخدم
                    </p>
                  )}
                </div>
              )}

              {/* Novels Results */}
              {searchType === "novels" && (
                <>
                  {/* Loading State */}
                  {isLoadingNovels && (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-xl noto-sans-arabic-medium">جاري البحث...</div>
                    </div>
                  )}

                  {/* Error State */}
                  {novelsError && (
                    <div className="text-center text-red-500 noto-sans-arabic-medium">
                      حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.
                    </div>
                  )}

                  {/* Results Grid */}
                  {!isLoadingNovels && !novelsError && searchResults?.items && (
                <>
                  {searchResults.items.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {searchResults.items.map((novel) => (
                          <Link
                            key={novel.id}
                            to={`/novel/${novel.slug}`}
                            className="group block"
                          >
                            <div className="bg-[#2C2C2C] rounded-xl overflow-hidden border border-gray-700 hover:border-[#4A9EFF] transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                              <div className="flex gap-4 p-4">
                                {/* Cover Image */}
                                <div className="flex-shrink-0 w-32 h-44 rounded-lg overflow-hidden border border-gray-700 shadow-lg">
                                  <img
                                    src={novel.coverImageUrl}
                                    alt={novel.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                </div>

                                {/* Novel Info */}
                                <div className="flex-1 flex flex-col min-w-0">
                                  {/* Title */}
                                  <h3 className="text-white text-xl noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors line-clamp-2 mb-2">
                                    {novel.title}
                                  </h3>

                                  {/* Status and Genres */}
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {/* Status Badge - First */}
                                    {novel.status && (
                                      <div
                                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white noto-sans-arabic-bold ${
                                          novel.status === "Completed"
                                            ? "bg-blue-500/90"
                                            : "bg-green-500/90"
                                        }`}
                                      >
                                        {novel.status === "Completed" ? "مكتملة" : "مستمرة"}
                                      </div>
                                    )}
                                    {/* Genres */}
                                    {novel.genres && novel.genres.length > 0 && (
                                      <>
                                        {novel.genres.slice(0, 3).map((genreName) => {
                                          const genre = genresList.find((g) => g.name === genreName);
                                          return genre ? (
                                            <GenreBadge key={genre.id} genre={genre} size="sm" />
                                          ) : null;
                                        })}
                                      </>
                                    )}
                                  </div>

                                  {/* Description */}
                                  {novel.summary && (
                                    <p className="text-gray-400 noto-sans-arabic-regular text-sm line-clamp-2 mb-3">
                                      {novel.summary}
                                    </p>
                                  )}

                                  {/* Stats */}
                                  <div className="flex items-center gap-4 mt-auto">
                                    {novel.totalAverageScore > 0 && (
                                      <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-white font-bold noto-sans-arabic-medium">
                                          {novel.totalAverageScore.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                    {novel.totalViews > 0 && (
                                      <div className="flex items-center gap-2">
                                        <Eye className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                                          {novel.totalViews} مشاهدة
                                        </span>
                                      </div>
                                    )}
                                    {novel.chapterCount > 0 && (
                                      <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                                        {novel.chapterCount} فصل
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* Pagination */}
                      {searchResults.totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                          {currentPage > 1 && (
                            <button
                              onClick={() => handlePageChange(currentPage - 1)}
                              className="px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors"
                            >
                              السابق
                            </button>
                          )}

                          {[...Array(searchResults.totalPages)].map((_, index) => {
                            const page = index + 1;
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === searchResults.totalPages ||
                              (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`px-4 py-2 rounded-lg noto-sans-arabic-bold transition-colors ${
                                    page === currentPage
                                      ? "bg-[#4A9EFF] text-white"
                                      : "bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span key={page} className="px-2 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}

                          {currentPage < searchResults.totalPages && (
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              className="px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors"
                            >
                              التالي
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 noto-sans-arabic-bold text-xl mb-2">
                        لا توجد نتائج
                      </div>
                      <p className="text-gray-500 noto-sans-arabic-medium">
                        جرب تغيير كلمات البحث أو الفلاتر
                      </p>
                    </div>
                  )}
                </>
              )}
              </>
              )}

              {/* Users Results */}
              {searchType === "users" && (
                <>
                  {/* Loading State */}
                  {isLoadingUsers && (
                    <div className="flex justify-center items-center h-64">
                      <div className="text-white text-xl noto-sans-arabic-medium">جاري البحث...</div>
                    </div>
                  )}

                  {/* Error State */}
                  {usersError && (
                    <div className="text-center text-red-500 noto-sans-arabic-medium">
                      حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.
                    </div>
                  )}

                  {/* Users Results */}
                  {!isLoadingUsers && !usersError && usersResults?.items && (
                    <>
                      {usersResults.items.length > 0 ? (
                        <>
                          <div className="space-y-4">
                            {usersResults.items.map((user) => (
                              <div
                                key={user.id}
                                className="bg-[#2C2C2C] rounded-xl border border-gray-700 hover:border-[#4A9EFF] transition-all duration-300 shadow-lg hover:shadow-blue-500/20"
                              >
                                <div className="flex gap-4 p-4 items-center">
                                  {/* Profile Photo */}
                                  <Link
                                    to={`/profile/${user.userName}`}
                                    className="flex-shrink-0"
                                  >
                                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 hover:border-[#4A9EFF] transition-colors">
                                      <img
                                        src={user.profilePhoto || "https://via.placeholder.com/150"}
                                        alt={user.displayName}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </Link>

                                  {/* User Info */}
                                  <Link
                                    to={`/profile/${user.userName}`}
                                    className="flex-1 flex flex-col justify-center min-w-0"
                                  >
                                    {/* Display Name */}
                                    <h3 className="text-white text-xl noto-sans-arabic-bold hover:text-[#4A9EFF] transition-colors mb-1">
                                      {user.displayName}
                                    </h3>

                                    {/* Username */}
                                    <p className="text-gray-400 noto-sans-arabic-medium text-sm mb-3">
                                      @{user.userName}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 flex-wrap">
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-bold noto-sans-arabic-medium">
                                          {user.followersCount}
                                        </span>
                                        <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                                          متابع
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-bold noto-sans-arabic-medium">
                                          {user.followingCount}
                                        </span>
                                        <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                                          يتابع
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-white font-bold noto-sans-arabic-medium">
                                          {user.novelsCount}
                                        </span>
                                        <span className="text-gray-400 text-sm noto-sans-arabic-medium">
                                          رواية
                                        </span>
                                      </div>
                                    </div>
                                  </Link>

                                  {/* Follow Button */}
                                  <div className="flex-shrink-0">
                                    <FollowToggle
                                      isFollowing={user.isFollowing || false}
                                      userId={user.id}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {usersResults.totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-2">
                              {currentPage > 1 && (
                                <button
                                  onClick={() => handlePageChange(currentPage - 1)}
                                  className="px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors"
                                >
                                  السابق
                                </button>
                              )}

                              {[...Array(usersResults.totalPages)].map((_, index) => {
                                const page = index + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                  page === 1 ||
                                  page === usersResults.totalPages ||
                                  (page >= currentPage - 1 && page <= currentPage + 1)
                                ) {
                                  return (
                                    <button
                                      key={page}
                                      onClick={() => handlePageChange(page)}
                                      className={`px-4 py-2 rounded-lg noto-sans-arabic-bold transition-colors ${
                                        page === currentPage
                                          ? "bg-[#4A9EFF] text-white"
                                          : "bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]"
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  );
                                } else if (
                                  page === currentPage - 2 ||
                                  page === currentPage + 2
                                ) {
                                  return (
                                    <span key={page} className="px-2 text-gray-500">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              })}

                              {currentPage < usersResults.totalPages && (
                                <button
                                  onClick={() => handlePageChange(currentPage + 1)}
                                  className="px-4 py-2 bg-[#2C2C2C] text-white rounded-lg noto-sans-arabic-bold hover:bg-[#3C3C3C] transition-colors"
                                >
                                  التالي
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 noto-sans-arabic-bold text-xl mb-2">
                            لا توجد نتائج
                          </div>
                          <p className="text-gray-500 noto-sans-arabic-medium">
                            جرب تغيير كلمات البحث
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default SearchPage;
