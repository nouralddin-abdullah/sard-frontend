import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow, EffectCards } from "swiper/modules";
import { TrendingUp, Clock, Eye, Star, Sparkles, Crown, BookOpen } from "lucide-react";
import Header from "../../components/common/Header";
import AddNovelToReadingListModal from "../../components/novel/AddNovelToReadingListModal";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import GenreShowcase from "../../components/home/GenreShowcase";
import GenreBadge from "../../components/common/GenreBadge";
import { useGetRankings } from "../../hooks/novel/useGetRankings";
import { useGetGenreRankings } from "../../hooks/novel/useGetGenreRankings";
import { useGetReadingHistory } from "../../hooks/novel/useGetReadingHistory";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { getRandomGenreSections, RANKING_TITLES } from "../../utils/genreSections";
import { formatViews } from "../../utils/format-views";
import { translateGenre } from "../../utils/translate-genre";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import screenshot8 from "../../assets/Screenshot_8.png";
import earningsRoute from "../../assets/earningsRoute.png";
import metwekpediaImage from "../../assets/metwekpedia.png";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-cards";

const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [selectedNovelForList, setSelectedNovelForList] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef(null);
  const dragRef = useRef({ startX: 0, isDragging: false });

  // Get current user and reading history
  const token = Cookies.get(TOKEN_KEY);
  const { data: currentUser } = useGetLoggedInUser();
  const { data: readingHistoryData } = useGetReadingHistory(1, 6); // Get first 6 novels

  // Fetch rankings from API - single call for 22 items (6 featured + 8 trending + 8 suggestions)
  const { data: trendingData, isLoading: trendingLoading } = useGetRankings("Trending", 22);
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useGetRankings("NewArrivals", 8);

  // Split trending data into sections
  const featuredNovels = useMemo(() => trendingData?.items?.slice(0, 6) || [], [trendingData]);
  const trendingNowNovels = useMemo(() => trendingData?.items?.slice(6, 14) || [], [trendingData]);
  const suggestedNovels = useMemo(() => trendingData?.items?.slice(14, 22) || [], [trendingData]);

  // Get random genre sections (cached for 15 minutes)
  const genreSections = useMemo(() => getRandomGenreSections(), []);

  // Fetch data for each genre section
  const genreSection1 = useGetGenreRankings(
    genreSections[0].genre.slug,
    genreSections[0].rankingType,
    10
  );
  const genreSection2 = useGetGenreRankings(
    genreSections[1].genre.slug,
    genreSections[1].rankingType,
    10
  );
  const genreSection3 = useGetGenreRankings(
    genreSections[2].genre.slug,
    genreSections[2].rankingType,
    10
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-spin featured novels every 5 seconds
  useEffect(() => {
    if (isPaused || featuredNovels.length === 0) return;
    
    autoPlayRef.current = setInterval(() => {
      setCurrentFeaturedIndex((prev) => (prev + 1) % featuredNovels.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isPaused, featuredNovels.length]);

  // Drag handlers for featured novel carousel
  const handleDragStart = useCallback((e) => {
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    dragRef.current = { startX: clientX, isDragging: true };
    setIsPaused(true);
  }, []);

  const handleDragEnd = useCallback((e) => {
    if (!dragRef.current.isDragging) return;
    
    const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const diff = dragRef.current.startX - clientX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left - next (RTL: previous visually)
        setCurrentFeaturedIndex((prev) => (prev + 1) % featuredNovels.length);
      } else {
        // Swiped right - previous (RTL: next visually)
        setCurrentFeaturedIndex((prev) => (prev - 1 + featuredNovels.length) % featuredNovels.length);
      }
    }

    dragRef.current.isDragging = false;
    // Resume auto-play after 3 seconds of no interaction
    setTimeout(() => setIsPaused(false), 3000);
  }, [featuredNovels.length]);

  // Set initial selected arrival when data loads
  useEffect(() => {
    if (newArrivalsData?.items?.length > 0 && !selectedArrival) {
      setSelectedArrival(newArrivalsData.items[0]);
    }
  }, [newArrivalsData, selectedArrival]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C]">
        <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C]">
        <Helmet>
          <title>سرد - منصة الروايات العربية | اكتشف وشارك قصصك المفضلة</title>
          <meta 
            name="description" 
            content="سرد هي أكبر منصة عربية لقراءة ومشاركة الروايات. اكتشف آلاف الروايات في مختلف الأنواع الأدبية: فانتازيا، رومانسية، أكشن، مغامرات، خيال علمي وأكثر. انضم لمجتمع القراء والكتاب العرب."
          />
          <meta name="keywords" content="روايات عربية, قصص, فانتازيا, رومانسية, أكشن, خيال علمي, مغامرات, كتابة, قراءة, روايات مجانية, سرد" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="سرد - منصة الروايات العربية" />
          <meta property="og:description" content="اكتشف آلاف الروايات العربية في مختلف الأنواع الأدبية. انضم لمجتمع القراء والكتاب العرب." />
          <meta property="og:url" content="https://www.sardnovels.com" />
          <meta property="og:locale" content="ar_AR" />
          <meta property="og:site_name" content="سرد" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="سرد - منصة الروايات العربية" />
          <meta name="twitter:description" content="اكتشف آلاف الروايات العربية في مختلف الأنواع الأدبية" />
          
          {/* Canonical URL */}
          <link rel="canonical" href="https://www.sardnovels.com/home" />
          
          {/* Structured Data - Organization & Website */}
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "سرد",
              "description": "منصة الروايات العربية - اكتشف وشارك قصصك المفضلة",
              "url": "https://www.sardnovels.com",
              "inLanguage": "ar",
              "publisher": {
                "@type": "Organization",
                "name": "سرد",
                "url": "https://www.sardnovels.com",
                "logo": {
                  "@type": "ImageObject",
                  "url": "https://www.sardnovels.com/logo.png"
                }
              },
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.sardnovels.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })}
          </script>
        </Helmet>
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
          {/* This Week's Featured Read & More to Discover */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Section: Featured Novel */}
              <div className="lg:col-span-7">
                <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold mb-6 px-4">رواية الأسبوع المميزة</h2>
                
                {trendingLoading || featuredNovels.length === 0 ? (
                  <div className="bg-[#2C2C2C] rounded-2xl p-6 md:p-8 border border-gray-700 shadow-lg h-64 flex items-center justify-center">
                    <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
                  </div>
                ) : (
                  <div 
                    className="bg-[#2C2C2C] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-stretch gap-8 border border-gray-700 shadow-lg relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
                    onMouseDown={handleDragStart}
                    onMouseUp={handleDragEnd}
                    onMouseLeave={(e) => { if (dragRef.current.isDragging) handleDragEnd(e); }}
                    onTouchStart={handleDragStart}
                    onTouchEnd={handleDragEnd}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseOut={(e) => { if (!dragRef.current.isDragging && !e.currentTarget.contains(e.relatedTarget)) setIsPaused(false); }}
                  >
                    {/* Blurred Background Image */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-50 blur-lg scale-110"
                      style={{ backgroundImage: `url("${featuredNovels[currentFeaturedIndex]?.coverImageUrl}")` }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-8 w-full h-[220px]">
                      <Link to={`/novel/${featuredNovels[currentFeaturedIndex]?.slug}`} className="w-32 md:w-40 flex-shrink-0 h-full">
                        <img 
                          src={featuredNovels[currentFeaturedIndex]?.coverImageUrl}
                          alt={featuredNovels[currentFeaturedIndex]?.title}
                          className="w-full h-full object-cover rounded-xl shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer"
                        />
                      </Link>
                      
                      <div className="text-white flex flex-col flex-1 h-full overflow-hidden">
                        <div className="flex-1 overflow-hidden">
                          <Link to={`/novel/${featuredNovels[currentFeaturedIndex]?.slug}`}>
                            <h3 className="text-3xl font-bold mb-4 noto-sans-arabic-extrabold hover:text-[#4A9EFF] transition-colors cursor-pointer line-clamp-2 h-[4.5rem]">
                              {featuredNovels[currentFeaturedIndex]?.title}
                            </h3>
                          </Link>
                          <p className="text-gray-300 leading-relaxed noto-sans-arabic-regular line-clamp-3 h-[4.5rem] overflow-hidden">
                            {featuredNovels[currentFeaturedIndex]?.summary}
                          </p>
                        </div>
                        
                        {/* Navigation Dots */}
                        <div className="flex items-center gap-2 mt-4">
                          {featuredNovels.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentFeaturedIndex(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index === currentFeaturedIndex 
                                  ? 'bg-white opacity-100' 
                                  : 'bg-white opacity-50 hover:opacity-75'
                              }`}
                              aria-label={`اذهب إلى الرواية ${index + 1}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Section: Meet Sard */}
              <div className="lg:col-span-5">
                <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold mb-6 px-4">تعرف على سرد</h2>
                <div className="space-y-4">
                  <Link 
                    to="/earnings"
                    className="block hover:bg-[#2C2C2C]/50 p-1 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                      <div className="flex-1 min-w-0 pl-4">
                        <h4 className="font-bold text-white noto-sans-arabic-bold">نظام الأرباح للكتّاب</h4>
                        <p className="text-sm text-gray-400 noto-sans-arabic-regular mt-1">حوّل كلماتك إلى مصدر دخل على سرد</p>
                      </div>
                      <img 
                        alt="نظام الأرباح" 
                        className="w-24 h-16 object-cover rounded flex-shrink-0" 
                        src={earningsRoute}
                      />
                    </div>
                  </Link>

                  <Link 
                    to="/authorsbenefits"
                    className="block hover:bg-[#2C2C2C]/50 p-1 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                      <div className="flex-1 min-w-0 pl-4">
                        <h4 className="font-bold text-white noto-sans-arabic-bold">مميزات الكتّاب في سرد</h4>
                        <p className="text-sm text-gray-400 noto-sans-arabic-regular mt-1">لماذا يجب أن تبدأ رحلة الكتابة هنا في سرد؟</p>
                      </div>
                      <img 
                        alt="مميزات الكتّاب" 
                        className="w-24 h-16 object-cover rounded flex-shrink-0" 
                        src={screenshot8}
                      />
                    </div>
                  </Link>

                  <Link 
                    to="/metwekpeida"
                    className="block hover:bg-[#2C2C2C]/50 p-1 rounded-lg transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 pl-4">
                        <h4 className="font-bold text-white noto-sans-arabic-bold">موسوعة ويكبيديا</h4>
                        <p className="text-sm text-gray-400 noto-sans-arabic-regular mt-1">ابدع موسوعة روايتك وأحيِ عالمك الخاص</p>
                      </div>
                      <img 
                        alt="موسوعة ويكبيديا" 
                        className="w-24 h-16 object-cover rounded flex-shrink-0" 
                        src={metwekpediaImage}
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Trending Now - Grid Cards */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">الرائج الآن</h2>
                <p className="text-gray-400 noto-sans-arabic-regular text-sm">الروايات الأكثر شعبية هذا الأسبوع</p>
              </div>
            </div>

            {trendingLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-items-center">
                {trendingNowNovels.map((novel) => (
                  <Link
                    key={novel.id}
                    to={`/novel/${novel.slug}`}
                    className="group w-full max-w-[160px]"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={novel.coverImageUrl}
                        alt={novel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Novel Title */}
                    <h3 className="text-white text-sm noto-sans-arabic-bold line-clamp-2 mb-2 text-center">
                      {novel.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* We Also Suggest - Shows remaining trending novels (15-22) */}
          {suggestedNovels.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">نقترح عليك أيضاً</h2>
                  <p className="text-gray-400 noto-sans-arabic-regular text-sm">المزيد من الروايات الرائجة</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-items-center">
                {suggestedNovels.map((novel) => (
                  <Link
                    key={novel.id}
                    to={`/novel/${novel.slug}`}
                    className="group w-full max-w-[160px]"
                  >
                    {/* Cover Image */}
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 shadow-lg transition-transform duration-300 group-hover:scale-105">
                      <img
                        src={novel.coverImageUrl}
                        alt={novel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Novel Title */}
                    <h3 className="text-white text-sm noto-sans-arabic-bold line-clamp-2 mb-2 text-center">
                      {novel.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* New Arrivals */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">وصل حديثاً</h2>
                <p className="text-gray-400 noto-sans-arabic-regular text-sm">أحدث الروايات المضافة للمنصة</p>
              </div>
            </div>

            {newArrivalsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
              </div>
            ) : newArrivalsData?.items?.length > 0 ? (
              <>
                {/* Horizontal Novel Covers Carousel */}
                <div className="mb-8 relative" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
                  <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-[#4A9EFF] scrollbar-track-gray-800 md:justify-center px-4 md:px-0" style={{ paddingTop: "5px", paddingBottom: "10px" }}>
                    {newArrivalsData.items.map((novel) => (
                      <button
                        key={novel.id}
                        onClick={() => setSelectedArrival(novel)}
                        className={`flex-shrink-0 relative rounded-2xl overflow-hidden transition-all duration-300 ${
                          selectedArrival?.id === novel.id
                            ? "ring-1 ring-[#4A9EFF] scale-105"
                            : "hover:scale-105 hover:ring-1 hover:ring-gray-600"
                        }`}
                        style={{ width: "120px", height: "180px" }}
                      >
                        <img
                          src={novel.coverImageUrl}
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                        {selectedArrival?.id === novel.id && (
                          <div className="absolute inset-0 border border-[#4A9EFF]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Novel Details */}
                {selectedArrival && (
                  <div className="bg-[#2C2C2C] rounded-2xl overflow-hidden border border-gray-700">
                    <div className="flex flex-col md:flex-row gap-6 p-6">
                      {/* Large Cover Image */}
                      <div className="flex-shrink-0 mx-auto md:mx-0">
                        <div className="w-48 h-72 rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl">
                          <img
                            src={selectedArrival.coverImageUrl}
                            alt={selectedArrival.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Novel Info */}
                      <div className="flex-1 space-y-4">
                        <div key={selectedArrival.id} className="animate-fadeIn">
                          <h3 className="text-3xl font-bold text-white noto-sans-arabic-extrabold mb-2">
                            {selectedArrival.title}
                          </h3>
                          {selectedArrival.genresList?.[0] && (
                            <p className="text-[#4A9EFF] noto-sans-arabic-medium text-lg">
                              {translateGenre(selectedArrival.genresList[0].name)}
                            </p>
                          )}
                        </div>

                        <p key={`${selectedArrival.id}-summary`} className="text-gray-300 noto-sans-arabic-regular text-base leading-relaxed animate-fadeIn whitespace-pre-line">
                          {selectedArrival.summary && selectedArrival.summary.length > 400 
                            ? `${selectedArrival.summary.substring(0, 400)}...` 
                            : selectedArrival.summary}
                        </p>

                        <div key={`${selectedArrival.id}-meta`} className="flex items-center gap-6 pt-4 border-t border-gray-700 animate-fadeIn">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-5 h-5 text-[#4A9EFF]" />
                            <span className="text-sm noto-sans-arabic-regular">{selectedArrival.totalViews} مشاهدة</span>
                          </div>
                          {selectedArrival.totalAverageScore > 0 && (
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              <span className="text-white font-bold">{selectedArrival.totalAverageScore.toFixed(1)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-4 pt-4">
                          <Link
                            to={`/novel/${selectedArrival.slug}`}
                            className="flex-1 px-6 py-3 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold text-center hover:bg-[#3A8EEF] hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                          >
                            اقرأ الآن
                          </Link>
                          <button 
                            onClick={() => {
                              if (!currentUser) {
                                setIsAuthModalOpen(true);
                                setAuthModalAction("لإضافة الرواية لقائمة القراءة");
                              } else {
                                setSelectedNovelForList({
                                  novelId: selectedArrival.id,
                                  novelTitle: selectedArrival.title
                                });
                                setIsAddToListModalOpen(true);
                              }
                            }}
                            className="px-6 py-3 bg-[#2C2C2C] border-2 border-[#4A9EFF] text-[#4A9EFF] rounded-lg noto-sans-arabic-bold hover:bg-[#4A9EFF] hover:text-white transition-all duration-300"
                          >
                            أضف لقائمة القراءة +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </section>

          {/* Continue Reading */}
          {token && currentUser && readingHistoryData?.items && readingHistoryData.items.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">تابع القراءة</h2>
                  <p className="text-gray-400 noto-sans-arabic-regular text-sm">استكمل رحلتك من حيث توقفت</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {readingHistoryData.items.slice(0, 3).map((novel) => (
                  <Link key={novel.novelId} to={`/novel/${novel.slug}/chapter/${novel.lastReadChapterId}`}>
                    <div className="group relative bg-[#2C2C2C] rounded-2xl overflow-hidden border border-gray-700 hover:border-[#4A9EFF] transition-all duration-300 shadow-lg hover:shadow-blue-500/20">
                      <div className="flex gap-4 p-4">
                        <div className="w-32 h-44 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700/50">
                          <img
                            src={novel.coverImageUrl}
                            alt={novel.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <h3 className="text-xl font-bold text-white noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors line-clamp-2">
                            {novel.title}
                          </h3>
                          <p className="text-gray-400 noto-sans-arabic-regular text-sm">
                            الفصل {novel.lastReadChapterNumber} من {novel.totalChapters}
                          </p>
                          
                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400 noto-sans-arabic-regular">
                              <span>التقدم</span>
                              <span>{Math.round(novel.progressPercentage)}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#4A9EFF] rounded-full transition-all duration-500"
                                style={{ width: `${novel.progressPercentage}%` }}
                              />
                            </div>
                          </div>

                          <button className="mt-4 px-4 py-2 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-bold text-sm hover:bg-[#3A8EEF] hover:shadow-lg transition-all duration-300">
                            متابعة القراءة
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Dynamic Genre Sections */}
          {[genreSection1, genreSection2, genreSection3]
            .map((section, index) => ({ section, index }))
            .filter(({ section }) => !section.isLoading && !section.error && section.data?.items && section.data.items.length > 0)
            .map(({ section, index }) => {
              const genreInfo = genreSections[index];
              const rankingInfo = RANKING_TITLES[genreInfo.rankingType];
              
              // Icon component mapping
              const IconComponent = 
                rankingInfo.icon === "Sparkles" ? Sparkles :
                rankingInfo.icon === "TrendingUp" ? TrendingUp :
                Star;

              return (
                <section key={index}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">
                        {rankingInfo.title} {translateGenre(genreInfo.genre.name)}
                      </h2>
                      <p className="text-gray-400 noto-sans-arabic-regular text-sm">
                        {rankingInfo.subtitle.replace("{genre}", genreInfo.genre.description)}
                      </p>
                    </div>
                  </div>

                  {section.data?.items && section.data.items.length > 0 && (
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={12}
                    slidesPerView={'auto'}
                    navigation={false}
                    pagination={{ clickable: true }}
                    autoplay={genreInfo.rankingType === "trending" ? {
                      delay: 4000,
                      disableOnInteraction: false,
                    } : false}
                    className="category-swiper"
                    style={{ paddingBottom: "50px", paddingTop: "10px", overflowY: "visible", overflowX: "hidden" }}
                  >
                    {section.data.items.map((novel) => (
                      <SwiperSlide key={novel.id} style={{ width: '120px', height: 'auto' }}>
                        <Link to={`/novel/${novel.slug}`} className="block">
                          <div className="group relative">
                            {/* Cover Image with 3:4 aspect ratio like Trending Now */}
                            <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 shadow-lg transition-transform duration-300 group-hover:scale-105">
                              <img
                                src={novel.coverImageUrl}
                                alt={novel.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              
                              {/* Rank Badge */}
                              <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-[#4A9EFF] backdrop-blur-sm rounded-md">
                                <span className="text-[10px] font-bold text-white noto-sans-arabic-bold">
                                  #{section.data.items.indexOf(novel) + 1}
                                </span>
                              </div>
                            </div>

                            {/* Novel Title */}
                            <h3 className="text-white text-sm noto-sans-arabic-bold line-clamp-2 text-center">
                              {novel.title}
                            </h3>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  )}
                </section>
              );
            })}
        </main>

        {/* Genre Showcase Section */}
        <GenreShowcase />

        {/* Add to Reading List Modal */}
        {selectedNovelForList && (
          <AddNovelToReadingListModal
            isOpen={isAddToListModalOpen}
            onClose={() => {
              setIsAddToListModalOpen(false);
              setSelectedNovelForList(null);
            }}
            novelId={selectedNovelForList.novelId}
            novelTitle={selectedNovelForList.novelTitle}
          />
        )}

        {/* Auth Required Modal */}
        <AuthRequiredModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          action={authModalAction}
        />
      </div>
    );
  };

export default HomePage;
