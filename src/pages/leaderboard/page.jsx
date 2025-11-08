import React from 'react';
import Header from '../../components/common/Header';
import { Trophy, Medal } from 'lucide-react';

const LeaderboardPage = () => {
  // Static data for all-time leaderboard
  const allTimeLeaders = [
    {
      rank: 1,
      username: 'أحمد محمد',
      displayName: 'أحمد محمد',
      profilePhoto: 'https://i.pravatar.cc/150?img=1',
      gifts: 25480,
      medal: '🥇'
    },
    {
      rank: 2,
      username: 'سارة أحمد',
      displayName: 'سارة أحمد',
      profilePhoto: 'https://i.pravatar.cc/150?img=2',
      gifts: 24112,
      medal: '🥈'
    },
    {
      rank: 3,
      username: 'محمد علي',
      displayName: 'محمد علي',
      profilePhoto: 'https://i.pravatar.cc/150?img=3',
      gifts: 23987,
      medal: '🥉'
    },
    {
      rank: 4,
      username: 'فاطمة حسن',
      displayName: 'فاطمة حسن',
      profilePhoto: 'https://i.pravatar.cc/150?img=4',
      gifts: 21050,
      medal: null
    }
  ];

  // Static data for weekly leaderboard
  const weeklyLeaders = [
    {
      rank: 1,
      username: 'عمر خالد',
      displayName: 'عمر خالد',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      gifts: 1520,
      medal: '🥇'
    },
    {
      rank: 2,
      username: 'ليلى محمود',
      displayName: 'ليلى محمود',
      profilePhoto: 'https://i.pravatar.cc/150?img=6',
      gifts: 1488,
      medal: '🥈'
    },
    {
      rank: 3,
      username: 'يوسف إبراهيم',
      displayName: 'يوسف إبراهيم',
      profilePhoto: 'https://i.pravatar.cc/150?img=7',
      gifts: 1350,
      medal: '🥉',
      isCurrentUser: true
    },
    {
      rank: 4,
      username: 'نور الدين',
      displayName: 'نور الدين',
      profilePhoto: 'https://i.pravatar.cc/150?img=8',
      gifts: 1201,
      medal: null
    }
  ];

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#888888';
    }
  };

  const LeaderboardCard = ({ title, subtitle, leaders }) => (
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
                  key={leader.rank}
                  className={`border-b border-[#4A4A4A] ${
                    leader.isCurrentUser 
                      ? 'bg-[#4A9EFF]/10 ring-1 ring-inset ring-[#4A9EFF]/30' 
                      : ''
                  }`}
                >
                  <td 
                    className="h-[72px] px-4 py-2 font-bold text-lg noto-sans-arabic-bold text-right"
                    style={{ color: getRankColor(leader.rank) }}
                  >
                    #{leader.rank}
                  </td>
                  <td className="h-[72px] px-4 py-2 text-white text-sm font-medium noto-sans-arabic-medium">
                    <div className="flex items-center gap-3">
                      <img 
                        src={leader.profilePhoto} 
                        alt={leader.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span>{leader.isCurrentUser ? 'أنت' : leader.displayName}</span>
                      {leader.medal && (
                        <span className="text-xl">{leader.medal}</span>
                      )}
                    </div>
                  </td>
                  <td className={`h-[72px] px-4 py-2 text-sm font-medium text-right noto-sans-arabic-medium ${
                    leader.rank <= 3 ? 'text-white' : 'text-[#AAAAAA]'
                  }`}>
                    {leader.gifts.toLocaleString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A]" dir="rtl">
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
              leaders={allTimeLeaders}
            />

            {/* Weekly Leaderboard */}
            <LeaderboardCard
              title="المتصدرون الأسبوعيون"
              subtitle="قادة هذا الأسبوع! يعاد الضبط خلال 3 أيام و 14 ساعة"
              leaders={weeklyLeaders}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeaderboardPage;
