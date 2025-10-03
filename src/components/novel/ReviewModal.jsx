import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import StarRating from "../common/StarRating";
import ReviewStar from "../common/ReviewStar";
import { useCreateReview } from "../../hooks/novel/useCreateReview";

const ReviewModal = ({ isOpen, onClose, novelTitle, novelId }) => {
  const { mutate: createReview, isPending, isError, error } = useCreateReview();
  const [ratings, setRatings] = useState({
    writingQuality: 0,
    updateStability: 0,
    storyDevelopment: 0,
    characterDesign: 0,
    worldBuilding: 0,
  });
  const [reviewText, setReviewText] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [hoveredRating, setHoveredRating] = useState({});

  // Calculate overall rating (average of all categories)
  const overallRating = useMemo(() => {
    const ratingValues = Object.values(ratings);
    const filledRatings = ratingValues.filter((r) => r > 0);
    if (filledRatings.length === 0) return 0;
    const sum = filledRatings.reduce((acc, val) => acc + val, 0);
    return (sum / filledRatings.length).toFixed(1);
  }, [ratings]);

  if (!isOpen) return null;

  const ratingCategories = [
    {
      key: "writingQuality",
      label: "جودة الكتابة",
      apiKey: "writingQualityScore",
    },
    {
      key: "updateStability",
      label: "استقرار التحديثات",
      apiKey: "updatingStabilityScore",
    },
    {
      key: "storyDevelopment",
      label: "تطور القصة",
      apiKey: "storyDevelopmentScore",
    },
    {
      key: "characterDesign",
      label: "بناء الشخصيات",
      apiKey: "characterDevelopmentScore",
    },
    {
      key: "worldBuilding",
      label: "بناء العالم القصصي",
      apiKey: "worldBuildingScore",
    },
  ];

  const handleStarClick = (category, starIndex) => {
    setRatings((prev) => ({
      ...prev,
      [category]: starIndex + 1,
    }));
  };

  const handleStarHover = (category, starIndex) => {
    setHoveredRating((prev) => ({
      ...prev,
      [category]: starIndex + 1,
    }));
  };

  const handleStarLeave = (category) => {
    setHoveredRating((prev) => ({
      ...prev,
      [category]: 0,
    }));
  };

  const handleSubmit = () => {
    // Prepare API payload
    const payload = {
      writingQualityScore: ratings.writingQuality,
      updatingStabilityScore: ratings.updateStability,
      storyDevelopmentScore: ratings.storyDevelopment,
      characterDevelopmentScore: ratings.characterDesign,
      worldBuildingScore: ratings.worldBuilding,
      isSpoiler: isSpoiler,
      content: reviewText,
    };

    createReview(
      { novelId, payload },
      {
        onSuccess: () => {
          // Reset form
          setRatings({
            writingQuality: 0,
            updateStability: 0,
            storyDevelopment: 0,
            characterDesign: 0,
            worldBuilding: 0,
          });
          setReviewText("");
          setIsSpoiler(false);
          // Close modal
          onClose();
        },
      }
    );
  };

  const getDisplayRating = (category) => {
    return hoveredRating[category] || ratings[category] || 0;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      dir="rtl"
    >
      <div className="bg-[#2C2C2C] rounded-2xl w-full max-w-[1000px] max-h-[90vh] overflow-y-auto m-4 shadow-[0px_4px_4px_rgba(0,0,0,0.25)] scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
        {/* Header - Novel Title and Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-white hover:text-[#AAAAAA] transition-colors cursor-pointer z-50"
        >
          <X className="w-8 h-8 cursor-pointers" />
        </button>
        <div className="relative flex items-center justify-center p-6 pb-0">
          <p className="text-white noto-sans-arabic-extrabold text-[22px] mt-11 md:mt-0">
            {novelTitle}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Rating Section - Side by Side Layout */}
          <div className="grid md:grid-cols-[1fr_2fr] gap-6">
            {/* Overall Rating Display - Left Side */}
            <div className="flex flex-col items-center justify-center">
              <div className="border border-white rounded-2xl px-8 py-6 flex flex-col items-center space-y-3">
                <p className="text-white noto-sans-arabic-extrabold text-[20px]">
                  التقييم الكلي
                </p>
                <p className="text-white noto-sans-arabic-extrabold text-[48px] leading-none">
                  {overallRating > 0 ? overallRating : "0.0"}
                </p>
                <StarRating
                  rating={parseFloat(overallRating)}
                  className="w-[28px] h-[28px]"
                />
              </div>
            </div>

            {/* Rating Categories - Right Side */}
            <div className="px-0 py-6 md:p-6 space-y-5">
              {ratingCategories.map((category) => (
                <div
                  key={category.key}
                  className="flex items-center justify-between"
                >
                  <p className="text-white noto-sans-arabic-extrabold text-[16px] md:text-[20px]">
                    {category.label}
                  </p>
                  <div className="flex gap-1.5 md:gap-2">
                    {[0, 1, 2, 3, 4].map((starIndex) => {
                      const displayRating = getDisplayRating(category.key);
                      const isFilled = starIndex < displayRating;

                      return (
                        <button
                          key={starIndex}
                          onClick={() =>
                            handleStarClick(category.key, starIndex)
                          }
                          onMouseEnter={() =>
                            handleStarHover(category.key, starIndex)
                          }
                          onMouseLeave={() => handleStarLeave(category.key)}
                          className="cursor-pointer transition-transform hover:scale-110"
                        >
                          <ReviewStar
                            filled={isFilled}
                            className=" w-[26px] h-[26px] md:w-[32px] md:h-[32px]"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Review Text Area */}
          <div className="space-y-3">
            <label className="text-white noto-sans-arabic-extrabold text-[18px] md:text-[20px] block">
              شارك رأيك
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="ندعوك لمشاركة أفكارك وانطباعاتك حول الرواية مع المجتمع، فآراؤك تُسهم في تطوير المحتوى وتوسيع النقاش. نرجو منك أن تعبّر عن رأيك بموضوعية واحترام، بعيدًا عن التحيّز أو الهجوم الشخصي. تذكّر أن كلماتك قد تؤثر في الكُتّاب والقرّاء على حدٍّ سواء، فكن صوتًا داعمًا للحوار البنّاء والتقدير الواعي."
              className="w-full h-[200px] bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-[16px] rounded-2xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] placeholder:text-[#AAAAAA] placeholder:leading-relaxed"
              disabled={isPending}
            />
            {/* Error Message */}
            {isError && (
              <p className="text-red-400 noto-sans-arabic-bold text-[14px]">
                {error?.message ||
                  "حدث خطأ أثناء نشر التقييم. يرجى المحاولة مرة أخرى."}
              </p>
            )}
          </div>

          {/* Action Buttons and Spoiler Toggle */}
          <div className="flex-col md:flex md:flex-row items-center justify-between">
            {/* Spoiler Toggle - Left Side */}
            <div className="flex items-center gap-3">
              <label className="text-white noto-sans-arabic-extrabold text-[16px] ">
                يحتوي على حرق
              </label>
              <button
                onClick={() => setIsSpoiler(!isSpoiler)}
                className={` cursor-pointer relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out ${
                  isSpoiler ? "bg-[#4A9EFF]" : "bg-[#797979]"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isSpoiler ? "right-1" : "right-8"
                  }`}
                />
              </button>
            </div>

            {/* Action Buttons - Right Side */}
            <div className="flex justify-center gap-4 mt-6 md:mt-0">
              <button
                onClick={onClose}
                className="px-6 py-3 md:px-8 md:py-3 bg-[#4A4A4A] text-white noto-sans-arabic-extrabold text-[16px] md:text-[18px] rounded-2xl hover:bg-[#5A5A5A] transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  reviewText.length < 50 ||
                  Object.values(ratings).some((r) => r === 0) ||
                  isPending
                }
                className="px-6 py-3 md:px-8 md:py-3 bg-[#4A9EFF] text-white noto-sans-arabic-extrabold text-[16px] md:text-[18px] rounded-2xl hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPending ? "جاري النشر..." : "نشر التقييم"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
