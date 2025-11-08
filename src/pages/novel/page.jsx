import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { useNovelDetails } from "../../hooks/novel/useNovelDetails";
import { useNovelChapters } from "../../hooks/novel/useNovelChapters";
import { useGetNovelReadingProgress } from "../../hooks/novel/useGetNovelReadingProgress";
import { formatDateShort } from "../../utils/date";
import { translateGenre } from "../../utils/translate-genre";
import { Plus, AlertTriangle, Share2, User, Calendar, Eye, BookOpen, Gift } from "lucide-react";
import CustomStar from "../../components/common/CustomStar";
import StarRating from "../../components/common/StarRating";
import PenIcon from "../../components/common/PenIcon";
import Header from "../../components/common/Header";
import Button from "../../components/ui/button";
import ReviewModal from "../../components/novel/ReviewModal";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import AddNovelToReadingListModal from "../../components/novel/AddNovelToReadingListModal";
import SendGiftModal from "../../components/novel/SendGiftModal";
import { useGetReviews } from "../../hooks/novel/useGetReviews";
import { useLikeReview } from "../../hooks/novel/useLikeReview";
import { useUnlikeReview } from "../../hooks/novel/useUnlikeReview";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";

const NovelPage = () => {
  const { t } = useTranslation();
  const { novelSlug } = useParams();

  const {
    novel,
    loading: novelLoading,
    error: novelError,
  } = useNovelDetails(novelSlug);
  const {
    chapters,
    loading: chaptersLoading,
    error: chaptersError,
  } = useNovelChapters(novel?.id);
  const { data: currentUser } = useGetLoggedInUser();
  
  // Get reading progress for this novel (only if user is logged in)
  const { data: readingProgress } = useGetNovelReadingProgress(novel?.id);

  const [selectedSubPage, setSelectedSubPage] = useState("chapters");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("لتنفيذ هذا الإجراء");
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  // Reviews pagination and sorting
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSorting, setReviewsSorting] = useState("likes"); // "likes" or "newest"
  const reviewsPageSize = 10;

  // Track which spoiler reviews are revealed
  const [revealedSpoilers, setRevealedSpoilers] = useState({});

  // Reset revealed spoilers when page or sorting changes (new set of reviews)
  useEffect(() => {
    setRevealedSpoilers({});
  }, [reviewsPage, reviewsSorting]);

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetReviews(novel?.id, reviewsPageSize, reviewsPage, reviewsSorting);

  const { mutate: likeReview } = useLikeReview();
  const { mutate: unlikeReview } = useUnlikeReview();

  // Static data (will be replaced with API later)
  const staticNovel = {
    title: "سندرباد",
    coverImage:
      "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
    summary:
      'في قلب مدينة بغداد القديمة، وُلد فتى ذكي يُدعى سندرباد. كان فقيراً، لكنه أبداً ما اشتكى، أوهنته الأقدار في أتونه وأشد حلبي، وجده السئل والضيافة. ومع تزايده، تزايد معه إمانيّة أن يخنقه العجائب الموسى على البحار. ومعبكاه، تارة بيحري حولنا، تارة رسمة محنّا، تراه العلماء وزتم قساوته. أجرد شهره ذاتى. ولكن دعيكّ، لن يكن يسعى للثراء وأيدمال. قال ثل نزل زوجيته. ينجد، الذكاء والصلالة. فهو في كلّ رحلة. لم يكن يعلى. للثراء والأيدمال. بل لأجمسبال ذاته. وعنيّه ومجمع المشكلة. والحفادة. وبروى العقالي. قوقسته مروق قصتي قصاص القاس القلب الردّب لقلب له. ردّب الإنسان إلى الأبد. "استبراد" ليست مجرد قصتْ مغامرات. بل حكاية عن السيلف بالحياة. ومن البراء الذي تفجر الإنسان إلى الأيد. للثراء والأيدمال',
    status: "مستمرة",
    rating: 4.0,
    reviewCount: 1267,
    publishDate: "تاريخ النشر 2025 مارس",
    author: {
      name: "الفنط المِسمشمشي",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    genres: ["فعال", "أكشن", "مغامرات"],
    chapters: Array.from({ length: 12 }, (_, i) => ({
      title: "سندرباد مالك البحار",
      date: `3 مارس 2025`,
    })),
    recommendations: [
      {
        title: "لنا فقط جندي",
        cover:
          "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=200&h=300&fit=crop",
        summary:
          'في زمنٍ اشتعلت فيه الحروب. وناهت فيه الحقيقة بين صرخات الرّصاص ودموع الضعفاء. يقف شابٌ بسيط يُدعى سليم. لا يحمل لقب بطل. ولا يسعى وراء المجد كل ما يعرفه أنه "فقط جندي". تُروى القصة من عينيه. حيث نرى العالم كما يراه هو: جبهات القتال. الخوف المختبئ خلف الأوامر. الأص...',
        author: "الخلافة الهانج",
        rating: 4.0,
        views: 1200,
      },
    ],
  };

  const tabs = [
    { id: "chapters", label: "الفصول", count: 72 },
    { id: "characters", label: "الشخصيات", count: 5 },
    { id: "reviews", label: "التقييمات", count: 89 },
  ];

  const navigateSubPages = (val) => {
    setSelectedSubPage(val);
  };

  // Loading state
  if (novelLoading || chaptersLoading) {
    return (
      <>
        <Header />
        <div
          className="min-h-screen bg-[#2C2C2C] md:p-[40px] p-[10px] flex items-center justify-center"
          dir="rtl"
        >
          <p className="text-white text-2xl noto-sans-arabic-extrabold">
            جاري التحميل...
          </p>
        </div>
      </>
    );
  }

  // Error state
  if (novelError || !novel) {
    return (
      <>
        <Header />
        <div
          className="min-h-screen bg-[#2C2C2C] md:p-[40px] p-[10px] flex items-center justify-center"
          dir="rtl"
        >
          <p className="text-white text-2xl noto-sans-arabic-extrabold">
            {novelError || "لم يتم العثور على الرواية"}
          </p>
        </div>
      </>
    );
  }

  // Format the date helper
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory",
    });
  };

  // Map status to Arabic
  const getStatusText = (status) => {
    return status === "Ongoing" ? "مستمرة" : "مكتملة";
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#2C2C2C] md:p-[40px] p-[10px]" dir="rtl">
        {/* Hero Section */}
        <div className="grid shadow-[2px_4px_6px_rgba(0,0,0,0.3)] text-white xl:grid-cols-[1fr_4fr] lg:grid-cols-[1fr_2fr] md:grid-cols-[1fr] gap-[30px] p-[15px] bg-[#3C3C3C] rounded-2xl mb-[30px]">
          {/* Cover Image */}
          <div className="w-full row-start-1 md:col-start-1">
            <div className="w-full aspect-[3/4] max-w-[400px]">
              <img
                src={novel.coverImageUrl}
                alt={novel.title}
                className="rounded-2xl w-full h-full object-fill"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            {/* Title with Start/Continue Reading Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-[15px] border-b-[1px] border-b-[#797979] mb-[10px]">
              <p className="noto-sans-arabic-extrabold text-[25px] md:text-[40px]">
                {novel.title}
              </p>
              
              {/* Start/Continue Reading Button - Show if user is logged in and chapters exist */}
              {currentUser && chapters.length > 0 && (
                <Link
                  to={
                    readingProgress?.hasProgress && readingProgress?.progress
                      ? `/novel/${novelSlug}/chapter/${readingProgress.progress.lastReadChapterId}`
                      : `/novel/${novelSlug}/chapter/${chapters[0].id}`
                  }
                  className="flex items-center gap-2 bg-[#0077FF] hover:bg-[#0066DD] text-white px-6 py-3 rounded-lg noto-sans-arabic-medium transition-colors whitespace-nowrap self-start md:self-auto"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>
                    {readingProgress?.hasProgress && readingProgress?.progress
                      ? "متابعة القراءة"
                      : "ابدأ القراءة"}
                  </span>
                </Link>
              )}
            </div>

            <div className="flex flex-col flex-grow">
              {/* Genres */}
              <div className="flex gap-2 flex-wrap mt-[5px] mb-[10px]">
                <span className="noto-sans-arabic-extrabold bg-[#3FBB4A] rounded-2xl px-[20px] py-[6px] text-[15px]">
                  {getStatusText(novel.status)}
                </span>
                {novel.genresList.map((genre) => (
                  <span
                    key={genre.id}
                    className="noto-sans-arabic-extrabold bg-[#4A4A4A] rounded-2xl px-[20px] py-[6px] text-[15px]"
                  >
                    {translateGenre(genre.name)}
                  </span>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-[#4A4A4A] rounded-2xl p-[15px] mb-[12px]">
                <p className="noto-sans-arabic-extrabold leading-[1.6] text-[16px] whitespace-pre-line">
                  {novel.summary}
                </p>
              </div>
            </div>

            {/* Author & Stats - Always at bottom */}
            <div className="flex flex-wrap justify-between items-center gap-[15px] mt-auto">
              <div className="flex justify-between flex-wrap items-center gap-2 md:gap-[15px]">
                <Link to={`/profile/${novel.author.userName}`}>
                  <img
                    src={novel.author.profilePhoto || "/default-avatar.png"}
                    alt={novel.author.displayName}
                    className="w-[60px] h-[60px] md:w-[75px] md:h-[75px] rounded-[50%]"
                  />
                </Link>
                <p className="noto-sans-arabic-extrabold text-[18px] md:text-[22.5px]">
                  {novel.author.displayName}
                </p>
              </div>

              <div className="flex flex-row gap-[25px] md:gap-[20px] items-center">
                <div className="flex flex-row-reverse gap-[4px] items-center">
                  <StarRating
                    rating={novel.totalAverageScore}
                    className="h-[22px] w-[22px] md:h-[27px] md:w-[27px]"
                  />
                  <div className="noto-sans-arabic-extrabold text-[20px] md:text-[22.5px]">
                    {novel.totalAverageScore.toFixed(1)}
                  </div>
                  <span className="noto-sans-arabic-extrabold text-[20px] md:text-[22.5px]">
                    ({novel.reviewCount.toLocaleString()})
                  </span>
                </div>

                <div className="flex gap-[8px] items-center">
                  <PenIcon className="h-[20px] w-[20px]" />
                  <p className="noto-sans-arabic-extrabold text-[17px] md:text-[22.5px]">
                    {formatDate(novel.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show Your Support - Gift Section */}
        <div className="rounded-2xl bg-[#3C3C3C] p-6 md:p-8 mb-[40px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-white text-2xl font-bold noto-sans-arabic-extrabold mb-2">
                أظهر دعمك
              </h2>
              <p className="text-[#B0B0B0] noto-sans-arabic-medium">
                أهدِ الكاتب هدية لمساعدته على مواصلة عمله.
              </p>
            </div>
            <Link
              to={`/novel/${novelSlug}/leaderboard`}
              className="text-[#4A9EFF] hover:text-[#3A8EEF] text-sm font-bold whitespace-nowrap noto-sans-arabic-extrabold transition-colors"
            >
              عرض لوحة المتصدرين الكاملة ←
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Gift Selection Column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Coffee Gift */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent bg-[#2C2C2C] cursor-pointer hover:border-[#4A9EFF]/50 transition-colors">
                  <div className="text-4xl">☕️</div>
                  <p className="text-white text-sm font-medium noto-sans-arabic-extrabold">قهوة</p>
                  <p className="text-[#B0B0B0] text-xs noto-sans-arabic-medium">100 نقطة</p>
                </div>

                {/* Rose Gift - Selected */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-[#4A9EFF] bg-[#4A9EFF]/10 cursor-pointer">
                  <div className="text-4xl">🌹</div>
                  <p className="text-white text-sm font-medium noto-sans-arabic-extrabold">وردة</p>
                  <p className="text-[#B0B0B0] text-xs noto-sans-arabic-medium">500 نقطة</p>
                </div>

                {/* Diamond Gift */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent bg-[#2C2C2C] cursor-pointer hover:border-[#4A9EFF]/50 transition-colors">
                  <div className="text-4xl">💎</div>
                  <p className="text-white text-sm font-medium noto-sans-arabic-extrabold">ماسة</p>
                  <p className="text-[#B0B0B0] text-xs noto-sans-arabic-medium">1000 نقطة</p>
                </div>

                {/* Crown Gift */}
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border-2 border-transparent bg-[#2C2C2C] cursor-pointer hover:border-[#4A9EFF]/50 transition-colors">
                  <div className="text-4xl">👑</div>
                  <p className="text-white text-sm font-medium noto-sans-arabic-extrabold">تاج</p>
                  <p className="text-[#B0B0B0] text-xs noto-sans-arabic-medium">5000 نقطة</p>
                </div>
              </div>

              <button 
                onClick={() => setIsGiftModalOpen(true)}
                className="flex w-full md:w-auto md:self-start min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white text-base font-bold noto-sans-arabic-extrabold transition-colors"
              >
                <span>إرسال الهدية</span>
              </button>
            </div>

            {/* Recent Gifts Column */}
            <div className="flex flex-col gap-4">
              <h3 className="text-white font-bold noto-sans-arabic-extrabold text-lg">الهدايا الأخيرة</h3>
              <div className="flex flex-col gap-3">
                {/* Recent Gift Entry 1 */}
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop")`,
                    }}
                  ></div>
                  <p className="text-[#E0E0E0] text-sm flex-1 noto-sans-arabic-medium">
                    <span className="font-bold text-white noto-sans-arabic-extrabold">أحمد</span> أهدى 🌹
                  </p>
                  <span className="text-[#B0B0B0] text-xs noto-sans-arabic-medium whitespace-nowrap">منذ دقيقتين</span>
                </div>

                {/* Recent Gift Entry 2 */}
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop")`,
                    }}
                  ></div>
                  <p className="text-[#E0E0E0] text-sm flex-1 noto-sans-arabic-medium">
                    <span className="font-bold text-white noto-sans-arabic-extrabold">فاطمة</span> أهدت ☕️
                  </p>
                  <span className="text-[#B0B0B0] text-xs noto-sans-arabic-medium whitespace-nowrap">منذ 15 دقيقة</span>
                </div>

                {/* Recent Gift Entry 3 */}
                <div className="flex items-center gap-3">
                  <div
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 flex-shrink-0"
                    style={{
                      backgroundImage: `url("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop")`,
                    }}
                  ></div>
                  <p className="text-[#E0E0E0] text-sm flex-1 noto-sans-arabic-medium">
                    <span className="font-bold text-white noto-sans-arabic-extrabold">محمد</span> أهدى 💎
                  </p>
                  <span className="text-[#B0B0B0] text-xs noto-sans-arabic-medium whitespace-nowrap">منذ ساعة</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center text-white mb-[40px] gap-1 md:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateSubPages(tab.id)}
              className={`noto-sans-arabic-extrabold cursor-pointer px-6 py-2 rounded transition-colors text-[16px] md:text-[20px] ${
                selectedSubPage === tab.id
                  ? "bg-neutral-700"
                  : "hover:bg-neutral-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div
          className={`grid justify-between grid-cols-1 gap-[40px] md:gap-[80px] py-[40px] ${
            selectedSubPage === "reviews" ? "" : "md:grid-cols-[2fr_1fr]"
          }`}
        >
          {/* Main Content Area - Chapters or Reviews */}
          <div
            className={`h-fit md:order-1 ${
              selectedSubPage === "reviews"
                ? ""
                : "rounded-2xl text-[16px] md:text-[20px] bg-[#3C3C3C] p-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] py-[30px] px-[20px]"
            }`}
          >
            {selectedSubPage === "chapters" && (
              <>
                {chapters.length > 0 ? (
                  chapters.map((chapter, index) => {
                    const chapterNumber = index + 1;
                    const lastReadChapterNumber = readingProgress?.progress?.lastReadChapterNumber || 0;
                    const isRead = chapterNumber < lastReadChapterNumber;
                    const isLastRead = chapterNumber === lastReadChapterNumber;
                    const isUnread = chapterNumber > lastReadChapterNumber;
                    
                    return (
                      <Link
                        key={chapter.id}
                        to={`/novel/${novelSlug}/chapter/${chapter.id}`}
                        className={`flex justify-between items-center border-b border-[#797979] py-[15px] cursor-pointer hover:bg-[#4A4A4A] px-[10px] rounded transition-colors ${
                          isRead ? "opacity-60" : ""
                        } ${
                          isLastRead ? "bg-[#0077FF]/10 border-l-4 border-l-[#0077FF]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <p className={`noto-sans-arabic-extrabold text-[18px] ${
                            isRead ? "text-[#B0B0B0]" : "text-[#FFFFFF]"
                          } ${
                            isLastRead ? "text-[#0077FF]" : ""
                          }`}>
                            {chapter.title}
                          </p>
                          {isLastRead && (
                            <span className="text-xs bg-[#0077FF] text-white px-2 py-1 rounded noto-sans-arabic-medium">
                              آخر قراءة
                            </span>
                          )}
                        </div>
                        <p className={`text-[16px] noto-sans-arabic-extrabold ${
                          isRead ? "text-[#888888]" : "text-[#FFFFFF]"
                        } ${
                          isLastRead ? "text-[#0077FF]" : ""
                        }`}>
                          {formatDate(chapter.createdAt)}
                        </p>
                      </Link>
                    );
                  })
                ) : (
                  <p className="text-white text-center noto-sans-arabic-extrabold">
                    لا توجد فصول متاحة حالياً
                  </p>
                )}
              </>
            )}

            {selectedSubPage === "reviews" && (
              <div className="space-y-8">
                {/* Review Aspects Section - Two Columns (Swapped) */}
                <div className="grid md:grid-cols-[2fr_1fr] gap-8 mb-12">
                  {/* Left Column - Share Review (No Background) - Extended */}
                  <div className="flex flex-col justify-center items-center text-center space-y-6">
                    <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[24px] leading-relaxed">
                      شارك أفكارك حول الرواية مع الآخرين،
                      <br /> وحرصاً على جودة النقاش،
                      <br /> نرجو أن يكون رأيك موضوعيًا وبنّاءً.
                    </p>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        if (!currentUser) {
                          setAuthModalAction("لمشاركة تقييمك");
                          setIsAuthModalOpen(true);
                        } else {
                          setIsReviewModalOpen(true);
                        }
                      }}
                      className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white noto-sans-arabic-extrabold text-[18px] px-12 py-4"
                    >
                      شارك تقييمك
                    </Button>
                  </div>

                  {/* Right Column - Review Aspects with Background (Narrower) */}
                  <div className="rounded-2xl bg-[#3C3C3C] p-6 shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                    <div className="space-y-6">
                      {/* جودة الكتابة */}
                      <div className="flex items-center justify-between">
                        <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px]">
                          جودة الكتابة
                        </p>
                        <StarRating
                          rating={novel?.averageWritingQualityScore || 0}
                          className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                        />
                      </div>

                      {/* استقرار التحديثات */}
                      <div className="flex items-center justify-between">
                        <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px]">
                          استقرار التحديثات
                        </p>
                        <StarRating
                          rating={novel?.averageUpdatingStabilityScore || 0}
                          className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                        />
                      </div>

                      {/* تطور القصة */}
                      <div className="flex items-center justify-between">
                        <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px]">
                          تطور القصة
                        </p>
                        <StarRating
                          rating={novel?.averageStoryDevelopmentScore || 0}
                          className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                        />
                      </div>

                      {/* بناء الشخصيات */}
                      <div className="flex items-center justify-between">
                        <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px]">
                          بناء الشخصيات
                        </p>
                        <StarRating
                          rating={novel?.averageCharacterDevelopmentScore || 0}
                          className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                        />
                      </div>

                      {/* بناء العالم القصصي */}
                      <div className="flex items-center justify-between">
                        <p className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px]">
                          بناء العالم القصصي
                        </p>
                        <StarRating
                          rating={novel?.averageWorldBuildingScore || 0}
                          className="w-[24px] h-[24px] md:w-[28px] md:h-[28px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Buttons - Moved to Left */}
                <div className="flex justify-center items-center gap-6 mb-8">
                  <button
                    onClick={() => {
                      setReviewsSorting("likes");
                      setReviewsPage(1);
                    }}
                    className={`${
                      reviewsSorting === "likes"
                        ? "text-[#4A9EFF]"
                        : "text-[#AAAAAA]"
                    } noto-sans-arabic-extrabold text-[18px] hover:underline cursor-pointer`}
                  >
                    الاكثر إعجاباً
                  </button>
                  <button
                    onClick={() => {
                      setReviewsSorting("newest");
                      setReviewsPage(1);
                    }}
                    className={`${
                      reviewsSorting === "newest"
                        ? "text-[#4A9EFF]"
                        : "text-[#AAAAAA]"
                    } noto-sans-arabic-extrabold text-[18px] hover:underline cursor-pointer`}
                  >
                    الأحدث
                  </button>
                </div>

                {/* Reviews Loading */}
                {reviewsLoading && (
                  <div className="text-center py-12">
                    <p className="text-white noto-sans-arabic-extrabold text-[18px]">
                      جاري تحميل التقييمات...
                    </p>
                  </div>
                )}

                {/* Reviews Error */}
                {reviewsError && (
                  <div className="text-center py-12">
                    <p className="text-red-400 noto-sans-arabic-extrabold text-[18px]">
                      حدث خطأ في تحميل التقييمات
                    </p>
                  </div>
                )}

                {/* Reviews List */}
                {!reviewsLoading &&
                  !reviewsError &&
                  reviewsData?.items?.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-[#AAAAAA] noto-sans-arabic-extrabold text-[18px]">
                        لا توجد تقييمات بعد. كن أول من يقيّم!
                      </p>
                    </div>
                  )}

                {!reviewsLoading &&
                  !reviewsError &&
                  reviewsData?.items?.map((review) => {
                    const isSpoilerRevealed = revealedSpoilers[review.id];

                    return (
                      <div
                        key={review.id}
                        className="border-b border-[#797979] pb-8"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            {review.reviewer.profilePhoto ? (
                              <img
                                src={review.reviewer.profilePhoto}
                                alt={review.reviewer.displayName}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-[#4A4A4A] flex items-center justify-center">
                                <User className="w-8 h-8 text-white" />
                              </div>
                            )}
                            <div>
                              <p className="text-white noto-sans-arabic-extrabold text-[20px]">
                                {review.reviewer.displayName}
                              </p>
                              <div className="mt-2">
                                <StarRating
                                  rating={review.totalAverageScore}
                                  className="w-[22px] h-[22px]"
                                />
                              </div>
                            </div>
                          </div>
                          <span className="text-[#AAAAAA] noto-sans-arabic-medium text-[14px]">
                            {formatDateShort(review.createdAt)}
                          </span>
                        </div>

                        {/* Review Content and Like Button Side by Side */}
                        <div className="flex items-start gap-4">
                          {/* Review Content with Blur Effect for Spoilers */}
                          <div className="relative flex-1">
                            <p
                              className={`text-white noto-sans-arabic-extrabold text-[18px] leading-relaxed transition-all duration-300 ${
                                review.isSpoiler && !isSpoilerRevealed
                                  ? "blur-md select-none"
                                  : ""
                              }`}
                            >
                              {review.content}
                            </p>

                            {/* Click to Reveal Spoiler Overlay */}
                            {review.isSpoiler && !isSpoilerRevealed && (
                              <div
                                onClick={() =>
                                  setRevealedSpoilers((prev) => ({
                                    ...prev,
                                    [review.id]: true,
                                  }))
                                }
                                className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors rounded-lg"
                              >
                                <div className="bg-[#3C3C3C] px-6 py-3 rounded-xl border-2 border-yellow-500/50 shadow-lg">
                                  <p className="text-yellow-400 noto-sans-arabic-extrabold text-[16px] flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    يحتوي على حرق - اضغط للعرض
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Like Button - Show for all users except the review author */}
                          {(!currentUser ||
                            currentUser.id !== review.reviewer.id) && (
                            <button
                              onClick={() => {
                                // Check if user is logged in before allowing like/unlike
                                if (!currentUser) {
                                  setAuthModalAction("للإعجاب بالمراجعة");
                                  setIsAuthModalOpen(true);
                                  return;
                                }

                                if (review.isLikedByCurrentUser) {
                                  unlikeReview({
                                    novelId: novel?.id,
                                    reviewId: review.id,
                                  });
                                } else {
                                  likeReview({
                                    novelId: novel?.id,
                                    reviewId: review.id,
                                  });
                                }
                              }}
                              className={`flex flex-col items-center gap-2 transition-colors flex-shrink-0 ${
                                review.isLikedByCurrentUser
                                  ? "text-[#4A9EFF]"
                                  : "text-[#AAAAAA] hover:text-white"
                              }`}
                            >
                              <svg
                                className="w-7 h-7"
                                fill={
                                  review.isLikedByCurrentUser
                                    ? "currentColor"
                                    : "none"
                                }
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                                />
                              </svg>
                              <span className="text-[16px] noto-sans-arabic-extrabold">
                                {review.likeCount}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                {/* Pagination */}
                {!reviewsLoading &&
                  !reviewsError &&
                  reviewsData &&
                  reviewsData.totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-12">
                      <button
                        onClick={() =>
                          setReviewsPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={reviewsPage === 1}
                        className="px-6 py-3 bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-[16px] rounded-xl hover:bg-[#5A5A5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      <span className="text-white noto-sans-arabic-extrabold text-[16px]">
                        {reviewsPage} / {reviewsData.totalPages}
                      </span>
                      <button
                        onClick={() =>
                          setReviewsPage((prev) =>
                            Math.min(reviewsData.totalPages, prev + 1)
                          )
                        }
                        disabled={reviewsPage === reviewsData.totalPages}
                        className="px-6 py-3 bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-[16px] rounded-xl hover:bg-[#5A5A5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </div>
                  )}
              </div>
            )}

            {selectedSubPage === "characters" && (
              <p className="text-white text-center noto-sans-arabic-extrabold">
                قريباً - صفحة الشخصيات
              </p>
            )}
          </div>

          {/* Sidebar - Hidden on reviews tab */}
          {selectedSubPage !== "reviews" && (
            <div className="flex flex-col gap-[30px] md:order-2">
              {/* Action Buttons */}
              <div className="flex flex-col gap-2 bg-[#3C3C3C] px-[25px] rounded-2xl p-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
                <div 
                  onClick={() => {
                    if (!currentUser) {
                      setAuthModalAction("لإضافة رواية إلى قائمة القراءة");
                      setIsAuthModalOpen(true);
                    } else {
                      setIsAddToListModalOpen(true);
                    }
                  }}
                  className="flex items-center gap-[10px] text-white text-[19px] md:text-[20px] noto-sans-arabic-extrabold py-2 cursor-pointer hover:opacity-80"
                >
                  <svg
                    className="w-[30px] h-[30px] flex-shrink-0"
                    width="47"
                    height="47"
                    viewBox="0 0 47 47"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M23.5 0C10.5199 0 0 10.5199 0 23.5C0 36.4801 10.5199 47 23.5 47C36.4801 47 47 36.4801 47 23.5C47 10.5199 36.4801 0 23.5 0ZM37.2053 25.4553C37.2053 26.5385 36.3332 27.4105 35.25 27.4105H27.4197V35.25C27.4197 36.3332 26.5477 37.2053 25.4645 37.2053H21.5447C20.4615 37.2053 19.5895 36.324 19.5895 35.25V27.4197H11.75C10.6668 27.4197 9.79473 26.5385 9.79473 25.4645V21.5447C9.79473 20.4615 10.6668 19.5895 11.75 19.5895H19.5803V11.75C19.5803 10.6668 20.4523 9.79473 21.5355 9.79473H25.4553C26.5385 9.79473 27.4105 10.676 27.4105 11.75V19.5803H35.25C36.3332 19.5803 37.2053 20.4615 37.2053 21.5355V25.4553Z"
                      fill="white"
                    />
                  </svg>
                  <p>أضف لقائمة القراءة</p>
                </div>
                <div className="flex items-center gap-[10px] text-white text-[19px] md:text-[20px] noto-sans-arabic-extrabold py-2 cursor-pointer hover:opacity-80">
                  <svg
                    className="w-[30px] h-[30px] flex-shrink-0"
                    width="47"
                    height="47"
                    viewBox="0 0 47 47"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.8625 47C15.1662 47 14.503 46.8694 13.8728 46.6083C13.2427 46.3472 12.6874 45.9773 12.2069 45.4986L1.50139 34.7931C1.02269 34.3144 0.652778 33.7591 0.391667 33.1272C0.130556 32.4953 0 31.8329 0 31.1401V15.8651C0 15.1688 0.130556 14.5056 0.391667 13.8754C0.652778 13.2453 1.02269 12.69 1.50139 12.2096L12.2069 1.504C12.6856 1.0253 13.2409 0.655389 13.8728 0.394278C14.5047 0.133167 15.1679 0.00174074 15.8625 0H31.1375C31.8338 0 32.4979 0.130556 33.1298 0.391667C33.7617 0.652778 34.3161 1.02269 34.7931 1.50139L45.4986 12.2069C45.9773 12.6856 46.3472 13.2409 46.6083 13.8728C46.8694 14.5047 47 15.1679 47 15.8625V31.1375C47 31.8338 46.8694 32.4979 46.6083 33.1298C46.3472 33.7617 45.9773 34.3161 45.4986 34.7931L34.7931 45.4986C34.3144 45.9773 33.7591 46.3472 33.1272 46.6083C32.4953 46.8694 31.8321 47 31.1375 47H15.8625ZM15.9278 41.7778H31.0722L41.7778 31.0722V15.9278L31.0722 5.22222H15.9278L5.22222 15.9278V31.0722L15.9278 41.7778ZM21.5 32.9H25.5V28.9H21.5V32.9ZM21.5 25.9H25.5V14.1H21.5V25.9Z"
                      fill="white"
                    />
                  </svg>
                  <p>قم بالتبليغ عن الرواية</p>
                </div>
                <div className="flex items-center gap-[10px] text-white text-[19px] md:text-[20px] noto-sans-arabic-extrabold py-2 cursor-pointer hover:opacity-80">
                  <svg
                    className="w-[30px] h-[30px] flex-shrink-0"
                    width="47"
                    height="47"
                    viewBox="0 0 47 47"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M39.1667 47C36.9907 47 35.1412 46.3146 33.6181 44.9437C32.0949 43.5729 31.3333 41.9083 31.3333 39.95C31.3333 39.715 31.3986 39.1667 31.5292 38.305L13.1861 28.67C12.4898 29.2575 11.6847 29.7181 10.7708 30.0518C9.85695 30.3855 8.87778 30.5516 7.83333 30.55C5.65741 30.55 3.80787 29.8646 2.28472 28.4937C0.761574 27.1229 0 25.4583 0 23.5C0 21.5417 0.761574 19.8771 2.28472 18.5062C3.80787 17.1354 5.65741 16.45 7.83333 16.45C8.87778 16.45 9.85695 16.6168 10.7708 16.9506C11.6847 17.2843 12.4898 17.7441 13.1861 18.33L31.5292 8.695C31.4421 8.42083 31.3882 8.15685 31.3673 7.90305C31.3464 7.64925 31.3351 7.3649 31.3333 7.05C31.3333 5.09167 32.0949 3.42708 33.6181 2.05625C35.1412 0.685417 36.9907 0 39.1667 0C41.3426 0 43.1921 0.685417 44.7153 2.05625C46.2384 3.42708 47 5.09167 47 7.05C47 9.00833 46.2384 10.6729 44.7153 12.0437C43.1921 13.4146 41.3426 14.1 39.1667 14.1C38.1222 14.1 37.1431 13.9332 36.2292 13.5995C35.3153 13.2657 34.5102 12.8059 33.8139 12.22L15.4708 21.855C15.5579 22.1292 15.6127 22.3939 15.6353 22.6493C15.658 22.9047 15.6684 23.1882 15.6667 23.5C15.6649 23.8118 15.6545 24.0961 15.6353 24.353C15.6162 24.61 15.5614 24.874 15.4708 25.145L33.8139 34.78C34.5102 34.1925 35.3153 33.7327 36.2292 33.4005C37.1431 33.0684 38.1222 32.9016 39.1667 32.9C41.3426 32.9 43.1921 33.5854 44.7153 34.9562C46.2384 36.3271 47 37.9917 47 39.95C47 41.9083 46.2384 43.5729 44.7153 44.9437C43.1921 46.3146 41.3426 47 39.1667 47Z"
                      fill="white"
                    />
                  </svg>
                  <p>شارك الرواية مع...</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[#3C3C3C] rounded-2xl p-[20px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] text-white">
                <p className="noto-sans-arabic-extrabold text-xl md:text-2xl pb-[20px]">
                  قد تعجبك أيضاً
                </p>
                <div className="flex gap-[20px] items-start">
                  {staticNovel.recommendations.map((rec, idx) => (
                    <React.Fragment key={idx}>
                      <div className="w-[145px] h-[200px] flex-shrink-0">
                        <img
                          className="rounded-2xl w-full h-full object-cover"
                          src={rec.cover}
                          alt={rec.title}
                        />
                      </div>
                      <div className="flex flex-col gap-[8px] justify-between flex-1 h-[200px] overflow-hidden">
                        <p className="text-[20px] noto-sans-arabic-extrabold border-b border-white pb-[8px]">
                          {rec.title}
                        </p>
                        <p className="text-[10px] noto-sans-arabic-extrabold line-clamp-3 flex-1">
                          {rec.summary}
                        </p>
                        <div className="flex items-center justify-between noto-sans-arabic-extrabold text-[14px]">
                          <div className="flex items-center gap-[8px]">
                            <svg
                              className="w-[16px] h-[16px] flex-shrink-0"
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 14V13.2C0 12.6333 0.146 12.1127 0.438 11.638C0.73 11.1633 1.11733 10.8007 1.6 10.55C2.63333 10.0333 3.68333 9.646 4.75 9.388C5.81667 9.13 6.9 9.00067 8 9C9.1 8.99933 10.1833 9.12867 11.25 9.388C12.3167 9.64733 13.3667 10.0347 14.4 10.55C14.8833 10.8 15.271 11.1627 15.563 11.638C15.855 12.1133 16.0007 12.634 16 13.2V14C16 14.55 15.8043 15.021 15.413 15.413C15.0217 15.805 14.5507 16.0007 14 16H2C1.45 16 0.979333 15.8043 0.588 15.413C0.196666 15.0217 0.000666667 14.5507 0 14ZM2 14H14V13.2C14 13.0167 13.9543 12.85 13.863 12.7C13.7717 12.55 13.6507 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5627 10.775 11.338C9.85833 11.1133 8.93333 11.0007 8 11C7.06667 10.9993 6.14167 11.112 5.225 11.338C4.30833 11.564 3.4 11.9013 2.5 12.35C2.35 12.4333 2.229 12.55 2.137 12.7C2.045 12.85 1.99933 13.0167 2 13.2V14ZM8 6C8.55 6 9.021 5.80433 9.413 5.413C9.805 5.02167 10.0007 4.55067 10 4C9.99933 3.44933 9.80367 2.97867 9.413 2.588C9.02233 2.19733 8.55133 2.00133 8 2C7.44867 1.99867 6.978 2.19467 6.588 2.588C6.198 2.98133 6.002 3.452 6 4C5.998 4.548 6.194 5.019 6.588 5.413C6.982 5.807 7.45267 6.00267 8 6Z"
                                fill="white"
                              />
                            </svg>
                            <p>{rec.author}</p>
                          </div>
                          <div className="flex items-center gap-[8px]">
                            <p>
                              ({rec.views.toLocaleString()}) {rec.rating}
                            </p>
                            <CustomStar className="w-[20px] h-[20px]" />
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        novelTitle={novel?.title || ""}
        novelId={novel?.id}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action={authModalAction}
      />

      {/* Add to Reading List Modal */}
      <AddNovelToReadingListModal
        isOpen={isAddToListModalOpen}
        onClose={() => setIsAddToListModalOpen(false)}
        novelId={novel?.id}
        novelTitle={novel?.title}
      />

      {/* Send Gift Modal */}
      <SendGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        novelTitle={novel?.title}
      />
    </>
  );
};

export default NovelPage;
