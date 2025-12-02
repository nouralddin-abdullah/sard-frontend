import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Hooks
import { useNovelDetails } from "../../hooks/novel/useNovelDetails";
import { useGetNovelChapters } from "../../hooks/novel/useGetNovelChapters";
import { useGetNovelReadingProgress } from "../../hooks/novel/useGetNovelReadingProgress";
import { useGetRecentGifts } from "../../hooks/novel/useGetRecentGifts";
import { useGetNovelPrivilege } from "../../hooks/novel/useGetNovelPrivilege";
import { useGetReviews } from "../../hooks/novel/useGetReviews";
import { useLikeReview } from "../../hooks/novel/useLikeReview";
import { useUnlikeReview } from "../../hooks/novel/useUnlikeReview";
import { useDeleteReview } from "../../hooks/novel/useDeleteReview";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";

// Utils
import { translateGenre } from "../../utils/translate-genre";

// Components
import Header from "../../components/common/Header";
import NotFoundPage from "../../components/common/NotFoundPage";
import NovelHeroSection from "../../components/novel/NovelHeroSection";
import NovelChaptersTab from "../../components/novel/NovelChaptersTab";
import NovelReviewsTab from "../../components/novel/NovelReviewsTab";
import NovelSidebar from "../../components/novel/NovelSidebar";

// Modals
import ReviewModal from "../../components/novel/ReviewModal";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import AddNovelToReadingListModal from "../../components/novel/AddNovelToReadingListModal";
import SendGiftModal from "../../components/novel/SendGiftModal";
import ShareModal from "../../components/common/ShareModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import UnlockPrivilegeModal from "../../components/novel/UnlockPrivilegeModal";

const NovelPage = () => {
  const { t } = useTranslation();
  const { novelSlug } = useParams();

  // Data fetching hooks
  const { data: novel, isLoading: novelLoading, error: novelError } = useNovelDetails(novelSlug);
  const { data: chapters = [], isLoading: chaptersLoading } = useGetNovelChapters(novel?.id);
  const { data: currentUser } = useGetLoggedInUser();
  const { data: readingProgress } = useGetNovelReadingProgress(novel?.id);
  const { data: recentGiftsData, isLoading: recentGiftsLoading } = useGetRecentGifts(novel?.id, 4, 1, !!novel?.id);

  // UI State
  const [selectedTab, setSelectedTab] = useState("chapters");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("لتنفيذ هذا الإجراء");
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUnlockPrivilegeModalOpen, setIsUnlockPrivilegeModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reviews state
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsSorting, setReviewsSorting] = useState("likes");
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const reviewsPageSize = 10;

  // Privilege info
  const hasLockedChapters = chapters.some((chapter) => chapter.isLocked);
  const { data: privilegeData } = useGetNovelPrivilege(novel?.id, hasLockedChapters);
  const privilegeInfo = privilegeData?.isEnabled ? privilegeData : null;

  // Reviews hooks
  const { data: reviewsData, isLoading: reviewsLoading, error: reviewsError } = useGetReviews(
    novel?.id,
    reviewsPageSize,
    reviewsPage,
    reviewsSorting,
    selectedTab === "reviews"
  );
  const { mutate: likeReview } = useLikeReview();
  const { mutate: unlikeReview } = useUnlikeReview();
  const { mutate: deleteReview, isPending: isDeletePending } = useDeleteReview();

  // Reset revealed spoilers when page or sorting changes
  useEffect(() => {
    setRevealedSpoilers({});
  }, [reviewsPage, reviewsSorting]);

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      calendar: "gregory",
    });
  };

  const getStatusText = (status) => {
    return status === "Ongoing" ? "مستمرة" : "مكتملة";
  };

  const handleAuthRequired = (action) => {
    setAuthModalAction(action);
    setIsAuthModalOpen(true);
  };

  const handleRateClick = () => {
    if (!currentUser) {
      handleAuthRequired("لإضافة تقييمك");
    } else {
      setIsReviewModalOpen(true);
    }
  };

  const handleAddToList = () => {
    if (!currentUser) {
      handleAuthRequired("لإضافة رواية إلى قائمة القراءة");
    } else {
      setIsAddToListModalOpen(true);
    }
  };

  const handleGiftClick = (giftId) => {
    setSelectedGift(giftId);
    setIsGiftModalOpen(true);
  };

  // Loading state
  if (novelLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-[#2C2C2C] flex items-center justify-center" dir="rtl">
          <p className="text-white text-2xl noto-sans-arabic-extrabold">جاري التحميل...</p>
        </main>
      </>
    );
  }

  // Error state
  if (novelError || !novel) {
    return (
      <NotFoundPage
        title="الرواية غير موجودة"
        message="عذراً، لم نتمكن من العثور على الرواية التي تبحث عنها. قد تكون حُذفت أو أن الرابط غير صحيح."
        showBackButton={true}
        showHomeButton={true}
        showSearchButton={true}
      />
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{novel.title} - سرد | منصة الروايات العربية</title>
        <meta
          name="description"
          content={novel.summary.substring(0, 160) + (novel.summary.length > 160 ? "..." : "")}
        />
        <meta
          name="keywords"
          content={`${novel.title}, رواية, ${novel.genresList.map((g) => translateGenre(g.name)).join(", ")}, ${novel.author.displayName}`}
        />

        {/* Open Graph */}
        <meta property="og:type" content="book" />
        <meta property="og:title" content={`${novel.title} - ${novel.author.displayName}`} />
        <meta
          property="og:description"
          content={novel.summary.substring(0, 160) + (novel.summary.length > 160 ? "..." : "")}
        />
        <meta property="og:image" content={novel.coverImageUrl} />
        <meta property="og:url" content={`https://www.sardnovels.com/novel/${novelSlug}`} />
        <meta property="og:locale" content="ar_AR" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${novel.title} - ${novel.author.displayName}`} />
        <meta
          name="twitter:description"
          content={novel.summary.substring(0, 160) + (novel.summary.length > 160 ? "..." : "")}
        />
        <meta name="twitter:image" content={novel.coverImageUrl} />

        <link rel="canonical" href={`https://www.sardnovels.com/novel/${novelSlug}`} />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: novel.title,
            description: novel.summary,
            image: novel.coverImageUrl,
            author: {
              "@type": "Person",
              name: novel.author.displayName,
              url: `https://www.sardnovels.com/profile/${novel.author.userName}`,
            },
            aggregateRating: novel.overallRating
              ? {
                  "@type": "AggregateRating",
                  ratingValue: novel.overallRating,
                  reviewCount: novel.reviewCount || 0,
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,
            genre: novel.genresList.map((g) => translateGenre(g.name)).join(", "),
            inLanguage: "ar",
            datePublished: novel.createdAt,
            numberOfPages: chapters?.length || 0,
            url: `https://www.sardnovels.com/novel/${novelSlug}`,
          })}
        </script>
      </Helmet>

      <Header />

      <main className="min-h-screen bg-[#2C2C2C]" dir="rtl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <NovelHeroSection
            novel={novel}
            chapters={chapters}
            readingProgress={readingProgress}
            novelSlug={novelSlug}
            onRateClick={handleRateClick}
            formatDate={formatDate}
            getStatusText={getStatusText}
          />

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content - 2 columns */}
            <div className="lg:col-span-2">
              <div className="bg-[#3C3C3C] rounded-xl p-6">
                {/* Tabs Header */}
                <div className="flex items-center justify-between mb-6 border-b border-[#4A4A4A] pb-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedTab("chapters")}
                      className={`py-2 px-4 rounded-lg font-bold transition-colors noto-sans-arabic-extrabold ${
                        selectedTab === "chapters"
                          ? "bg-[#4A4A4A] text-white"
                          : "text-[#B0B0B0] hover:bg-[#2C2C2C]"
                      }`}
                    >
                      الفصول
                    </button>
                    <button
                      onClick={() => setSelectedTab("reviews")}
                      className={`py-2 px-4 rounded-lg font-bold transition-colors noto-sans-arabic-extrabold ${
                        selectedTab === "reviews"
                          ? "bg-[#4A4A4A] text-white"
                          : "text-[#B0B0B0] hover:bg-[#2C2C2C]"
                      }`}
                    >
                      التقييمات
                    </button>
                  </div>
                  <Link
                    to={`/novel/${novel?.id}/wikipedia`}
                    className="text-sm text-[#4A9EFF] hover:underline noto-sans-arabic-medium"
                  >
                    استكشف موسوعة الرواية ←
                  </Link>
                </div>

                {/* Tab Content */}
                {selectedTab === "chapters" && (
                  <NovelChaptersTab
                    chapters={chapters}
                    chaptersLoading={chaptersLoading}
                    novelSlug={novelSlug}
                    readingProgress={readingProgress}
                    privilegeInfo={privilegeInfo}
                    onUnlockPrivilege={() => setIsUnlockPrivilegeModalOpen(true)}
                    formatDate={formatDate}
                  />
                )}

                {selectedTab === "reviews" && (
                  <NovelReviewsTab
                    novel={novel}
                    reviewsData={reviewsData}
                    reviewsLoading={reviewsLoading}
                    reviewsError={reviewsError}
                    reviewsPage={reviewsPage}
                    setReviewsPage={setReviewsPage}
                    reviewsSorting={reviewsSorting}
                    setReviewsSorting={setReviewsSorting}
                    currentUser={currentUser}
                    revealedSpoilers={revealedSpoilers}
                    setRevealedSpoilers={setRevealedSpoilers}
                    onLikeReview={likeReview}
                    onUnlikeReview={unlikeReview}
                    onDeleteReview={deleteReview}
                    onOpenReviewModal={() => setIsReviewModalOpen(true)}
                    onAuthRequired={handleAuthRequired}
                    isDeletePending={isDeletePending}
                  />
                )}
              </div>
            </div>

            {/* Sidebar - 1 column */}
            <div className="lg:col-span-1">
              <NovelSidebar
                novel={novel}
                novelSlug={novelSlug}
                novelId={novel?.id}
                currentUser={currentUser}
                recentGiftsData={recentGiftsData}
                recentGiftsLoading={recentGiftsLoading}
                onAddToList={handleAddToList}
                onShare={() => setIsShareModalOpen(true)}
                onGiftClick={handleGiftClick}
                onSendGift={() => setIsGiftModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        novelTitle={novel?.title || ""}
        novelId={novel?.id}
      />

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action={authModalAction}
      />

      <AddNovelToReadingListModal
        isOpen={isAddToListModalOpen}
        onClose={() => setIsAddToListModalOpen(false)}
        novelId={novel?.id}
        novelTitle={novel?.title}
      />

      <SendGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => {
          setIsGiftModalOpen(false);
          setSelectedGift(null);
        }}
        novelTitle={novel?.title}
        novelId={novel?.id}
        preselectedGiftId={selectedGift}
      />

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={novel?.title}
        description={novel?.summary}
        imageUrl={novel?.coverImageUrl}
        shareUrl={`${window.location.origin}/novel/${novelSlug}`}
        itemType="novel"
      />

      {privilegeInfo && (
        <UnlockPrivilegeModal
          isOpen={isUnlockPrivilegeModalOpen}
          onClose={() => setIsUnlockPrivilegeModalOpen(false)}
          privilegeCost={privilegeInfo.subscriptionCost}
          lockedChaptersCount={privilegeInfo.lockedChaptersCount}
          novelId={novel?.id}
        />
      )}

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          deleteReview(novel?.id, {
            onSuccess: () => {
              setShowDeleteConfirm(false);
            },
          });
        }}
        title="حذف التقييم"
        message="هل أنت متأكد من حذف تقييمك؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={isDeletePending}
      />
    </>
  );
};

export default NovelPage;
