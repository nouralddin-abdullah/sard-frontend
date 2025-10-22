import { useState } from "react";
import { useParams, Link } from "react-router";
import Header from "../../components/common/Header";
import StarRating from "../../components/common/StarRating";

const ReadingListPage = () => {
  const { username, listId } = useParams();

  // Mock data - replace with actual API call
  const listData = {
    id: 1,
    name: "قائمة المفضلة",
    coverImage: "/badge-1.png",
    isPrivate: false,
    followersCount: 1245,
    novelCount: 45,
    description: "في هذه القائمة، نخوص مغامرة أدبية عبر روايات تُشبع الأدواء وتُطفئ نيران القلوب، وتجعلك تتخيل المشاعر القاسية والمستندة إلى مشاعر الأبطال في الروح.",
    owner: {
      username: "محارب_الأشرار",
      displayName: "محارب الأشرار",
      profilePhoto: "/profilePicture.jpg",
    },
    isFollowing: false,
    novels: [
      {
        id: 1,
        title: "روايات تقطع شرايينك بالطول بعد قرائتها",
        author: "محارب الأشرار",
        cover: "https://via.placeholder.com/180x240",
        rating: 4.5,
        reviews: 1387,
        description: "في هذه القائمة، نخوص مغامرة أدبية عبر روايات تُشبع الأدواء...",
        tags: ["فانتازيا", "إثارة"],
      },
      {
        id: 2,
        title: "سندباد",
        author: "كاتب مجهول",
        cover: "https://via.placeholder.com/180x240",
        rating: 4.0,
        reviews: 987,
        description: "قصة مغامرات سندباد في بحار الخيال...",
        tags: ["مغامرات", "كلاسيكي"],
      },
      {
        id: 3,
        title: "أسطورة السرد",
        author: "نصل الكلمة",
        cover: "https://via.placeholder.com/180x240",
        rating: 4.8,
        reviews: 2156,
        description: "رواية ملحمية تأخذك في رحلة عبر الزمن...",
        tags: ["فانتازيا", "ملحمة"],
      },
    ],
  };

  const [selectedNovel, setSelectedNovel] = useState(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#2C2C2C" }}>
      <Header />

      {/* Return to Profile Button */}
      <div className="flex justify-center py-6">
        <Link
          to={`/profile/${username}`}
          className="px-6 py-3 bg-[#0077FF] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#0066DD] transition-colors"
        >
          العودة إلى الملف الشخصي
        </Link>
      </div>

      {/* Reading List Content */}
      <div className="w-[90%] mx-auto px-4 py-8">
        {/* List Header */}
        <div 
          className="flex flex-col md:flex-row gap-8 mb-12 p-8 rounded-lg"
          style={{ backgroundColor: "#3C3C3C", boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {/* List Cover - Left Side */}
          <div className="flex-shrink-0">
            <img
              src={listData.coverImage}
              alt={listData.name}
              className="w-64 h-64 object-cover rounded-lg"
              style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            />
          </div>

          {/* List Info - Right Side */}
          <div className="flex-1 text-white">
            {/* Title */}
            <h1 className="text-4xl noto-sans-arabic-extrabold mb-4">
              {listData.name}
            </h1>

            {/* Privacy, Followers, Novel Count Row */}
            <div className="flex items-center gap-6 mb-6">
              <span className="text-[#686868] noto-sans-arabic-medium flex items-center gap-2">
                {listData.isPrivate ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                    خاصة
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 0 2.04 4.327z"/>
                    </svg>
                    عامة
                  </>
                )}
              </span>
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.followersCount} متابع
              </span>
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.novelCount} رواية
              </span>
            </div>

            {/* Description */}
            <p className="text-white noto-sans-arabic-medium leading-relaxed mb-6">
              {listData.description}
            </p>

            {/* Owner Info and Follow Button Row */}
            <div className="flex items-center justify-between">
              {/* Owner Info */}
              <Link
                to={`/profile/${listData.owner.username}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={listData.owner.profilePhoto}
                  alt={listData.owner.displayName}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
                />
                <div>
                  <p className="text-white noto-sans-arabic-medium">
                    {listData.owner.displayName}
                  </p>
                  <p className="text-[#686868] noto-sans-arabic-medium text-sm">
                    @{listData.owner.username}
                  </p>
                </div>
              </Link>

              {/* Follow Button */}
              <button
                className={`px-8 py-3 rounded-lg noto-sans-arabic-medium transition-colors ${
                  listData.isFollowing
                    ? "bg-[#5A5A5A] text-white hover:bg-[#6A6A6A]"
                    : "bg-[#0077FF] text-white hover:bg-[#0066DD]"
                }`}
                onClick={() => {
                  // Toggle follow logic here
                }}
              >
                {listData.isFollowing ? "إلغاء المتابعة" : "متابعة القائمة"}
              </button>
            </div>
          </div>
        </div>

        {/* Novels Grid */}
        <div>
          <h2 className="text-white text-2xl noto-sans-arabic-bold mb-6">
            الروايات في هذه القائمة
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {listData.novels.map((novel) => (
              <div
                key={novel.id}
                className="flex flex-col md:flex-row gap-6 p-6 rounded-lg hover:bg-[#3C3C3C] transition-colors cursor-pointer"
                onClick={() => setSelectedNovel(novel)}
              >
                {/* Novel Cover */}
                <div className="flex-shrink-0">
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="w-36 h-48 object-cover rounded"
                    style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
                  />
                </div>

                {/* Novel Details */}
                <div className="flex-1 text-white">
                  <h3 className="text-2xl noto-sans-arabic-bold mb-4">
                    {novel.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white noto-sans-arabic-medium leading-relaxed mb-4 line-clamp-5 text-sm min-h-[5rem]">
                    {novel.description}
                  </p>

                  {/* Divider Line */}
                  <div className="w-full h-[1px] mb-4" style={{ backgroundColor: "#797979" }}></div>

                  {/* Tags and Rating Row */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {novel.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-[#5A5A5A] rounded-full text-sm noto-sans-arabic-medium text-white"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <StarRating rating={novel.rating} className="w-4 h-4" />
                      <span className="text-sm noto-sans-arabic-medium text-[#686868]">
                        {novel.rating} ({novel.reviews} تقييم)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingListPage;
