import React from "react";
import { Link } from "react-router-dom";
import { Plus, AlertTriangle, Share2 } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import CustomStar from "../common/CustomStar";
import { useGetNovelRecommendations } from "../../hooks/novel/useGetNovelRecommendations";
import SafeImage from "../common/SafeImage";

// Gift imports
import flowerGift from "../../assets/gifts/flower-100.png";
import pizzaGift from "../../assets/gifts/pizza-300.png";
import bookGift from "../../assets/gifts/book-500.png";
import crownGift from "../../assets/gifts/Crown-1000.png";
import scepterGift from "../../assets/gifts/Scepter-1500.png";
import castleGift from "../../assets/gifts/Castle-2000.png";
import dragonGift from "../../assets/gifts/Dragon-5000.png";
import universeGift from "../../assets/gifts/Universe-10000.png";

const GIFTS = [
  { id: "ec16dfde-71b8-4e23-8ff5-d1846cdf2036", image: flowerGift, name: "وردة", cost: 100 },
  { id: "88103b01-2e5b-4d06-9ff3-2724f4afba52", image: pizzaGift, name: "بيتزا", cost: 300 },
  { id: "9e17512a-269a-43e8-a571-1a1dc541cb5a", image: bookGift, name: "كتاب", cost: 500 },
  { id: "48bdfb35-9f2c-4198-80c1-58f28eb648ef", image: crownGift, name: "تاج", cost: 1000 },
  { id: "e6bfb3e7-6273-4e6b-a577-6afa71055bce", image: scepterGift, name: "صولجان", cost: 1500 },
  { id: "a4005ee7-f2a5-488a-8757-574030513cd4", image: castleGift, name: "قلعة", cost: 2000 },
];

const NovelSidebar = ({
  novel,
  novelSlug,
  novelId,
  currentUser,
  recentGiftsData,
  recentGiftsLoading,
  onAddToList,
  onShare,
  onGiftClick,
  onSendGift,
}) => {
  // Fetch recommendations with 1-hour cache
  const { 
    data: recommendations, 
    isLoading: recommendationsLoading 
  } = useGetNovelRecommendations(novelId, 10, !!novelId);

  return (
    <div className="space-y-6">
      {/* Action Links */}
      <div className="bg-[#3C3C3C] rounded-xl p-6 space-y-1">
        <button
          onClick={onAddToList}
          className="flex items-center gap-3 text-base font-bold text-white hover:text-[#4A9EFF] transition-colors w-full py-2 noto-sans-arabic-extrabold"
        >
          <span className="bg-[#2C2C2C] p-2 rounded-full">
            <Plus className="w-5 h-5" />
          </span>
          <span>أضف لقائمة القراءة</span>
        </button>
        <button className="flex items-center gap-3 text-base font-bold text-white hover:text-[#4A9EFF] transition-colors w-full py-2 noto-sans-arabic-extrabold">
          <span className="bg-[#2C2C2C] p-2 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </span>
          <span>قم بالتبليغ عن الرواية</span>
        </button>
        <button
          onClick={onShare}
          className="flex items-center gap-3 text-base font-bold text-white hover:text-[#4A9EFF] transition-colors w-full py-2 noto-sans-arabic-extrabold"
        >
          <span className="bg-[#2C2C2C] p-2 rounded-full">
            <Share2 className="w-5 h-5" />
          </span>
          <span>شارك الرواية مع...</span>
        </button>
      </div>

      {/* Gift Section */}
      <div className="bg-[#3C3C3C] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-1 noto-sans-arabic-extrabold">أظهر دعمك</h3>
        <p className="text-sm text-[#B0B0B0] mb-4 noto-sans-arabic-medium">
          أهدِ الكاتب هدية لمساعدته على مواصلة عمله.
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          {GIFTS.map((gift) => (
            <div
              key={gift.id}
              onClick={() => onGiftClick(gift.id)}
              className="bg-[#2C2C2C] p-3 rounded-lg cursor-pointer hover:ring-2 hover:ring-[#4A9EFF] transition-all"
            >
              <img src={gift.image} alt={gift.name} className="w-8 h-8 mx-auto object-contain" />
              <div className="font-bold text-white mt-1 text-sm noto-sans-arabic-extrabold">{gift.name}</div>
              <div className="text-xs text-[#B0B0B0] noto-sans-arabic-medium">{gift.cost} نقطة</div>
            </div>
          ))}
        </div>
        <button
          onClick={onSendGift}
          className="w-full mt-4 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white font-bold py-2 px-4 rounded-lg transition-colors noto-sans-arabic-extrabold"
        >
          إرسال الهدية
        </button>
      </div>

      {/* Recent Gifts */}
      <div className="bg-[#3C3C3C] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white noto-sans-arabic-extrabold">الهدايا الأخيرة</h3>
          <Link
            to={`/novel/${novelSlug}/supporters`}
            className="text-sm text-[#4A9EFF] hover:underline noto-sans-arabic-medium"
          >
            عرض الكل ←
          </Link>
        </div>

        {recentGiftsLoading ? (
          <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">جاري التحميل...</p>
        ) : recentGiftsData?.items && recentGiftsData.items.length > 0 ? (
          <div className="space-y-3">
            {recentGiftsData.items.slice(0, 3).map((giftEntry) => (
              <div key={giftEntry.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${giftEntry.senderUserName}`}
                    className="w-10 h-10 rounded-full bg-cover bg-center hover:ring-2 hover:ring-[#4A9EFF] transition-all"
                    style={{
                      backgroundImage: giftEntry.senderProfilePhoto
                        ? `url("${giftEntry.senderProfilePhoto}")`
                        : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(giftEntry.senderDisplayName)}&background=4A9EFF&color=fff")`,
                    }}
                  />
                  <div>
                    <p className="text-white text-sm noto-sans-arabic-extrabold">
                      {giftEntry.senderDisplayName}{" "}
                      <span className="text-[#B0B0B0] noto-sans-arabic-medium">أهدى</span>
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#B0B0B0] noto-sans-arabic-medium">
                  {getTimeAgo(giftEntry.createdAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">لا توجد هدايا حتى الآن</p>
        )}
      </div>

      {/* Recommendations */}
      <div className="bg-[#3C3C3C] rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 noto-sans-arabic-extrabold">قد تعجبك أيضاً</h3>
        
        {recommendationsLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-24 h-36 bg-[#2C2C2C] rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#2C2C2C] rounded w-3/4" />
                  <div className="h-3 bg-[#2C2C2C] rounded w-full" />
                  <div className="h-3 bg-[#2C2C2C] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations && recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/novel/${rec.slug}`}
                className="flex gap-4 hover:bg-[#2C2C2C] p-2 -mx-2 rounded-lg transition-colors"
              >
                <SafeImage
                  src={rec.coverImageUrl}
                  alt={rec.title}
                  className="w-16 h-24 rounded object-cover flex-shrink-0"
                  fallback="https://ui-avatars.com/api/?name=Novel&background=4A9EFF&color=fff&size=200"
                />
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="font-bold text-white noto-sans-arabic-extrabold text-sm line-clamp-2">
                    {rec.title}
                  </h4>
                  <span className={`w-fit px-2 py-0.5 rounded text-xs mt-1 noto-sans-arabic-medium ${
                    rec.status === "Completed" 
                      ? "bg-green-600/20 text-green-400" 
                      : "bg-yellow-600/20 text-yellow-400"
                  }`}>
                    {rec.status === "Completed" ? "مكتملة" : "مستمرة"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#B0B0B0] mt-1 noto-sans-arabic-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                    </svg>
                    {rec.chapterCount} فصل
                  </span>
                  <p className="text-[10px] text-[#B0B0B0] mt-1 line-clamp-3 noto-sans-arabic-medium flex-1">
                    {rec.summary || "لا يوجد وصف"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium text-center py-4">
            لا توجد توصيات متاحة حالياً
          </p>
        )}
      </div>
    </div>
  );
};

export default NovelSidebar;
