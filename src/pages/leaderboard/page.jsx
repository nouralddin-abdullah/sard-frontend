import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { Trophy } from 'lucide-react';
import { useGetGlobalLeaderboard } from '../../hooks/gift/useGetGlobalLeaderboard';
import PageMeta from '../../components/common/PageMeta';

const LeaderboardPage = () => {
  // Fetch All Time leaderboard (10 users)
  const { data: allTimeData, isLoading: allTimeLoading } = useGetGlobalLeaderboard('AllTime', 1, 10);
  
  // Fetch Weekly leaderboard (10 users)
  const { data: weeklyData, isLoading: weeklyLoading } = useGetGlobalLeaderboard('Weekly', 1, 10);

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#888888';
    }
  };

  const getMedalEmoji = (rank) => {
    switch(rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return null;
    }
  };

  const LeaderboardCard = ({ title, subtitle, leaders, isLoading }) => (
    <div className="flex flex-col bg-[#3C3C3C] rounded-xl border border-[#4A4A4A]">
      {/* Header */}
      <div className="p-6 border-b border-[#4A4A4A]">
        <h2 className="text-white text-[22px] font-bold noto-sans-arabic-extrabold">
          {title}
        </h2>
        <p className="text-[#AAAAAA] text-sm noto-sans-arabic-medium pt-1">
          {subtitle}
        </p>
      </div>

      {/* Table */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-white text-lg noto-sans-arabic-extrabold">جاري التحميل...</p>
          </div>
        ) : !leaders || leaders.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <p className="text-[#AAAAAA] text-lg noto-sans-arabic-extrabold">لا يوجد بيانات حالياً</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#4A4A4A]">
                  <th className="px-4 py-3 text-right text-[#888888] text-xs font-medium uppercase tracking-wider w-16 noto-sans-arabic-medium">
                    الترتيب
                  </th>
                  <th className="px-4 py-3 text-right text-[#888888] text-xs font-medium uppercase tracking-wider noto-sans-arabic-medium">
                    المستخدم
                  </th>
                  <th className="px-4 py-3 text-right text-[#888888] text-xs font-medium uppercase tracking-wider noto-sans-arabic-medium">
                    الهدايا
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((leader) => (
                  <tr 
                    key={leader.userId}
                    className="border-b border-[#4A4A4A]"
                  >
                    <td 
                      className="h-[72px] px-4 py-2 font-bold text-lg noto-sans-arabic-bold text-right"
                      style={{ color: getRankColor(leader.rank) }}
                    >
                      #{leader.rank}
                    </td>
                    <td className="h-[72px] px-4 py-2 text-white text-sm font-medium noto-sans-arabic-medium">
                      <Link 
                        to={`/profile/${leader.userName}`}
                        className="flex items-center gap-3 hover:text-[#4A9EFF] transition-colors"
                      >
                        <img 
                          src={
                            leader.profilePhoto || 
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(leader.displayName)}&background=4A9EFF&color=fff`
                          } 
                          alt={leader.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span>{leader.displayName}</span>
                        {getMedalEmoji(leader.rank) && (
                          <span className="text-xl">{getMedalEmoji(leader.rank)}</span>
                        )}
                      </Link>
                    </td>
                    <td className={`h-[72px] px-4 py-2 text-sm font-medium text-right noto-sans-arabic-medium ${
                      leader.rank <= 3 ? 'text-white' : 'text-[#AAAAAA]'
                    }`}>
                      {leader.totalPointsGifted.toLocaleString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]" dir="rtl">
      <PageMeta
        title="لوحة المتصدرين | سرد"
        description="أكثر أعضاء سرد دعماً للكتّاب بالهدايا: المتصدرون على مر الزمان وهذا الأسبوع."
        path="/leaderboard"
      />
      <Header />
      
      <main className="px-4 sm:px-10 lg:px-20 py-10">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
          <div className="flex items-center gap-4 mb-8">
            <Trophy className="text-[#4A9EFF]" size={40} />
            <h1 className="text-white text-4xl font-black noto-sans-arabic-extrabold">
              لوحة المتصدرين
            </h1>
          </div>

          {/* Leaderboards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* All-Time Leaderboard */}
            <LeaderboardCard
              title="المتصدرون على مر الزمان"
              subtitle="تكريم أكثر الأعضاء سخاءً"
              leaders={allTimeData?.supporters || []}
              isLoading={allTimeLoading}
            />

            {/* Weekly Leaderboard */}
            <LeaderboardCard
              title="المتصدرون الأسبوعيون"
              subtitle="قادة هذا الأسبوع!"
              leaders={weeklyData?.supporters || []}
              isLoading={weeklyLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
