import { useState } from "react";
import { useParams, Link } from "react-router";
import Header from "../../components/common/Header";
import { Star } from "lucide-react";

const ReadingListPage = () => {
  const { username, listId } = useParams();

  // Mock data - replace with actual API call
  const listData = {
    id: 1,
    name: "قائمة المفضلة",
    coverImage: "/badge-1.png",
    isPrivate: false,
    novelCount: 45,
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

      {/* Profile Banner Section - Simplified */}
      <div className="bg-zinc-800">
        <div
          className="w-full h-60 bg-cover bg-center"
          style={{
            backgroundImage: `url(/profilePicture.jpg)`,
          }}
        ></div>
      </div>

      {/* Reading List Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* List Header */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* List Cover */}
          <div className="flex-shrink-0">
            <img
              src={listData.coverImage}
              alt={listData.name}
              className="w-64 h-64 object-cover rounded-lg"
              style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            />
          </div>

          {/* List Info */}
          <div className="flex-1 text-white">
            <h1 className="text-4xl noto-sans-arabic-extrabold mb-4">
              {listData.name}
            </h1>
            <div className="flex items-center gap-4 mb-6">
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.novelCount} رواية
              </span>
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.isPrivate ? "خاصة" : "عامة"}
              </span>
            </div>
            <Link
              to={`/profile/${username}`}
              className="text-[#4A9EFF] hover:underline noto-sans-arabic-medium"
            >
              العودة إلى الملف الشخصي
            </Link>
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
                className="bg-[#3A3A3A] rounded-lg overflow-hidden flex flex-col md:flex-row gap-6 p-6 hover:bg-[#424242] transition-colors cursor-pointer"
                style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
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
                  <h3 className="text-2xl noto-sans-arabic-bold mb-2">
                    {novel.title}
                  </h3>
                  <p className="text-[#686868] noto-sans-arabic-medium mb-4">
                    بواسطة {novel.author}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          className={
                            idx < Math.floor(novel.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-500"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm noto-sans-arabic-medium text-[#686868]">
                      {novel.rating} ({novel.reviews} تقييم)
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-white noto-sans-arabic-medium mb-4 leading-relaxed line-clamp-2">
                    {novel.description}
                  </p>

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
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2 justify-end">
                  <button className="px-6 py-2 bg-[#4A9EFF] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#3A8EEF] transition-colors whitespace-nowrap">
                    فتح
                  </button>
                  <button className="px-6 py-2 bg-[#5A5A5A] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#6A6A6A] transition-colors whitespace-nowrap">
                    إزالة
                  </button>
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
