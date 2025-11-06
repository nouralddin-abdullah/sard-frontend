import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow, EffectCards } from "swiper/modules";
import { TrendingUp, Clock, Eye, Star, Sparkles, Crown, BookOpen } from "lucide-react";
import ProtectedRoute from "../../components/auth/protected-route";
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

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "swiper/css/effect-cards";

// Placeholder data - will be replaced with API calls
const placeholderData = {
  topGreatestNovels: [
    {
      id: "1",
      title: "أسطورة السيف الإلهي",
      slug: "divine-sword-legend",
      author: "محمد أحمد",
      authorSlug: "mohamed-ahmed",
      summary: "رحلة ملحمية في عالم الفنون القتالية حيث يسعى البطل لإتقان فن السيف الإلهي",
      coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
      genre: "أكشن",
      rating: 4.9,
      views: "2.5M",
      chapters: 450,
      status: "مستمرة",
    },
    {
      id: "2",
      title: "إمبراطور العوالم التسعة",
      slug: "nine-realms-emperor",
      author: "سارة علي",
      authorSlug: "sara-ali",
      summary: "في عالم تحكمه قوانين الزراعة، يصعد بطلنا من الحضيض ليصبح إمبراطور العوالم",
      coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
      genre: "فانتازيا",
      rating: 4.8,
      views: "3.1M",
      chapters: 520,
      status: "مستمرة",
    },
    {
      id: "3",
      title: "سيد الظلال",
      slug: "shadow-master",
      author: "خالد حسن",
      authorSlug: "khaled-hassan",
      summary: "قصة غامضة عن سيد يتحكم في ظلال العالم ويحميه من الشر الخفي",
      coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=400&h=600&fit=crop",
      genre: "غموض",
      rating: 4.7,
      views: "1.8M",
      chapters: 380,
      status: "مكتملة",
    },
    {
      id: "4",
      title: "نجم السماء الأزرق",
      slug: "blue-sky-star",
      author: "فاطمة محمود",
      authorSlug: "fatima-mahmoud",
      summary: "في عالم السحر والخيال، تبدأ رحلة فتاة لتصبح أقوى ساحرة في التاريخ",
      coverImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop",
      genre: "فانتازيا",
      rating: 4.6,
      views: "2.2M",
      chapters: 410,
      status: "مستمرة",
    },
    {
      id: "5",
      title: "حارس البوابة الأبدية",
      slug: "eternal-gate-guardian",
      author: "عمر يوسف",
      authorSlug: "omar-youssef",
      summary: "حارس وحيد يقف بين العالمين، يمنع قوى الشر من اختراق بوابة الأبدية",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=600&fit=crop",
      genre: "أكشن",
      rating: 4.9,
      views: "2.8M",
      chapters: 465,
      status: "مستمرة",
    },
  ],
  trendingNow: [
    {
      id: "6",
      title: "عودة الإمبراطور الخالد",
      slug: "immortal-emperor-return",
      summary: "بعد ألف عام من الموت، يعود الإمبراطور الخالد ليستعيد عرشه",
      coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop",
      genre: "فانتازيا",
      views: "150K",
      status: "مستمرة",
    },
    {
      id: "7",
      title: "أسطورة التنين الفضي",
      slug: "silver-dragon-legend",
      summary: "قصة فتى يكتشف أنه آخر من يحمل دم التنانين الفضية",
      coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop",
      genre: "فانتازيا",
      views: "98K",
      status: "مكتملة",
    },
    {
      id: "8",
      title: "سيد الوقت",
      slug: "time-master",
      summary: "مغامرة عبر الزمن لإنقاذ العالم من كارثة مستقبلية",
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
      genre: "خيال علمي",
      views: "120K",
      status: "مستمرة",
    },
    {
      id: "9",
      title: "الساحر المظلم",
      slug: "dark-wizard",
      summary: "قصة ساحر يستخدم السحر المحرم لحماية من يحب",
      coverImage: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&h=400&fit=crop",
      genre: "فانتازيا",
      views: "85K",
      status: "مستمرة",
    },
    {
      id: "10",
      title: "ملك الوحوش",
      slug: "beast-king",
      summary: "فتى يمتلك قدرة فريدة على التواصل مع الوحوش وترويضها",
      coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=400&fit=crop",
      genre: "فانتازيا",
      views: "92K",
      status: "مكتملة",
    },
  ],
  continueReading: [
    {
      id: "1",
      title: "أسطورة السيف الإلهي",
      slug: "divine-sword-legend",
      lastChapter: 125,
      totalChapters: 450,
      progress: 28,
      coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop",
    },
    {
      id: "3",
      title: "سيد الظلال",
      slug: "shadow-master",
      lastChapter: 312,
      totalChapters: 380,
      progress: 82,
      coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=300&h=400&fit=crop",
    },
  ],
  fantasyCategory: [
    {
      id: "11",
      title: "عالم السحر المفقود",
      slug: "lost-magic-world",
      summary: "اكتشاف عالم سحري قديم مليء بالأسرار والكنوز",
      coverImage: "https://images.unsplash.com/photo-1528459584353-5297db1a9c01?w=300&h=400&fit=crop",
      chapters: 85,
    },
    {
      id: "12",
      title: "أكاديمية السحرة",
      slug: "wizard-academy",
      summary: "حياة طالب جديد في أعرق أكاديمية للسحر في العالم",
      coverImage: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=300&h=400&fit=crop",
      chapters: 120,
    },
    {
      id: "13",
      title: "حرب العناصر",
      slug: "elemental-war",
      summary: "صراع ملحمي بين أسياد العناصر الأربعة",
      coverImage: "https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=300&h=400&fit=crop",
      chapters: 95,
    },
  ],
  actionCategory: [
    {
      id: "14",
      title: "قبضة التنين",
      slug: "dragon-fist",
      summary: "فنون قتالية أسطورية ومعارك ملحمية لا تنسى",
      coverImage: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=300&h=400&fit=crop",
      views: "450K",
    },
    {
      id: "15",
      title: "محارب النار",
      slug: "fire-warrior",
      summary: "رحلة محارب يسعى للانتقام من قتلة عائلته",
      coverImage: "https://images.unsplash.com/photo-1502899576159-f224dc2349fa?w=300&h=400&fit=crop",
      views: "380K",
    },
    {
      id: "16",
      title: "سيف العدالة",
      slug: "justice-sword",
      summary: "بطل يحمل سيفاً أسطورياً يقاتل من أجل العدالة",
      coverImage: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=300&h=400&fit=crop",
      views: "520K",
    },
  ],
  newArrivals: [
    {
      id: "21",
      title: "طريق الأبطال",
      slug: "heroes-path",
      summary: "رحلة شاب عادي ليصبح أعظم بطل عرفه التاريخ. في عالم مليء بالمخاطر والتحديات، يجد نفسه في مواجهة قوى خارقة وأعداء أقوياء.",
      coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=450&fit=crop",
      genre: "Teen",
      chapters: 45,
      author: "أحمد صالح",
    },
    {
      id: "22",
      title: "الساحرة المفقودة",
      slug: "lost-sorceress",
      summary: "ساحرة قوية تفقد ذاكرتها وتبدأ رحلة لاستعادة قواها وماضيها. مغامرة سحرية مليئة بالألغاز والأسرار في عالم الفانتازيا.",
      coverImage: "https://images.unsplash.com/photo-1511593358241-7eea1f3c84e5?w=300&h=450&fit=crop",
      genre: "Romance",
      chapters: 67,
      author: "ليلى محمود",
    },
    {
      id: "23",
      title: "حارس المدينة الليلي",
      slug: "night-city-guardian",
      summary: "بطل خارق يحمي المدينة من الجريمة والشر في ظلام الليل. قصة مشوقة عن التضحية والشجاعة والعدالة.",
      coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=450&fit=crop",
      genre: "Action",
      chapters: 89,
      author: "كريم عبدالله",
    },
    {
      id: "24",
      title: "سر القمر الدموي",
      slug: "blood-moon-secret",
      summary: "لغز غامض يتكشف تحت ضوء القمر الدموي. أحداث مثيرة ومخيفة تربط بين الماضي والحاضر في قصة تشويقية مذهلة.",
      coverImage: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=300&h=450&fit=crop",
      genre: "Mystery",
      chapters: 52,
      author: "سارة حسن",
    },
    {
      id: "25",
      title: "عاشق تحت المطر",
      slug: "lover-in-rain",
      summary: "قصة حب رومانسية تبدأ بلقاء صدفة تحت المطر. مشاعر جياشة وأحداث مؤثرة في رواية رومانسية ساحرة.",
      coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop",
      genre: "Romance",
      chapters: 73,
      author: "نور الدين",
    },
    {
      id: "26",
      title: "ملحمة الفارس الأسود",
      slug: "black-knight-saga",
      summary: "فارس غامض يظهر لإنقاذ المملكة من الدمار. معارك ملحمية ومغامرات شيقة في عالم فانتازيا ضخم.",
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=450&fit=crop",
      genre: "Fantasy",
      chapters: 98,
      author: "خالد يوسف",
    },
    {
      id: "27",
      title: "أكاديمية النخبة",
      slug: "elite-academy",
      summary: "حياة طلاب في أرقى أكاديمية للموهوبين. منافسات شرسة وصداقات قوية ودراما مثيرة في بيئة تعليمية استثنائية.",
      coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop",
      genre: "School Life",
      chapters: 61,
      author: "فاطمة علي",
    },
    {
      id: "28",
      title: "صياد الشياطين",
      slug: "demon-hunter",
      summary: "صياد محترف يقاتل الشياطين والمخلوقات الخارقة. أكشن مكثف ومعارك دموية في عالم مظلم وخطير.",
      coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&h=450&fit=crop",
      genre: "Action",
      chapters: 112,
      author: "عمر حسين",
    },
  ],
  mysteryCategory: [
    {
      id: "17",
      title: "لغز القصر المهجور",
      slug: "abandoned-palace-mystery",
      summary: "أسرار مظلمة تكشف في قصر قديم مهجور",
      coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=400&fit=crop",
      views: "280K",
    },
    {
      id: "18",
      title: "المحقق الأسطوري",
      slug: "legendary-detective",
      summary: "محقق بقدرات خارقة يحل أصعب القضايا",
      coverImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=400&fit=crop",
      views: "310K",
    },
    {
      id: "19",
      title: "الشفرة السرية",
      slug: "secret-code",
      summary: "سباق مع الزمن لحل شفرة قديمة قبل فوات الأوان",
      coverImage: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&h=400&fit=crop",
      views: "265K",
    },
  ],
};

const HomePage = () => {
  const [mounted, setMounted] = useState(false);
  const [selectedArrival, setSelectedArrival] = useState(null);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [selectedNovelForList, setSelectedNovelForList] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("");

  // Get current user and reading history
  const token = Cookies.get(TOKEN_KEY);
  const { data: currentUser } = useGetLoggedInUser();
  const { data: readingHistoryData } = useGetReadingHistory(1, 6); // Get first 6 novels

  // Fetch rankings from API
  const { data: trendingData, isLoading: trendingLoading } = useGetRankings("Trending", 16);
  const { data: newArrivalsData, isLoading: newArrivalsLoading } = useGetRankings("NewArrivals", 8);

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

  // Set initial selected arrival when data loads
  useEffect(() => {
    if (newArrivalsData?.items?.length > 0 && !selectedArrival) {
      setSelectedArrival(newArrivalsData.items[0]);
    }
  }, [newArrivalsData, selectedArrival]);

  if (!mounted) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen bg-[#1C1C1C]">
          <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1C1C1C]">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
          {/* Top 10 Greatest Novels - Coverflow Effect */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-[#4A9EFF] rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white noto-sans-arabic-extrabold">أفضل 10 روايات</h2>
                <p className="text-gray-400 noto-sans-arabic-regular text-sm">الروايات الأكثر تقييماً على الإطلاق</p>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Pagination, EffectCoverflow]}
              effect="coverflow"
              centeredSlides={true}
              slidesPerView="auto"
              initialSlide={2}
              coverflowEffect={{
                rotate: 50,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: false,
              }}
              pagination={{ clickable: true }}
              className="top-novels-swiper"
              style={{
                paddingBottom: "60px",
                paddingTop: "20px",
              }}
            >
              {placeholderData.topGreatestNovels.map((novel) => (
                <SwiperSlide key={novel.id} className="!w-[280px] sm:!w-[320px] md:!w-[400px]">
                  <Link to={`/novel/${novel.slug}`} className="block">
                    <div className="group relative bg-[#2C2C2C] rounded-3xl overflow-hidden border border-gray-700 hover:border-[#4A9EFF] transition-all duration-500 shadow-2xl hover:shadow-blue-500/20 transform hover:scale-105 cursor-pointer">
                      <div className="aspect-[3/4] relative overflow-hidden rounded-t-3xl">
                        <img
                          src={novel.coverImage}
                          alt={novel.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1C1C] via-[#1C1C1C]/40 to-transparent opacity-90 rounded-t-3xl transition-transform duration-500 group-hover:scale-105" />
                        
                        {/* Rank Badge */}
                        <div className="absolute top-4 left-4 w-16 h-16 bg-[#4A9EFF] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50 border-2 border-blue-300/30">
                          <span className="text-2xl font-bold text-white noto-sans-arabic-extrabold">
                            {placeholderData.topGreatestNovels.indexOf(novel) + 1}
                          </span>
                        </div>

                        {/* Status Badge */}
                        <div className={`absolute top-4 right-4 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-semibold text-white noto-sans-arabic-bold ${
                          novel.status === "مستمرة" ? "bg-green-500/90" : "bg-blue-500/90"
                        }`}>
                          {novel.status}
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors line-clamp-2">
                            {novel.title}
                          </h3>
                          <span className="inline-block mt-2 px-3 py-1 bg-[#4A9EFF]/20 text-[#4A9EFF] rounded-full text-xs font-semibold noto-sans-arabic-bold">
                            {novel.genre}
                          </span>
                        </div>
                        
                        <p 
                          className="text-gray-400 noto-sans-arabic-medium hover:text-[#4A9EFF] transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/author/${novel.authorSlug}`;
                          }}
                        >
                          بواسطة: {novel.author}
                        </p>

                        <p className="text-gray-300 noto-sans-arabic-regular text-sm line-clamp-2 whitespace-pre-line">
                          {novel.summary && novel.summary.length > 100 
                            ? `${novel.summary.substring(0, 100)}...` 
                            : novel.summary}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            <span className="text-white font-bold">{novel.rating}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm noto-sans-arabic-regular">{novel.views}</span>
                          </div>
                          <div className="text-gray-400 text-sm noto-sans-arabic-regular">
                            {novel.chapters} فصل
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
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
                {trendingData?.items?.slice(0, 8).map((novel) => (
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

                    {/* Genres */}
                    {novel.genresList && novel.genresList.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {novel.genresList.slice(0, 2).map((genre) => (
                          <GenreBadge key={genre.id} genre={genre} size="xs" />
                        ))}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* We Also Suggest - Shows remaining trending novels (9-16) */}
          {trendingData?.items && trendingData.items.length > 8 && (
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
                {trendingData.items.slice(8, 16).map((novel) => (
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

                    {/* Genres */}
                    {novel.genresList && novel.genresList.length > 0 && (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {novel.genresList.slice(0, 2).map((genre) => (
                          <GenreBadge key={genre.id} genre={genre} size="xs" />
                        ))}
                      </div>
                    )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {readingHistoryData.items.slice(0, 6).map((novel) => (
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
      </div>

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
    </ProtectedRoute>
  );
};

export default HomePage;
