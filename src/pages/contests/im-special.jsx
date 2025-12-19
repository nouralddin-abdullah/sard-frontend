import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../components/common/Header';
import JoinCompetitionModal from '../../components/common/JoinCompetitionModal';
import { useGetCompetition, CompetitionStatus } from '../../hooks/competition/useGetCompetition';
import { useGetCompetitionNovels } from '../../hooks/competition/useGetCompetitionNovels';
import { useGetMyParticipations } from '../../hooks/competition/useGetMyParticipations';
import { 
  Trophy, 
  Calendar, 
  Sparkles, 
  Edit3,
  ArrowUpRight,
  ArrowRight,
  Heart,
  MoreHorizontal,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');
};

// Helper function to format date range
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const formatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const startStr = start.toLocaleDateString('en-CA').replace(/-/g, '/');
  const endStr = end.toLocaleDateString('en-CA').replace(/-/g, '/');
  return `${startStr} ~ ${endStr}`;
};

// Get status color and label
const getStatusInfo = (status) => {
  switch (status) {
    case CompetitionStatus.UPCOMING:
      return { color: 'bg-yellow-500', label: 'قريباً' };
    case CompetitionStatus.PARTICIPATION:
      return { color: 'bg-green-500', label: 'المشاركة مفتوحة' };
    case CompetitionStatus.JUDGING:
      return { color: 'bg-blue-500', label: 'قيد التحكيم' };
    case CompetitionStatus.COMPLETED:
      return { color: 'bg-purple-500', label: 'انتهت' };
    default:
      return { color: 'bg-gray-500', label: status };
  }
};

// Import contest theme images
import returnedMercImage from '../../assets/contest/im-special/returned-merc.png';
import systemCheatingImage from '../../assets/contest/im-special/system-cheating.png';
import singleSpellImage from '../../assets/contest/im-special/single-spell.png';
import girlSoundsImage from '../../assets/contest/im-special/gril-sounds.png';

// Competition themes data - "I'm Special" themed
const competitionThemes = [
  {
    number: 1,
    category: 'النجاة',
    categoryEn: 'Survival',
    title: 'المرتزق العائد',
    description: 'شاب كان مسافرًا مع عائلته وهو صغير، لكن الطائرة سقطت ونجا في جزيرة نائية. وجدته منظمة سرية ودربته في برنامج قاسٍ حتى أصبح مرتزقًا محترفًا. بطريقة ما عاد لأهله... كيف سيتعايش مع المدرسة الجديدة ويحمي أصدقاءه وإخوته من ماضيه الذي يطارده؟',
    image: returnedMercImage,
  },
  {
    number: 2,
    category: 'النظام',
    categoryEn: 'System', 
    title: 'أعتقد اني اغش',
    description: 'شاب في الجيش يستيقظ فجأة ليجد نفسه يمتلك نظامًا خارقًا: كشف ما وراء الجدران، تصويب تلقائي لا يُخطئ، وقدرات لا يمكن تفسيرها. يستخدم هذا النظام ليتفوق في الحرب والمهمات المستحيلة... لكن من أين جاء هذا النظام؟ وما الثمن؟',
    image: systemCheatingImage,
  },
  {
    number: 3,
    category: 'السحر',
    categoryEn: 'Magic',
    title: 'تعويذة واحدة',
    description: 'في أكاديمية السحر، الجميع يتقن عشرات التعاويذ إلا هو... شاب لا يستطيع استخدام سوى تعويذة واحدة فقط. يتنمرون عليه ويظنونه الأضعف، لكنهم لا يعلمون أن تلك التعويذة الوحيدة تخفي قوة لا يتخيلها أحد.',
    image: singleSpellImage,
  },
  {
    number: 4,
    category: 'الأصوات',
    categoryEn: 'Voices',
    title: 'همسات لا يسمعها أحد',
    description: 'بنت تسمع أصواتًا غريبة لا يسمعها غيرها... الأطباء يقولون إنها مريضة، لكنها تكتشف أن هذه الأصوات ليست وهمًا. إنها تحذيرات، رسائل، وأحيانًا... أرواح تطلب المساعدة.',
    image: girlSoundsImage,
  },
];

const ImSpecialContestPage = () => {
  const [activeTab, setActiveTab] = useState('popular');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  
  // Fetch competition data from API
  const { data: competition, isLoading, isError, error } = useGetCompetition('im-special');
  
  // Fetch competition novels/participants
  const { 
    data: novelsData, 
    isLoading: isLoadingNovels 
  } = useGetCompetitionNovels(
    competition?.id, 
    { 
      sortBy: activeTab === 'popular' ? 'top' : 'newest', 
      pageNumber: currentPage, 
      pageSize 
    }
  );
  
  // Fetch user's participations
  const { data: myParticipations } = useGetMyParticipations();
  
  // Filter participations for this competition
  const myCompetitionEntries = myParticipations?.filter(
    p => p.competitionId === competition?.id
  ) || [];
  
  // Reset to page 1 when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans" dir="rtl">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-white/50" />
          <p className="text-gray-500 noto-sans-arabic-medium">جاري تحميل المسابقة...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans" dir="rtl">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-600" />
          <p className="text-gray-500 noto-sans-arabic-medium">حدث خطأ في تحميل المسابقة</p>
          <p className="text-gray-600 text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }

  // Get status info
  const statusInfo = getStatusInfo(competition?.status);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <header className="relative w-full overflow-hidden min-h-[500px] md:min-h-[600px]">
        <div className="absolute inset-0">
          <img 
            src={competition?.imageUrl || "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&h=1080&fit=crop"} 
            alt={competition?.name || "Background"} 
            className="w-full h-full object-cover object-center"
          />
          {/* Heavy dark overlay for dramatic effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-black/80 to-black/60"></div>
          {/* Vignette effect */}
          <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'}}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Prize Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/10 bg-black/50 backdrop-blur-md text-white/90 text-sm font-medium mb-8">
            <Trophy className="w-4 h-4 ml-2 text-amber-500" />
            اربح حتى ${competition?.totalPrize || 0}!
          </div>

          {/* Title - Simple white text, dramatic */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-2xl noto-sans-arabic-extrabold">
            {competition?.name || 'أنا مميز'}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-white/60 font-medium noto-sans-arabic-medium">
            احتفِ بالاختلاف، اكتب عن شخصيات فريدة تتحدى المألوف!
          </p>

          {/* Participant Count */}
          {competition?.participantCount > 0 && (
            <p className="mt-2 text-sm text-white/40 noto-sans-arabic-medium">
              {competition.participantCount} مشارك حتى الآن
            </p>
          )}

          {/* CTA Buttons - Dark/muted style */}
          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <button 
              disabled={!competition?.canJoin}
              onClick={() => competition?.canJoin && setIsJoinModalOpen(true)}
              className={`px-8 py-4 rounded-full font-bold text-lg flex items-center noto-sans-arabic-bold transition-all duration-200 ${
                competition?.canJoin 
                  ? 'bg-white text-black hover:bg-white/90 hover:scale-105' 
                  : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
              }`}
            >
              <Edit3 className="w-5 h-5 ml-2" />
              {competition?.canJoin ? 'شارك الآن' : 'باب المشاركة سيفتح قريباً'}
            </button>
            <button 
              onClick={() => document.getElementById('quick-links')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-transparent border border-white/20 text-white/80 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/5 hover:border-white/30 transition-colors noto-sans-arabic-bold"
            >
              المزيد من التفاصيل
            </button>
          </div>
        </div>

        {/* Wave - darker */}
        <div className="absolute bottom-0 w-full leading-none">
          <svg className="block w-full h-12 sm:h-24" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path 
              className="fill-[#0a0a0a]" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* Awards Section */}
        <section className="relative">
          <div className="flex items-center justify-center mb-10">
            <div className="bg-black text-amber-500 px-6 py-2 rounded-t-xl font-bold text-2xl uppercase tracking-wider flex items-center border-b-2 border-amber-500/50 noto-sans-arabic-extrabold">
              <Trophy className="w-6 h-6 ml-2" />
              الجوائز
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Silver - Second Place */}
            <div className="bg-[#111111] rounded-2xl p-6 text-center transform md:translate-y-8 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-2xl text-gray-400 mb-2 noto-sans-arabic-bold">الفضية</h3>
              <div className="text-white font-bold text-3xl mb-1 noto-sans-arabic-extrabold">${competition?.prizeSecondPlace || 0}</div>
              <p className="text-gray-600 text-sm noto-sans-arabic-medium">المركز الثاني</p>
            </div>

            {/* Gold - First Place */}
            <div className="bg-gradient-to-b from-amber-900/20 to-[#111111] rounded-2xl p-8 text-center transform md:-translate-y-4 border border-amber-500/30 relative z-20">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-500 text-black font-bold px-4 py-1 rounded-full text-xs uppercase noto-sans-arabic-bold">
                الجائزة الكبرى
              </div>
              <div className="w-24 h-24 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-12 h-12 text-amber-500" />
              </div>
              <h3 className="font-bold text-3xl text-amber-500 mb-2 noto-sans-arabic-bold">الذهبية</h3>
              <div className="text-white font-bold text-5xl mb-1 noto-sans-arabic-extrabold">${competition?.prizeFirstPlace || 0}</div>
              <p className="text-gray-500 font-medium noto-sans-arabic-medium">المركز الأول</p>
            </div>

            {/* Bronze - Third Place */}
            <div className="bg-[#111111] rounded-2xl p-6 text-center transform md:translate-y-8 border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-20 h-20 mx-auto bg-amber-900/20 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-amber-700" />
              </div>
              <h3 className="font-bold text-2xl text-amber-700 mb-2 noto-sans-arabic-bold">البرونزية</h3>
              <div className="text-white font-bold text-3xl mb-1 noto-sans-arabic-extrabold">${competition?.prizeThirdPlace || 0}</div>
              <p className="text-gray-600 text-sm noto-sans-arabic-medium">المركز الثالث</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 mt-12 noto-sans-arabic-medium">
            *يجب أن تحتوي الروايات على {competition?.minChapters || 0} فصول على الأقل، وعمر الرواية لا يتجاوز {competition?.maxNovelAgeDays || 0} يوماً
          </p>
        </section>

        {/* Timeline Section */}
        <section className="bg-[#111111] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-5">
            <Calendar className="w-32 h-32 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-8 flex items-center noto-sans-arabic-extrabold text-white">
            <span className="bg-white/5 text-white p-3 rounded-xl ml-4 border border-white/10">
              <Calendar className="w-6 h-6" />
            </span>
            الجدول الزمني
          </h2>

          <div className="space-y-6 relative">
            <div className="absolute right-4 top-4 bottom-4 w-0.5 bg-white/10" />

            {/* Participation Period */}
            <div className="relative pr-12">
              <div className={`absolute right-2 top-2 w-4 h-4 rounded-full ring-4 ring-[#111111] ${
                competition?.status === CompetitionStatus.PARTICIPATION ? 'bg-white animate-pulse' : 'bg-white/30'
              }`} />
              <div className={`flex flex-col md:flex-row md:justify-between md:items-center p-4 rounded-xl border ${
                competition?.status === CompetitionStatus.PARTICIPATION 
                  ? 'bg-white/5 border-white/20' 
                  : 'bg-white/5 border-white/5'
              }`}>
                <span className="font-semibold text-white noto-sans-arabic-bold">فترة المشاركة</span>
                <span className="font-mono font-bold text-white/70 text-lg">
                  {formatDateRange(competition?.participationStartDate, competition?.participationEndDate)}
                </span>
              </div>
            </div>

            {/* Judging Period */}
            <div className="relative pr-12">
              <div className={`absolute right-2 top-2 w-4 h-4 rounded-full ring-4 ring-[#111111] ${
                competition?.status === CompetitionStatus.JUDGING ? 'bg-white animate-pulse' : 'bg-white/30'
              }`} />
              <div className={`flex flex-col md:flex-row md:justify-between md:items-center p-4 rounded-xl border ${
                competition?.status === CompetitionStatus.JUDGING 
                  ? 'bg-white/5 border-white/20' 
                  : 'bg-white/5 border-white/5'
              }`}>
                <span className="font-semibold text-white noto-sans-arabic-bold">فترة التحكيم</span>
                <span className="font-mono font-bold text-white/70 text-lg">
                  {formatDateRange(competition?.judgmentStartDate, competition?.judgmentEndDate)}
                </span>
              </div>
            </div>

            {/* Results Announcement */}
            <div className="relative pr-12">
              <div className={`absolute right-2 top-2 w-4 h-4 rounded-full ring-4 ring-[#111111] ${
                competition?.status === CompetitionStatus.COMPLETED ? 'bg-amber-500' : 'bg-amber-500/50 animate-pulse'
              }`} />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-amber-500/5 p-4 rounded-xl border border-amber-500/20">
                <span className="font-semibold text-white noto-sans-arabic-bold">إعلان النتائج</span>
                <span className="font-mono font-bold text-amber-500 text-xl">
                  {competition?.resultsDate ? new Date(competition.resultsDate).toLocaleDateString('en-CA').replace(/-/g, '/') : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="inline-block bg-black text-white/70 text-sm px-5 py-2 rounded-full noto-sans-arabic-medium border border-white/10">
              إجمالي الجوائز: ${competition?.totalPrize || 0}
            </span>
          </div>
        </section>

        {/* Quick Links Section */}
        <section id="quick-links" className="grid grid-cols-1 md:grid-cols-3 gap-4 scroll-mt-20">
          <Link to="/contests/judging-criteria" className="group bg-[#111111] p-5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg noto-sans-arabic-bold">معايير التحكيم</h3>
                <p className="text-gray-600 text-xs mt-1 noto-sans-arabic-medium">متطلبات التأهل</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="/contests/winning-rules" className="group bg-[#111111] p-5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg noto-sans-arabic-bold">قواعد الفوز</h3>
                <p className="text-gray-600 text-xs mt-1 noto-sans-arabic-medium">كيف يتم الاختيار</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="/contests/important-notes" className="group bg-[#111111] p-5 rounded-xl border border-white/5 hover:border-white/20 hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg noto-sans-arabic-bold">ملاحظات هامة</h3>
                <p className="text-gray-600 text-xs mt-1 noto-sans-arabic-medium">الشروط والأحكام</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </section>

        {/* Competition Themes */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black uppercase text-white noto-sans-arabic-extrabold">
              أفكار المسابقة
            </h2>
            <Sparkles className="w-10 h-10 text-white/10 rotate-12" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {competitionThemes.map((theme) => (
              <div 
                key={theme.number}
                className="group relative bg-[#111111] rounded-2xl p-6 border border-white/5 hover:border-white/15 transition-all duration-300 overflow-hidden"
              >
                {/* Number Badge */}
                <div className="absolute top-0 right-0 bg-white/10 text-white/50 font-bold text-4xl px-4 py-6 rounded-bl-3xl z-10 noto-sans-arabic-extrabold">
                  {theme.number}
                </div>

                {/* Content with Image */}
                <div className="flex flex-col md:flex-row gap-4 mr-16 md:mr-20">
                  {/* Image Thumbnail */}
                  <div className="w-full md:w-32 h-48 md:h-24 rounded-xl overflow-hidden flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-500">
                    <img 
                      src={theme.image} 
                      alt={theme.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/5 text-white/50 text-xs font-bold uppercase mb-2 border border-white/10 noto-sans-arabic-bold">
                      {theme.category}
                    </span>
                    <h3 className="font-bold text-xl md:text-2xl mb-2 group-hover:text-white transition-colors noto-sans-arabic-bold text-white/90">
                      {theme.title}
                    </h3>
                    <div className="flex items-end gap-3">
                      <p className="text-gray-500 text-sm md:text-base noto-sans-arabic-medium flex-1">
                        {theme.description}
                      </p>
                      {/* Arrow Button */}
                      <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 border border-white/10">
                        <ArrowRight className="w-5 h-5 text-white/70 rotate-[-135deg]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Note about custom ideas */}
          <p className="text-center text-gray-500 text-sm mt-6 noto-sans-arabic-medium">
            * يمكنك استخدام أي فكرة من خيالك، المهم أن تكون متعلقة بموضوع المسابقة
          </p>
        </section>

        {/* My Participations Section - Only show if user has entries */}
        {myCompetitionEntries.length > 0 && (
          <section className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-3xl p-6 sm:p-8 border border-amber-500/20">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 noto-sans-arabic-extrabold text-white">
              <Trophy className="w-5 h-5 text-amber-500" />
              مشاركاتي في هذه المسابقة
            </h2>
            
            <div className="space-y-3">
              {myCompetitionEntries.map((entry) => (
                <div 
                  key={entry.novelId}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-black/30 rounded-xl p-4 border border-white/5"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Novel Cover */}
                    {entry.novelCoverImageUrl && (
                      <img 
                        src={entry.novelCoverImageUrl} 
                        alt={entry.novelTitle}
                        className="w-12 h-16 object-cover rounded-lg flex-shrink-0 border border-white/10"
                      />
                    )}
                    <div className="min-w-0">
                      <Link 
                        to={`/novel/${entry.novelSlug}`}
                        className="font-bold text-white hover:text-amber-500 transition-colors truncate block noto-sans-arabic-bold"
                      >
                        {entry.novelTitle}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1 noto-sans-arabic-medium">
                        انضممت في {formatDate(entry.joinedAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 flex-shrink-0">
                    {/* Rank */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 noto-sans-arabic-medium">الترتيب</p>
                      <p className={`text-lg font-bold noto-sans-arabic-bold ${
                        entry.currentRank === 1 ? 'text-amber-500' :
                        entry.currentRank === 2 ? 'text-gray-400' :
                        entry.currentRank === 3 ? 'text-amber-700' :
                        'text-white'
                      }`}>
                        {entry.currentRank > 0 ? `#${entry.currentRank}` : '-'}
                      </p>
                    </div>
                    
                    {/* Points */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 noto-sans-arabic-medium">النقاط</p>
                      <p className="text-lg font-bold text-amber-500 noto-sans-arabic-bold">
                        {entry.totalPoints?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    {/* Competition Views */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 noto-sans-arabic-medium">المشاهدات</p>
                      <p className="text-lg font-bold text-white/70 noto-sans-arabic-bold">
                        {entry.competitionViews?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-center text-gray-500 text-xs mt-4 noto-sans-arabic-medium">
              * المشاهدات تُحسب من تاريخ انضمامك للمسابقة
            </p>
          </section>
        )}

        {/* Contest Entries Showcase */}
        <section className="bg-[#111111] rounded-3xl p-6 sm:p-8 border border-white/5">
          <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-wide noto-sans-arabic-extrabold text-white">
            المشاركات المتميزة
          </h2>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-black p-1 rounded-full inline-flex border border-white/10">
              <button 
                onClick={() => handleTabChange('popular')}
                className={`px-6 py-2 rounded-full font-medium transition-colors noto-sans-arabic-medium ${
                  activeTab === 'popular' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                الأكثر نقاطاً
              </button>
              <button 
                onClick={() => handleTabChange('newest')}
                className={`px-6 py-2 rounded-full font-medium transition-colors noto-sans-arabic-medium ${
                  activeTab === 'newest' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                الأحدث
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingNovels && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-white/50" />
            </div>
          )}

          {/* Empty State */}
          {!isLoadingNovels && (!novelsData?.items || novelsData.items.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500 noto-sans-arabic-medium">لا توجد مشاركات حتى الآن</p>
              {competition?.canJoin && (
                <button 
                  onClick={() => setIsJoinModalOpen(true)}
                  className="mt-4 px-6 py-2 bg-white text-black rounded-full font-bold hover:bg-white/90 transition-colors noto-sans-arabic-bold"
                >
                  كن أول مشارك!
                </button>
              )}
            </div>
          )}

          {/* Table Header */}
          {!isLoadingNovels && novelsData?.items?.length > 0 && (
            <>
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wider border-b border-white/5 mb-2 noto-sans-arabic-medium">
                <div className="col-span-1 text-center">الترتيب</div>
                <div className="col-span-7">العمل / الكاتب</div>
                <div className="col-span-2 text-center">النقاط</div>
                <div className="col-span-2 text-center">مشاهدات المسابقة</div>
              </div>

              {/* Entries */}
              <div className="space-y-2">
                {novelsData.items.map((entry, index) => {
                  const rank = entry.currentRank > 0 ? entry.currentRank : (currentPage - 1) * pageSize + index + 1;
                  return (
                    <div 
                      key={entry.id}
                      className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 rounded-lg hover:bg-white/5 transition-colors items-center"
                    >
                      {/* Rank */}
                      <div className="md:col-span-1 flex items-center justify-center">
                        <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-full noto-sans-arabic-bold ${
                          rank === 1 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                          rank === 2 ? 'bg-white/5 text-gray-400 border border-white/10' :
                          rank === 3 ? 'bg-amber-900/20 text-amber-700 border border-amber-700/30' :
                          'text-gray-600 text-sm'
                        }`}>
                          {rank}
                        </span>
                      </div>
                      
                      {/* Novel Info with Cover */}
                      <div className="md:col-span-7 w-full flex items-center gap-3">
                        {entry.novelCoverImageUrl && (
                          <img 
                            src={entry.novelCoverImageUrl} 
                            alt={entry.novelTitle}
                            className="w-10 h-14 object-cover rounded-md flex-shrink-0 border border-white/10"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <Link 
                            to={`/novel/${entry.novelSlug}`} 
                            className="font-bold text-white hover:text-white/70 text-lg md:text-base block truncate noto-sans-arabic-bold"
                          >
                            {entry.novelTitle}
                          </Link>
                          <Link 
                            to={`/profile/${entry.author?.userName}`}
                            className="text-sm text-gray-500 hover:text-gray-400 noto-sans-arabic-medium"
                          >
                            {entry.author?.displayName || entry.author?.userName}
                          </Link>
                        </div>
                      </div>
                      
                      {/* Points */}
                      <div className="md:col-span-2 flex justify-between md:justify-center w-full md:w-auto text-sm">
                        <span className="md:hidden text-gray-600 noto-sans-arabic-medium">النقاط:</span>
                        <span className="font-mono text-amber-500 font-bold">{entry.totalPoints?.toLocaleString() || 0}</span>
                      </div>
                      
                      {/* Views */}
                      <div className="md:col-span-2 flex justify-between md:justify-center w-full md:w-auto text-sm">
                        <span className="md:hidden text-gray-600 noto-sans-arabic-medium">مشاهدات المسابقة:</span>
                        <span className="font-mono text-white/50 font-medium">{entry.competitionViews?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {novelsData.totalPages > 1 && (
                <div className="flex justify-center mt-8 gap-2 flex-wrap">
                  {/* Previous Button */}
                  {currentPage > 1 && (
                    <button 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-500 text-sm"
                    >
                      ←
                    </button>
                  )}
                  
                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, novelsData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (novelsData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= novelsData.totalPages - 2) {
                      pageNum = novelsData.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                          currentPage === pageNum 
                            ? 'bg-white text-black' 
                            : 'hover:bg-white/10 text-gray-500'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {/* Ellipsis and Last Page */}
                  {novelsData.totalPages > 5 && currentPage < novelsData.totalPages - 2 && (
                    <>
                      <span className="w-8 h-8 flex items-center justify-center text-gray-600">...</span>
                      <button 
                        onClick={() => setCurrentPage(novelsData.totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-500 text-sm"
                      >
                        {novelsData.totalPages}
                      </button>
                    </>
                  )}
                  
                  {/* Next Button */}
                  {currentPage < novelsData.totalPages && (
                    <button 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-gray-500 text-sm"
                    >
                      →
                    </button>
                  )}
                </div>
              )}
              
              {/* Total Count */}
              <p className="text-center text-gray-600 text-sm mt-4 noto-sans-arabic-medium">
                إجمالي المشاركات: {novelsData.totalItemsCount?.toLocaleString() || 0}
              </p>
            </>
          )}
        </section>

      </main>

      {/* Floating Join Button */}
      {competition?.canJoin && (
        <div className="fixed bottom-20 md:bottom-6 left-6 z-50">
          <button 
            onClick={() => setIsJoinModalOpen(true)}
            className="w-16 h-16 rounded-full bg-white text-black shadow-2xl flex flex-col items-center justify-center hover:scale-110 transition-transform duration-200 border-2 border-white/20"
          >
            <span className="font-black text-xs leading-none noto-sans-arabic-bold">شارك</span>
            <span className="font-black text-xs leading-none noto-sans-arabic-bold">الآن</span>
          </button>
        </div>
      )}

      {/* Join Competition Modal */}
      <JoinCompetitionModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
        competitionId={competition?.id} 
        competitionName={competition?.name} 
      />

      {/* Footer Spacer */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default ImSpecialContestPage;
