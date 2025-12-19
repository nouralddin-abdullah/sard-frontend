import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { Trophy, Calendar, ChevronLeft, Sparkles } from 'lucide-react';

// Contest data - can be moved to API later
const contests = [
  {
    id: 'im-special',
    title: 'أنا مميز',
    description: 'احتفِ بالاختلاف واكتب عن شخصيات فريدة تتحدى المألوف',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&h=400&fit=crop',
    prize: '$800',
    status: 'ongoing',
    endDate: '2025-03-31',
    participants: 156,
  },
  {
    id: 2,
    title: 'مسابقة القصة القصيرة',
    description: 'اكتب قصة قصيرة مؤثرة في أقل من 5000 كلمة',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
    prize: '$500',
    status: 'upcoming',
    startDate: '2025-02-01',
    participants: 0,
  },
  {
    id: 3,
    title: 'مسابقة الخيال العلمي',
    description: 'رحلة إلى المستقبل عبر قصص الخيال العلمي',
    image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&h=400&fit=crop',
    prize: '$600',
    status: 'upcoming',
    startDate: '2025-03-01',
    participants: 0,
  },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'ongoing':
      return {
        text: 'جارية الآن',
        bg: 'bg-green-500',
        color: 'text-white',
      };
    case 'upcoming':
      return {
        text: 'قريباً',
        bg: 'bg-blue-500',
        color: 'text-white',
      };
    case 'ended':
      return {
        text: 'انتهت',
        bg: 'bg-gray-500',
        color: 'text-white',
      };
    default:
      return {
        text: status,
        bg: 'bg-gray-500',
        color: 'text-white',
      };
  }
};

const ContestsPage = () => {
  return (
    <div className="min-h-screen bg-[#1E1E1E]" dir="rtl">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#2C2C2C] to-[#1E1E1E] py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#4A9EFF]/20 text-[#4A9EFF] px-4 py-2 rounded-full mb-6">
            <Trophy className="w-5 h-5" />
            <span className="noto-sans-arabic-bold">مسابقات الكتابة</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 noto-sans-arabic-extrabold">
            المسابقات
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto noto-sans-arabic-medium">
            شارك في مسابقات الكتابة واربح جوائز مالية. اكتشف موهبتك وشاركها مع العالم!
          </p>
        </div>
      </div>

      {/* Contests Grid */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => {
            const statusBadge = getStatusBadge(contest.status);
            const contestLink = contest.id === 'im-special' 
              ? '/contests/im-special' 
              : `/contests/${contest.id}`;

            return (
              <Link
                key={contest.id}
                to={contestLink}
                className="group bg-[#2C2C2C] rounded-2xl overflow-hidden border border-[#3C3C3C] hover:border-[#4A9EFF]/50 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#4A9EFF]/10"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={contest.image}
                    alt={contest.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-transparent to-transparent" />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 ${statusBadge.bg} ${statusBadge.color} px-3 py-1 rounded-full text-xs font-bold noto-sans-arabic-bold`}>
                    {statusBadge.text}
                  </div>

                  {/* Prize Badge */}
                  <div className="absolute bottom-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg noto-sans-arabic-bold">
                    {contest.prize}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-white mb-2 noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors">
                    {contest.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 noto-sans-arabic-medium">
                    {contest.description}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="noto-sans-arabic-medium">
                        {contest.status === 'ongoing' 
                          ? `ينتهي: ${contest.endDate}` 
                          : `يبدأ: ${contest.startDate}`
                        }
                      </span>
                    </div>
                    {contest.participants > 0 && (
                      <span className="noto-sans-arabic-medium">
                        {contest.participants} مشارك
                      </span>
                    )}
                  </div>

                  {/* View Button */}
                  <div className="mt-4 flex items-center text-[#4A9EFF] text-sm font-semibold noto-sans-arabic-bold group-hover:gap-2 transition-all">
                    <span>عرض التفاصيل</span>
                    <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State - if no contests */}
        {contests.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2 noto-sans-arabic-bold">
              لا توجد مسابقات حالياً
            </h3>
            <p className="text-gray-500 noto-sans-arabic-medium">
              تابعنا لمعرفة المسابقات القادمة!
            </p>
          </div>
        )}
      </main>

      {/* Footer Spacer for Mobile Nav */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default ContestsPage;
