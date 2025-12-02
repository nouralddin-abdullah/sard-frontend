import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, AlertTriangle, MoreVertical, Trash2 } from "lucide-react";
import StarRating from "../common/StarRating";
import ReviewStar from "../common/ReviewStar";
import { getTimeAgo } from "../../utils/date";

const NovelReviewsTab = ({
  novel,
  reviewsData,
  reviewsLoading,
  reviewsError,
  reviewsPage,
  setReviewsPage,
  reviewsSorting,
  setReviewsSorting,
  currentUser,
  revealedSpoilers,
  setRevealedSpoilers,
  onLikeReview,
  onUnlikeReview,
  onDeleteReview,
  onOpenReviewModal,
  onAuthRequired,
  isDeletePending,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReviewMenu, setShowReviewMenu] = useState(false);

  const ratingCategories = [
    { key: "writingQuality", label: "جودة الكتابة", score: novel?.averageWritingQualityScore },
    { key: "updateStability", label: "استقرار التحديثات", score: novel?.averageUpdatingStabilityScore },
    { key: "storyDevelopment", label: "تطور القصة", score: novel?.averageStoryDevelopmentScore },
    { key: "characterDesign", label: "بناء الشخصيات", score: novel?.averageCharacterDevelopmentScore },
    { key: "worldBuilding", label: "بناء العالم القصصي", score: novel?.averageWorldBuildingScore },
  ];

  return (
    <div className="space-y-8">
      {/* Review Aspects Section */}
      <div className="grid md:grid-cols-[1fr_1.5fr] gap-8 mb-12">
        {/* Share Review CTA */}
        <div className="flex flex-col justify-center items-center text-center space-y-6">
          {reviewsData?.currentUserReview ? (
            <>
              <p className="text-white noto-sans-arabic-extrabold text-lg md:text-xl leading-relaxed">
                شكراً لمشاركتك تقييمك!
                <br /> رأيك يساعد القرّاء الآخرين
                <br /> في اكتشاف هذه الرواية.
              </p>
              <div className="flex items-center gap-2 text-[#4A9EFF]">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="noto-sans-arabic-extrabold text-sm">تم نشر تقييمك</span>
              </div>
            </>
          ) : (
            <>
              <p className="text-white noto-sans-arabic-extrabold text-base md:text-lg leading-relaxed">
                شارك أفكارك حول الرواية مع الآخرين،
                <br /> وحرصاً على جودة النقاش،
                <br /> نرجو أن يكون رأيك موضوعيًا وبنّاءً.
              </p>
              <button
                onClick={() => {
                  if (!currentUser) {
                    onAuthRequired("لمشاركة تقييمك");
                  } else {
                    onOpenReviewModal();
                  }
                }}
                className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white noto-sans-arabic-extrabold text-base px-8 py-3 rounded-lg transition-colors"
              >
                شارك تقييمك
              </button>
            </>
          )}
        </div>

        {/* Rating Categories */}
        <div className="rounded-xl bg-[#3C3C3C] p-6 md:p-8 shadow-[0px_0px_1px_rgba(0,0,0,0.4)] border border-[#4A4A4A]">
          <div className="space-y-6">
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between gap-4">
                <p className="text-white noto-sans-arabic-extrabold text-base md:text-lg">{category.label}</p>
                <StarRating rating={category.score || 0} className="w-6 h-6 md:w-7 md:h-7" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Buttons */}
      <div className="flex justify-center items-center gap-6 mb-8">
        <button
          onClick={() => {
            setReviewsSorting("likes");
            setReviewsPage(1);
          }}
          className={`noto-sans-arabic-extrabold text-base hover:underline cursor-pointer ${
            reviewsSorting === "likes" ? "text-[#4A9EFF]" : "text-[#AAAAAA]"
          }`}
        >
          الاكثر إعجاباً
        </button>
        <button
          onClick={() => {
            setReviewsSorting("newest");
            setReviewsPage(1);
          }}
          className={`noto-sans-arabic-extrabold text-base hover:underline cursor-pointer ${
            reviewsSorting === "newest" ? "text-[#4A9EFF]" : "text-[#AAAAAA]"
          }`}
        >
          الأحدث
        </button>
      </div>

      {/* Loading / Error / Empty States */}
      {reviewsLoading && (
        <div className="text-center py-12">
          <p className="text-white noto-sans-arabic-extrabold text-base">جاري تحميل التقييمات...</p>
        </div>
      )}

      {reviewsError && (
        <div className="text-center py-12">
          <p className="text-red-400 noto-sans-arabic-extrabold text-base">حدث خطأ في تحميل التقييمات</p>
        </div>
      )}

      {!reviewsLoading && !reviewsError && reviewsData?.reviews?.length === 0 && !reviewsData?.currentUserReview && (
        <div className="text-center py-12">
          <p className="text-[#AAAAAA] noto-sans-arabic-extrabold text-base">لا توجد تقييمات بعد. كن أول من يقيّم!</p>
        </div>
      )}

      {/* Current User's Review */}
      {!reviewsLoading && !reviewsError && reviewsData?.currentUserReview && (
        <ReviewCard
          review={reviewsData.currentUserReview}
          isCurrentUser={true}
          currentUser={currentUser}
          novel={novel}
          revealedSpoilers={revealedSpoilers}
          setRevealedSpoilers={setRevealedSpoilers}
          onLikeReview={onLikeReview}
          onUnlikeReview={onUnlikeReview}
          onDeleteReview={onDeleteReview}
          onAuthRequired={onAuthRequired}
          showReviewMenu={showReviewMenu}
          setShowReviewMenu={setShowReviewMenu}
          showDeleteConfirm={showDeleteConfirm}
          setShowDeleteConfirm={setShowDeleteConfirm}
          isDeletePending={isDeletePending}
        />
      )}

      {/* Other Reviews */}
      {!reviewsLoading &&
        !reviewsError &&
        reviewsData?.reviews
          ?.filter((review) => review.id !== reviewsData?.currentUserReview?.id)
          .map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isCurrentUser={false}
              currentUser={currentUser}
              novel={novel}
              revealedSpoilers={revealedSpoilers}
              setRevealedSpoilers={setRevealedSpoilers}
              onLikeReview={onLikeReview}
              onUnlikeReview={onUnlikeReview}
              onAuthRequired={onAuthRequired}
            />
          ))}

      {/* Pagination */}
      {!reviewsLoading && !reviewsError && reviewsData && reviewsData.totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setReviewsPage((prev) => Math.max(1, prev - 1))}
            disabled={reviewsPage === 1}
            className="px-6 py-3 bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-sm rounded-lg hover:bg-[#5A5A5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          <span className="text-white noto-sans-arabic-extrabold text-sm">
            {reviewsPage} / {reviewsData.totalPages}
          </span>
          <button
            onClick={() => setReviewsPage((prev) => Math.min(reviewsData.totalPages, prev + 1))}
            disabled={reviewsPage === reviewsData.totalPages}
            className="px-6 py-3 bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-sm rounded-lg hover:bg-[#5A5A5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

// Review Card Component
const ReviewCard = ({
  review,
  isCurrentUser,
  currentUser,
  novel,
  revealedSpoilers,
  setRevealedSpoilers,
  onLikeReview,
  onUnlikeReview,
  onDeleteReview,
  onAuthRequired,
  showReviewMenu,
  setShowReviewMenu,
  showDeleteConfirm,
  setShowDeleteConfirm,
  isDeletePending,
}) => {
  const isSpoilerRevealed = revealedSpoilers[review.id];
  const reviewer = isCurrentUser ? currentUser : review.reviewer;

  return (
    <div className={`border-b border-[#4A4A4A] pb-8 ${isCurrentUser ? "mb-8" : ""}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {reviewer?.profilePhoto ? (
            <img
              src={reviewer.profilePhoto}
              alt={reviewer.displayName}
              className={`w-12 h-12 rounded-full object-cover ${isCurrentUser ? "ring-2 ring-[#4A9EFF]" : ""}`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-[#4A4A4A] flex items-center justify-center ${isCurrentUser ? "ring-2 ring-[#4A9EFF]" : ""}`}>
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white noto-sans-arabic-extrabold text-base">{reviewer?.displayName || "مستخدم"}</p>
              {isCurrentUser && (
                <span className="text-[#4A9EFF] text-xs noto-sans-arabic-medium bg-[#4A9EFF]/10 px-2 py-0.5 rounded">
                  تقييمك
                </span>
              )}
            </div>
            <div className="mt-1">
              <StarRating rating={review.totalAverageScore} className="w-4 h-4" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#AAAAAA] noto-sans-arabic-medium text-xs">{getTimeAgo(review.createdAt)}</span>
          {isCurrentUser && setShowReviewMenu && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowReviewMenu(!showReviewMenu);
                }}
                className="p-1 hover:bg-[#3C3C3C] rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-[#AAAAAA]" />
              </button>
              {showReviewMenu && (
                <div
                  className="absolute left-0 top-full mt-1 bg-[#3C3C3C] rounded-lg shadow-lg border border-[#5A5A5A] py-1 z-10 min-w-[120px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setShowReviewMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-[#4A4A4A] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="noto-sans-arabic-medium text-sm">حذف</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="flex items-start gap-4">
        <div className="relative flex-1">
          <p
            className={`text-white noto-sans-arabic-medium text-base leading-relaxed transition-all duration-300 ${
              review.isSpoiler && !isSpoilerRevealed ? "blur-md select-none" : ""
            }`}
          >
            {review.content}
          </p>

          {/* Spoiler Overlay */}
          {review.isSpoiler && !isSpoilerRevealed && (
            <div
              onClick={() => setRevealedSpoilers((prev) => ({ ...prev, [review.id]: true }))}
              className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors rounded-lg"
            >
              <div className="bg-[#3C3C3C] px-6 py-3 rounded-xl border-2 border-yellow-500/50 shadow-lg">
                <p className="text-yellow-400 noto-sans-arabic-extrabold text-sm flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  يحتوي على حرق - اضغط للعرض
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Like Button */}
        {(!currentUser || currentUser.id !== review.reviewer?.id) && !isCurrentUser && (
          <button
            onClick={() => {
              if (!currentUser) {
                onAuthRequired("للإعجاب بالمراجعة");
                return;
              }
              if (review.isLikedByCurrentUser) {
                onUnlikeReview({ novelId: novel?.id, reviewId: review.id });
              } else {
                onLikeReview({ novelId: novel?.id, reviewId: review.id });
              }
            }}
            className={`flex flex-col items-center gap-1 transition-colors flex-shrink-0 ${
              review.isLikedByCurrentUser ? "text-[#4A9EFF]" : "text-[#AAAAAA] hover:text-white"
            }`}
          >
            <svg
              className="w-6 h-6"
              fill={review.isLikedByCurrentUser ? "currentColor" : "none"}
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
            <span className="text-sm noto-sans-arabic-medium">{review.likeCount}</span>
          </button>
        )}
      </div>

      {/* Spoiler Badge */}
      {review.isSpoiler && isSpoilerRevealed && (
        <div className="mt-4 inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          <span className="noto-sans-arabic-medium text-xs">يحتوي على حرق</span>
        </div>
      )}

      {/* Like count for current user */}
      {isCurrentUser && (
        <div className="mt-4 flex items-center gap-2 text-[#AAAAAA]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span className="noto-sans-arabic-medium text-sm">{review.likeCount} إعجاب</span>
        </div>
      )}
    </div>
  );
};

export default NovelReviewsTab;
