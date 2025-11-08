import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNovelDetails } from "../../hooks/novel/useNovelDetails";
import { Award, Gift } from "lucide-react";
import Header from "../../components/common/Header";
import SendGiftModal from "../../components/novel/SendGiftModal";

const NovelLeaderboardPage = () => {
  const { novelSlug } = useParams();
  const {
    novel,
    loading: novelLoading,
    error: novelError,
  } = useNovelDetails(novelSlug);

  const [currentPage, setCurrentPage] = useState(1);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const itemsPerPage = 10;

  // Static data for testing (will be replaced with API)
  const staticLeaders = [
    {
      rank: 1,
      username: "ahmad_reader",
      displayName: "أحمد القارئ",
      profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      giftValue: 5400,
      medal: "gold",
    },
    {
      rank: 2,
      username: "fatima_books",
      displayName: "فاطمة محبة الكتب",
      profilePhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      giftValue: 4850,
      medal: "silver",
    },
    {
      rank: 3,
      username: "mohammed_fan",
      displayName: "محمد المعجب",
      profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      giftValue: 3200,
      medal: "bronze",
    },
    {
      rank: 4,
      username: "current_user",
      displayName: "أنت",
      profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      giftValue: 2980,
      medal: null,
      isCurrentUser: true,
    },
    {
      rank: 5,
      username: "sarah_novel",
      displayName: "سارة عاشقة الروايات",
      profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      giftValue: 2500,
      medal: null,
    },
    {
      rank: 6,
      username: "ali_stories",
      displayName: "علي باحث القصص",
      profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      giftValue: 2110,
      medal: null,
    },
    {
      rank: 7,
      username: "layla_reader",
      displayName: "ليلى القارئة",
      profilePhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      giftValue: 1850,
      medal: null,
    },
    {
      rank: 8,
      username: "omar_books",
      displayName: "عمر محب الكتب",
      profilePhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      giftValue: 1620,
      medal: null,
    },
    {
      rank: 9,
      username: "noor_fan",
      displayName: "نور المعجبة",
      profilePhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
      giftValue: 1450,
      medal: null,
    },
    {
      rank: 10,
      username: "khalid_reader",
      displayName: "خالد القارئ",
      profilePhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&h=100&fit=crop",
      giftValue: 1200,
      medal: null,
    },
  ];

  const getMedalIcon = (medal) => {
    if (!medal) return null;
    
    const colors = {
      gold: "#FFD700",
      silver: "#C0C0C0",
      bronze: "#CD7F32",
    };

    return (
      <Award
        className="w-5 h-5"
        style={{ color: colors[medal] }}
        fill={colors[medal]}
      />
    );
  };

  const totalPages = Math.ceil(staticLeaders.length / itemsPerPage);
  const paginatedLeaders = staticLeaders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (novelLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl noto-sans-arabic-medium">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (novelError || !novel) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-xl noto-sans-arabic-medium">
            حدث خطأ في تحميل الرواية
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-white" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 md:px-10 lg:px-20 max-w-[960px] py-5">
        {/* Breadcrumbs */}
        <div className="flex flex-wrap gap-2 p-4">
          <Link
            to="/home"
            className="text-[#B0B0B0] text-sm font-medium noto-sans-arabic-medium hover:text-[#4A9EFF] transition-colors"
          >
            الرئيسية
          </Link>
          <span className="text-[#B0B0B0] text-sm font-medium">/</span>
          <Link
            to={`/novel/${novelSlug}`}
            className="text-[#B0B0B0] text-sm font-medium noto-sans-arabic-medium hover:text-[#4A9EFF] transition-colors"
          >
            {novel.title}
          </Link>
          <span className="text-[#B0B0B0] text-sm font-medium">/</span>
          <span className="text-white text-sm font-medium noto-sans-arabic-medium">
            لوحة المتصدرين
          </span>
        </div>

        {/* Novel Info Card */}
        <div className="p-4 border-b border-[#3C3C3C] mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
            <div className="flex gap-4 items-center">
              <img
                src={novel.coverImageUrl || "/default-cover.png"}
                alt={novel.title}
                className="w-24 h-32 object-cover rounded-lg shadow-lg"
              />
              <div className="flex flex-col gap-1">
                <h1 className="text-white text-[22px] font-bold noto-sans-arabic-extrabold">
                  {novel.title}
                </h1>
                <Link
                  to={`/profile/${novel.author.userName}`}
                  className="text-[#B0B0B0] text-base noto-sans-arabic-medium hover:text-[#4A9EFF] transition-colors"
                >
                  بقلم {novel.author.displayName}
                </Link>
              </div>
            </div>
            <button 
              onClick={() => setIsGiftModalOpen(true)}
              className="flex items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-5 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white text-sm font-bold noto-sans-arabic-extrabold transition-colors w-full sm:w-auto"
            >
              <Gift className="w-5 h-5" />
              <span>إرسال هدية</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-white text-2xl font-bold noto-sans-arabic-extrabold px-4 pb-3 pt-5">
          أفضل المهدين
        </h2>

        {/* Leaderboard Table */}
        <div className="px-4 py-3">
          <div className="overflow-hidden rounded-lg border border-[#3C3C3C] bg-[#1A1A1A]">
            <table className="w-full">
              <thead>
                <tr className="bg-[#2C2C2C]">
                  <th className="px-4 py-3 text-right text-white text-sm font-medium noto-sans-arabic-extrabold w-16">
                    الترتيب
                  </th>
                  <th className="px-4 py-3 text-right text-white text-sm font-medium noto-sans-arabic-extrabold">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-white text-sm font-medium noto-sans-arabic-extrabold">
                    قيمة الهدايا
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedLeaders.map((leader) => (
                  <tr
                    key={leader.username}
                    className={`border-t border-[#3C3C3C] ${
                      leader.isCurrentUser
                        ? "bg-[#4A9EFF]/10"
                        : "hover:bg-[#2C2C2C] transition-colors"
                    }`}
                  >
                    <td className="h-[72px] px-4 py-2 w-16 text-[#B0B0B0] text-base font-bold noto-sans-arabic-extrabold">
                      <div className="flex items-center gap-2">
                        {getMedalIcon(leader.medal)}
                        <span
                          className={
                            leader.isCurrentUser ? "text-white" : ""
                          }
                        >
                          #{leader.rank}
                        </span>
                      </div>
                    </td>
                    <td className="h-[72px] px-4 py-2">
                      <Link
                        to={`/profile/${leader.username}`}
                        className="flex items-center gap-3 group"
                      >
                        <img
                          src={leader.profilePhoto}
                          alt={leader.displayName}
                          className={`w-10 h-10 rounded-full ${
                            leader.isCurrentUser
                              ? "ring-2 ring-[#4A9EFF]"
                              : ""
                          }`}
                        />
                        <span
                          className={`font-medium noto-sans-arabic-extrabold group-hover:text-[#4A9EFF] transition-colors ${
                            leader.isCurrentUser
                              ? "text-white font-bold"
                              : "text-[#E0E0E0]"
                          }`}
                        >
                          {leader.displayName}
                        </span>
                      </Link>
                    </td>
                    <td
                      className={`h-[72px] px-4 py-2 text-right text-sm font-medium noto-sans-arabic-extrabold ${
                        leader.isCurrentUser
                          ? "text-white font-bold"
                          : "text-[#B0B0B0]"
                      }`}
                    >
                      {leader.giftValue.toLocaleString("ar-SA")} نقطة
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 p-4 mt-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center rounded-lg h-10 px-3 bg-[#2C2C2C] text-white text-sm font-medium noto-sans-arabic-medium hover:bg-[#3C3C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            السابق
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              onClick={() => setCurrentPage(index + 1)}
              className={`flex items-center justify-center rounded-lg h-10 w-10 text-sm font-bold noto-sans-arabic-extrabold transition-colors ${
                currentPage === index + 1
                  ? "bg-[#4A9EFF] text-white"
                  : "bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="flex items-center justify-center rounded-lg h-10 px-3 bg-[#2C2C2C] text-white text-sm font-medium noto-sans-arabic-medium hover:bg-[#3C3C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            التالي
          </button>
        </div>
      </main>

      {/* Send Gift Modal */}
      <SendGiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        novelTitle={novel?.title}
      />
    </div>
  );
};

export default NovelLeaderboardPage;
