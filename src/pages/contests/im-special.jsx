import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import { 
  Trophy, 
  Calendar, 
  Sparkles, 
  Edit3,
  ArrowUpRight,
  ArrowRight,
  Heart,
  MoreHorizontal,
  CheckCircle
} from 'lucide-react';

// Competition themes data - "I'm Special" themed
const competitionThemes = [
  {
    number: 1,
    category: 'البصر',
    categoryEn: 'Vision',
    color: 'blue',
    title: 'عالم بلا ألوان / رؤية مختلفة',
    titleEn: 'A World Without Colors / Different Vision',
    description: 'ماذا لو كان بطلك يرى العالم بشكل مختلف؟ شخص أعمى يشعر بالألوان، أو يرى ما لا يراه الآخرون.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=300&fit=crop',
  },
  {
    number: 2,
    category: 'السمع',
    categoryEn: 'Hearing', 
    color: 'sky',
    title: 'صمت الموسيقى / إيقاع القلب',
    titleEn: 'The Silence of Music / Heartbeat Rhythm',
    description: 'موسيقي أصم يشعر بالموسيقى من خلال الاهتزازات، أو شخص يسمع أصوات لا يسمعها غيره.',
    image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=300&fit=crop',
  },
  {
    number: 3,
    category: 'العقل',
    categoryEn: 'Mind',
    color: 'pink',
    title: 'عقل مختلف / موهبة خفية',
    titleEn: 'A Different Mind / Hidden Talent',
    description: 'شخص مصاب بالتوحد لديه قدرات خارقة، أو من يعاني من اضطراب نفسي يمنحه رؤية فريدة.',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop',
  },
  {
    number: 4,
    category: 'المظهر',
    categoryEn: 'Appearance',
    color: 'indigo',
    title: 'جمال مختلف / علامة فارقة',
    titleEn: 'Different Beauty / A Unique Mark',
    description: 'شعر أبيض، عيون بلونين مختلفين، وحمة غريبة... ما الذي يجعل اختلافك قوتك؟',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop',
  },
];

// Sample entries
const sampleEntries = [
  { rank: 1, title: 'عيون السماء الصامتة', author: 'نور الكاتبة', collection: 10431 },
  { rank: 2, title: 'أصابع الضوء', author: 'أحمد الروائي', collection: 8937 },
  { rank: 3, title: 'صدى الصمت الجميل', author: 'ليلى القصصية', collection: 8411 },
  { rank: 4, title: 'ألوان الظلام', author: 'محمد الأديب', collection: 8111 },
];

const ImSpecialContestPage = () => {
  const [activeTab, setActiveTab] = useState('popular');

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: 'bg-blue-500', light: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
      sky: { bg: 'bg-sky-400', light: 'bg-sky-400/20', text: 'text-sky-400', border: 'border-sky-400/30' },
      pink: { bg: 'bg-pink-400', light: 'bg-pink-400/20', text: 'text-pink-400', border: 'border-pink-400/30' },
      indigo: { bg: 'bg-indigo-500', light: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-400/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white font-sans" dir="rtl">
      <Header />
      
      {/* Hero Section */}
      <header className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
          <img 
            src="https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&h=1080&fit=crop" 
            alt="Background" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          {/* Prize Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-white text-sm font-medium mb-8 animate-bounce">
            <Trophy className="w-4 h-4 ml-2 text-yellow-400" />
            اربح حتى $800!
          </div>

          {/* Title */}
          <h1 className="text-6xl md:text-8xl font-black text-white mb-4 tracking-tight drop-shadow-xl noto-sans-arabic-extrabold">
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-purple-300">
              أنا
            </span>
            <span className="block mt-[-10px] text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              مُمَيَّز
            </span>
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100 font-medium noto-sans-arabic-medium">
            احتفِ بالاختلاف، اكتب عن شخصيات فريدة تتحدى المألوف!
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex gap-4 flex-wrap justify-center">
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-purple-500/40 hover:scale-105 transition-transform duration-200 flex items-center noto-sans-arabic-bold">
              <Edit3 className="w-5 h-5 ml-2" />
              شارك الآن
            </button>
            <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-colors noto-sans-arabic-bold">
              المزيد من التفاصيل
            </button>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 w-full leading-none">
          <svg className="block w-full h-12 sm:h-24" preserveAspectRatio="none" viewBox="0 0 1440 320">
            <path 
              className="fill-[#1E1E1E]" 
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </svg>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
        
        {/* Awards Section */}
        <section className="relative">
          <div className="flex items-center justify-center mb-10">
            <div className="bg-gray-900 text-yellow-400 px-6 py-2 rounded-t-xl font-bold text-2xl uppercase tracking-wider flex items-center border-b-4 border-yellow-400 noto-sans-arabic-extrabold">
              <Trophy className="w-6 h-6 ml-2" />
              الجوائز
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Silver */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 text-center transform md:translate-y-8 shadow-xl border border-[#3C3C3C]">
              <div className="w-20 h-20 mx-auto bg-gray-600/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Trophy className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-2xl text-gray-400 mb-2 noto-sans-arabic-bold">الفضية</h3>
              <div className="text-[#4A9EFF] font-bold text-3xl mb-1 noto-sans-arabic-extrabold">$400</div>
              <p className="text-gray-500 text-sm noto-sans-arabic-medium">فائز واحد</p>
            </div>

            {/* Gold */}
            <div className="bg-gradient-to-b from-yellow-900/20 to-[#2C2C2C] rounded-2xl p-8 text-center shadow-xl transform md:-translate-y-4 border-2 border-yellow-500/50 relative z-20">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-yellow-900 font-bold px-4 py-1 rounded-full text-xs uppercase noto-sans-arabic-bold">
                الجائزة الكبرى
              </div>
              <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Trophy className="w-12 h-12 text-yellow-400" />
              </div>
              <h3 className="font-bold text-3xl text-yellow-400 mb-2 noto-sans-arabic-bold">الذهبية</h3>
              <div className="text-[#4A9EFF] font-bold text-5xl mb-1 noto-sans-arabic-extrabold">$800</div>
              <p className="text-gray-400 font-medium noto-sans-arabic-medium">فائز واحد</p>
            </div>

            {/* Bronze */}
            <div className="bg-[#2C2C2C] rounded-2xl p-6 text-center transform md:translate-y-8 shadow-xl border border-[#3C3C3C]">
              <div className="w-20 h-20 mx-auto bg-orange-900/30 rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Trophy className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="font-bold text-2xl text-orange-600 mb-2 noto-sans-arabic-bold">البرونزية</h3>
              <div className="text-[#4A9EFF] font-bold text-3xl mb-1 noto-sans-arabic-extrabold">$200</div>
              <p className="text-gray-500 text-sm noto-sans-arabic-medium">فائزان</p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-12 noto-sans-arabic-medium">
            *يجب أن تحتوي الروايات الفائزة على أكثر من 5000 كلمة
          </p>
        </section>

        {/* Timeline Section */}
        <section className="bg-[#2C2C2C] rounded-3xl p-8 border border-[#3C3C3C] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-10">
            <Calendar className="w-32 h-32 text-white" />
          </div>

          <h2 className="text-3xl font-bold mb-8 flex items-center noto-sans-arabic-extrabold text-white">
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-xl ml-4 shadow-lg">
              <Calendar className="w-6 h-6" />
            </span>
            الجدول الزمني
          </h2>

          <div className="space-y-6 relative">
            <div className="absolute right-4 top-4 bottom-4 w-0.5 bg-[#3C3C3C]" />

            {/* Participation */}
            <div className="relative pr-12">
              <div className="absolute right-2 top-2 w-4 h-4 rounded-full bg-green-500 ring-4 ring-[#2C2C2C]" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-[#3C3C3C] p-4 rounded-xl border border-[#4A4A4A]">
                <span className="font-semibold text-white noto-sans-arabic-bold">فترة المشاركة</span>
                <span className="font-mono font-bold text-[#4A9EFF] text-lg">2025/01/01 ~ 2025/03/31</span>
              </div>
            </div>

            {/* Selection */}
            <div className="relative pr-12">
              <div className="absolute right-2 top-2 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-[#2C2C2C]" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-[#3C3C3C] p-4 rounded-xl border border-[#4A4A4A]">
                <span className="font-semibold text-white noto-sans-arabic-bold">فترة التحكيم</span>
                <span className="font-mono font-bold text-[#4A9EFF] text-lg">2025/04/01 ~ 2025/04/15</span>
              </div>
            </div>

            {/* Announcement */}
            <div className="relative pr-12">
              <div className="absolute right-2 top-2 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-[#2C2C2C] animate-pulse" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-center bg-gradient-to-l from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-500/30">
                <span className="font-semibold text-white noto-sans-arabic-bold">إعلان النتائج</span>
                <span className="font-mono font-bold text-purple-400 text-xl">2025/04/20</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <span className="inline-block bg-[#1E1E1E] text-white text-sm px-5 py-2 rounded-full noto-sans-arabic-medium border border-[#3C3C3C]">
              صرف الجوائز: 2025/05/01
            </span>
          </div>
        </section>

        {/* Quick Links Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="#" className="group bg-gradient-to-r from-blue-600 to-indigo-700 p-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg uppercase noto-sans-arabic-bold">معايير التحكيم</h3>
                <p className="text-gray-400 text-xs mt-1 noto-sans-arabic-medium">متطلبات التأهل</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="#" className="group bg-gradient-to-r from-indigo-600 to-purple-700 p-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg uppercase noto-sans-arabic-bold">قواعد الفوز</h3>
                <p className="text-gray-400 text-xs mt-1 noto-sans-arabic-medium">كيف يتم الاختيار</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>

          <Link to="#" className="group bg-gradient-to-r from-purple-600 to-pink-700 p-1 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
            <div className="bg-gray-900 rounded-lg p-4 h-full flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg uppercase noto-sans-arabic-bold">ملاحظات هامة</h3>
                <p className="text-gray-400 text-xs mt-1 noto-sans-arabic-medium">الشروط والأحكام</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </Link>
        </section>

        {/* Competition Themes */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 noto-sans-arabic-extrabold">
              أفكار المسابقة
            </h2>
            <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600 rotate-12" />
          </div>

          <div className="grid grid-cols-1 gap-6">
            {competitionThemes.map((theme) => {
              const colorClasses = getColorClasses(theme.color);
              return (
                <div 
                  key={theme.number}
                  className="group relative bg-[#2C2C2C] rounded-2xl p-6 border border-[#3C3C3C] hover:border-purple-500/50 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden"
                >
                  {/* Number Badge */}
                  <div className={`absolute top-0 right-0 ${colorClasses.bg} text-white font-bold text-4xl px-4 py-6 rounded-bl-3xl z-10 noto-sans-arabic-extrabold`}>
                    {theme.number}
                  </div>

                  {/* Content with Image */}
                  <div className="flex flex-col md:flex-row gap-4 mr-16 md:mr-20">
                    {/* Image Thumbnail */}
                    <div className="w-full md:w-32 h-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={theme.image} 
                        alt={theme.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 rounded-full ${colorClasses.light} ${colorClasses.text} text-xs font-bold uppercase mb-2 border ${colorClasses.border} noto-sans-arabic-bold`}>
                        {theme.category}
                      </span>
                      <h3 className="font-bold text-xl md:text-2xl mb-2 group-hover:text-purple-400 transition-colors noto-sans-arabic-bold text-white">
                        {theme.title}
                      </h3>
                      <p className="text-gray-400 text-sm md:text-base mb-4 noto-sans-arabic-medium">
                        {theme.description}
                      </p>
                    </div>
                  </div>

                  {/* Arrow Button */}
                  <div className="flex justify-start mt-4">
                    <button className="w-10 h-10 rounded-full bg-lime-400 hover:bg-lime-500 flex items-center justify-center transition-colors shadow-lg shadow-lime-400/30">
                      <ArrowRight className="w-5 h-5 text-gray-900 rotate-[-135deg]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Contest Entries Showcase */}
        <section className="bg-[#2C2C2C] rounded-3xl p-6 sm:p-8 border border-[#3C3C3C] shadow-xl">
          <h2 className="text-2xl font-bold mb-6 text-center uppercase tracking-wide noto-sans-arabic-extrabold text-white">
            المشاركات المتميزة
          </h2>

          {/* Tabs */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#1E1E1E] p-1 rounded-full inline-flex">
              <button 
                onClick={() => setActiveTab('popular')}
                className={`px-6 py-2 rounded-full font-medium transition-colors noto-sans-arabic-medium ${
                  activeTab === 'popular' ? 'bg-[#4A9EFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                الأكثر قراءة
              </button>
              <button 
                onClick={() => setActiveTab('newest')}
                className={`px-6 py-2 rounded-full font-medium transition-colors noto-sans-arabic-medium ${
                  activeTab === 'newest' ? 'bg-[#4A9EFF] text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                الأحدث
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-[#3C3C3C] mb-2 noto-sans-arabic-medium">
            <div className="col-span-1 text-center">الترتيب</div>
            <div className="col-span-9">العمل / الكاتب</div>
            <div className="col-span-2 text-left">المجموعات</div>
          </div>

          {/* Entries */}
          <div className="space-y-2">
            {sampleEntries.map((entry) => (
              <div 
                key={entry.rank}
                className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 rounded-lg hover:bg-[#3C3C3C] transition-colors items-center"
              >
                <div className="md:col-span-1 flex items-center justify-center">
                  <span className={`w-8 h-8 flex items-center justify-center font-bold rounded-full noto-sans-arabic-bold ${
                    entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    entry.rank === 2 ? 'bg-[#3C3C3C] text-gray-400' :
                    entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                    'text-gray-500 text-sm'
                  }`}>
                    {entry.rank}
                  </span>
                </div>
                <div className="md:col-span-9 w-full">
                  <Link to="#" className="font-bold text-[#4A9EFF] hover:underline text-lg md:text-base block truncate noto-sans-arabic-bold">
                    {entry.title}
                  </Link>
                  <span className="text-sm text-gray-500 noto-sans-arabic-medium">{entry.author}</span>
                </div>
                <div className="md:col-span-2 flex justify-between md:justify-start w-full md:w-auto text-sm">
                  <span className="md:hidden text-gray-500 noto-sans-arabic-medium">المجموعات:</span>
                  <span className="font-mono text-green-400 font-medium">{entry.collection.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#4A9EFF] text-white text-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3C3C3C] text-gray-400 text-sm">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3C3C3C] text-gray-400 text-sm">3</button>
            <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#3C3C3C] text-gray-400 text-sm">79</button>
          </div>
        </section>

      </main>

      {/* Floating Join Button */}
      <div className="fixed bottom-20 md:bottom-6 left-6 z-50">
        <button className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl flex flex-col items-center justify-center hover:scale-110 transition-transform duration-200 border-4 border-[#1E1E1E]">
          <span className="font-black text-xs leading-none noto-sans-arabic-bold">شارك</span>
          <span className="font-black text-xs leading-none noto-sans-arabic-bold">الآن</span>
        </button>
      </div>

      {/* Footer Spacer */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default ImSpecialContestPage;
