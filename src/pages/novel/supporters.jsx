import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import { useNovelDetails } from "../../hooks/novel/useNovelDetails";
import { useGetTopSupporters } from "../../hooks/novel/useGetTopSupporters";
import Header from "../../components/common/Header";

// Material Symbols Icons as React components
const WorkspacePremiumIcon = () => (
  <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
    workspace_premium
  </span>
);

const RedeemIcon = ({ className = "text-2xl" }) => (
  <span className={`material-symbols-outlined ${className}`}>
    redeem
  </span>
);

const GiftIconEmpty = () => (
  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9.06,1.93C7.17,1.92 5.33,3.74 6.17,6H3A2,2 0 0,0 1,8V10A1,1 0 0,0 2,11H11V8H13V11H22A1,1 0 0,0 23,10V8A2,2 0 0,0 21,6H17.83C19,2.73 14.6,0.42 12.57,3.24L12,4L11.43,3.24C10.8,2.28 9.93,1.94 9.06,1.93M9,4C9.89,4 10.34,5.08 9.71,5.71C9.08,6.34 8,5.89 8,5A1,1 0 0,1 9,4M15,4C15.89,4 16.34,5.08 15.71,5.71C15.08,6.34 14,5.89 14,5A1,1 0 0,1 15,4M2,12V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V12H13V20H11V12H2Z" />
  </svg>
);

const NovelSupportersPage = () => {
  const { novelSlug } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { data: novel, isLoading: novelLoading } = useNovelDetails(novelSlug);
  const { data: supporters, isLoading: supportersLoading } = useGetTopSupporters(novel?.id, 100);

  // Frontend pagination
  const { paginatedSupporters, totalPages } = useMemo(() => {
    if (!supporters || supporters.length === 0) {
      return { paginatedSupporters: [], totalPages: 0 };
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = supporters.slice(startIndex, endIndex);
    const pages = Math.ceil(supporters.length / itemsPerPage);
    
    return { paginatedSupporters: paginated, totalPages: pages };
  }, [supporters, currentPage, itemsPerPage]);

  if (novelLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
          <p className="text-white text-2xl noto-sans-arabic-extrabold">جاري التحميل...</p>
        </div>
      </>
    );
  }

  const getRankBadge = (rank) => {
    if (rank === 1) return { bg: "bg-yellow-400", text: "text-white", border: "border-yellow-400" };
    if (rank === 2) return { bg: "bg-gray-300", text: "text-gray-800", border: "border-gray-300" };
    if (rank === 3) return { bg: "bg-amber-600", text: "text-white", border: "border-amber-600" };
    return { bg: "bg-[#3C3C3C]", text: "text-white", border: "border-[#3C3C3C]" };
  };

  return (
    <>
      <Helmet>
        <title>لوحة الداعمين - {novel?.title || "رواية"}</title>
        <meta name="description" content={`لوحة الداعمين لرواية ${novel?.title || ""}`} />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-[#1A1A1A] py-10" dir="rtl">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <Link
              to={`/novel/${novelSlug}`}
              className="inline-flex items-center gap-2 text-[#4A9EFF] hover:text-[#3A8EEF] mb-4 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm font-bold noto-sans-arabic-extrabold">العودة للرواية</span>
            </Link>
            
            <div className="text-center mb-6">
              <h1 className="text-white text-4xl font-black mb-4 noto-sans-arabic-extrabold">
                لوحة الداعمين - "{novel?.title}"
              </h1>
              <p className="text-[#B0B0B0] text-lg max-w-3xl mx-auto noto-sans-arabic-medium">
                شكراً جزيلاً لجميع القراء الذين أظهروا دعمهم الرائع! هذه اللوحة تحتفي بأهم الداعمين الذين ساهموا في دعم هذه القصة.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {supportersLoading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-white text-xl noto-sans-arabic-extrabold">جاري تحميل الداعمين...</p>
            </div>
          ) : !supporters || supporters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-[#3C3C3C]">
                <GiftIconEmpty />
              </div>
              <p className="text-[#B0B0B0] text-xl noto-sans-arabic-extrabold">لا يوجد داعمين حتى الآن</p>
              <p className="text-[#666666] text-sm noto-sans-arabic-medium">كن أول من يدعم هذه الرواية!</p>
            </div>
          ) : (
            <>
              {/* Supporters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {paginatedSupporters.map((supporter) => {
                  const rankInfo = getRankBadge(supporter.rank);
                  const isTopThree = supporter.rank <= 3;

                  return (
                    <Link
                      key={supporter.userId}
                      to={`/profile/${supporter.userName}`}
                      className="relative bg-[#2C2C2C]/50 rounded-[1.5rem] border border-[#3C3C3C] p-6 flex flex-col items-center text-center shadow-sm hover:shadow-lg transition-shadow"
                    >
                      {/* Rank Badge */}
                      <div className={`absolute top-0 left-0 ${rankInfo.bg} ${rankInfo.text} font-bold ${isTopThree ? "text-lg" : "text-base"} rounded-tl-[1.5rem] rounded-br-[1.5rem] ${isTopThree ? "px-4 py-2" : "px-3 py-1.5"} flex items-center gap-2`}>
                        {isTopThree && <WorkspacePremiumIcon />}
                        <span>{supporter.rank}</span>
                      </div>

                      {/* Profile Photo */}
                      <div
                        className={`mb-4 rounded-full bg-cover bg-center shadow-md ${
                          isTopThree ? "w-24 h-24 border-4" : "w-20 h-20"
                        } ${rankInfo.border}`}
                        style={{
                          backgroundImage: supporter.profilePhoto
                            ? `url("${supporter.profilePhoto}")`
                            : `url("https://ui-avatars.com/api/?name=${encodeURIComponent(supporter.displayName)}&background=4A9EFF&color=fff")`,
                        }}
                      ></div>

                      {/* User Info */}
                      <h3 className={`text-white font-bold noto-sans-arabic-extrabold mb-1 ${isTopThree ? "text-xl" : "text-lg"}`}>
                        {supporter.displayName}
                      </h3>
                      <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium mb-4">
                        @{supporter.userName}
                      </p>

                      {/* Gift Icon and Points */}
                      <div className="flex items-center gap-2 text-[#4A9EFF]">
                        <RedeemIcon className={isTopThree ? "text-2xl" : ""} />
                        <p className={`font-bold noto-sans-arabic-extrabold ${isTopThree ? "text-lg" : "text-base"}`}>
                          {supporter.totalPointsGifted.toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center rounded-lg h-10 px-3 bg-[#2C2C2C] text-white text-sm font-medium noto-sans-arabic-medium hover:bg-[#3C3C3C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
};

export default NovelSupportersPage;
