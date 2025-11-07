import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Sparkles, Users, TrendingUp, Heart, MessageCircle, Smile, Search, Compass, Swords, Wand2, Rocket, Zap, Drama, Laugh, Ghost } from "lucide-react";
import Header from "../../components/common/Header";
import { useGetRankings } from "../../hooks/novel/useGetRankings";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { translateGenre } from "../../utils/translate-genre";
import landingSImage from "../../assets/Landing-S.png";
import landingTextImage from "../../assets/Landing-textinmiddleofit.png";
import landing3Image from "../../assets/Landing-3.png";

// Icon mapping for genres
const GENRE_ICONS = {
  romance: Heart,
  action: Swords,
  fantasy: Wand2,
  "science-fiction": Rocket,
  mystery: Search,
  thriller: Zap,
  drama: Drama,
  comedy: Laugh,
  horror: Ghost,
  adventure: Compass,
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { data: trendingData, isLoading } = useGetRankings("Trending", 8);
  const { data: genres, isLoading: genresLoading } = useGetGenresList();

  // Typing animation states
  const [typingText, setTypingText] = React.useState("");
  const [currentSearchIndex, setCurrentSearchIndex] = React.useState(0);
  
  const searchPhrases = [
    "رواية رومانسية",
    "قصة خيال علمي",
    "مغامرات مثيرة",
    "رواية غموض",
    "قصة فانتازيا",
    "أكشن وإثارة"
  ];

  React.useEffect(() => {
    let currentPhrase = searchPhrases[currentSearchIndex];
    let currentChar = 0;
    let isDeleting = false;

    const typingInterval = setInterval(() => {
      if (!isDeleting && currentChar <= currentPhrase.length) {
        setTypingText(currentPhrase.substring(0, currentChar));
        currentChar++;
      } else if (!isDeleting && currentChar > currentPhrase.length) {
        setTimeout(() => {
          isDeleting = true;
        }, 2000);
      } else if (isDeleting && currentChar > 0) {
        currentChar--;
        setTypingText(currentPhrase.substring(0, currentChar));
      } else if (isDeleting && currentChar === 0) {
        isDeleting = false;
        setCurrentSearchIndex((prev) => (prev + 1) % searchPhrases.length);
        clearInterval(typingInterval);
      }
    }, isDeleting ? 50 : 100);

    return () => clearInterval(typingInterval);
  }, [currentSearchIndex]);

  const features = [
    {
      icon: BookOpen,
      title: "اكتشف قصصاً لا حصر لها",
      description: "ملايين الروايات والقصص من كتّاب موهوبين حول العالم",
    },
    {
      icon: Sparkles,
      title: "اكتب قصتك الخاصة",
      description: "شارك إبداعك مع ملايين القراء واحصل على تقييمات فورية",
    },
    {
      icon: Users,
      title: "انضم لمجتمعنا",
      description: "تواصل مع القراء والكتاب وشارك في مناقشات مثيرة",
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#1C1C1C]">
        {/* Hero Section with S Image on Left and Text on Right */}
        <section className="relative py-20 px-6 overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#4A9EFF]/10 to-transparent pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Side - S Image with Floating Comments */}
              <div className="relative flex-shrink-0 w-full lg:w-1/2 max-w-md lg:max-w-lg">
                <div className="relative">
                  <img 
                    src={landingSImage} 
                    alt="Sard Logo" 
                    className="w-full h-auto object-contain"
                  />
                  
                  {/* Floating Comment 1 */}
                  <div className="absolute top-10 right-5 bg-[#2C2C2C] border border-gray-700 rounded-2xl p-3 shadow-lg animate-float" style={{ animationDelay: '0s' }}>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-[#4A9EFF] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white text-sm noto-sans-arabic-medium">رواية رائعة! 🔥</p>
                        <div className="flex gap-1 mt-1">
                          <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                          <span className="text-xs text-gray-400">12</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Comment 2 - Reply */}
                  <div className="absolute top-32 right-16 bg-[#2C2C2C] border border-gray-700 rounded-2xl p-3 shadow-lg animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-[#4A9EFF] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white text-sm noto-sans-arabic-medium">فعلاً مبدع الكاتب 👏</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Comment 3 */}
                  <div className="absolute bottom-20 left-10 bg-[#2C2C2C] border border-gray-700 rounded-2xl p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                    <div className="flex items-start gap-2">
                      <MessageCircle className="w-4 h-4 text-[#4A9EFF] flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-white text-sm noto-sans-arabic-medium">متشوق للفصل القادم 🥳</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating Emojis */}
                  <div className="absolute top-5 left-10 text-3xl animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '2s' }}>
                    ❤️
                  </div>
                  <div className="absolute top-40 left-5 text-2xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '2.5s' }}>
                    😍
                  </div>
                  <div className="absolute bottom-32 right-5 text-2xl animate-bounce" style={{ animationDelay: '1.2s', animationDuration: '2.2s' }}>
                    🔥
                  </div>
                  <div className="absolute bottom-10 left-20 text-xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '2.8s' }}>
                    ⭐
                  </div>
                  <div className="absolute top-24 left-32 text-xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
                    📚
                  </div>
                </div>
              </div>

              {/* Right Side - Hero Text and CTAs */}
              <div className="flex-1 text-center lg:text-right">
                <h1 className="text-5xl md:text-7xl text-white noto-sans-arabic-bold mb-6 leading-tight">
                  اكتشف عالماً من
                  <span className="text-[#4A9EFF]"> الإبداع</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 noto-sans-arabic-medium mb-8">
                  اقرأ واكتب وشارك قصصك المفضلة مع ملايين القراء حول العالم
                </p>
                <div className="flex gap-4 justify-center lg:justify-end flex-wrap">
                  <Link
                    to="/home"
                    className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white px-8 py-4 rounded-xl noto-sans-arabic-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    ابدأ القراءة الآن
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#2C2C2C] hover:bg-[#3C3C3C] text-white px-8 py-4 rounded-xl noto-sans-arabic-bold text-lg transition-all border border-gray-700"
                  >
                    إنشاء حساب مجاني
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Now Section */}
        <section className="py-16 px-6 bg-[#2C2C2C]/30">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <TrendingUp className="w-8 h-8 text-[#4A9EFF]" />
              <h2 className="text-3xl md:text-4xl text-white noto-sans-arabic-bold">
                الأكثر رواجاً الآن
              </h2>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-[#3C3C3C] rounded-xl aspect-[3/4] mb-2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {trendingData?.items?.slice(0, 8).map((novel) => (
                  <Link
                    key={novel.id}
                    to={`/novel/${novel.slug}`}
                    className="group cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-xl mb-2 transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl shadow-lg aspect-[3/4]">
                      <img
                        src={novel.coverImageUrl}
                        alt={novel.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-white text-sm noto-sans-arabic-bold line-clamp-2">
                          {novel.title}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 text-[#4A9EFF] hover:text-[#3A8EEF] noto-sans-arabic-bold text-lg transition-colors"
              >
                عرض المزيد
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Search Section with Image and Typing Animation */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Left Side - Text */}
              <div className="flex-1 text-center lg:text-right">
                <h2 className="text-4xl md:text-5xl text-white noto-sans-arabic-bold mb-6 leading-tight">
                  جميع الأنواع. جميع القصص.
                  <br />
                  <span className="text-[#4A9EFF]">كل ما تبحث عنه.</span>
                </h2>
                <p className="text-xl text-gray-300 noto-sans-arabic-medium mb-8">
                  اكتشف روايتك القادمة المفضلة، أياً كان اهتمامك أو حالتك المزاجية.
                </p>
                <div className="flex justify-center lg:justify-center">
                  <Link
                    to="/home"
                    className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white px-8 py-4 rounded-xl noto-sans-arabic-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
                  >
                    ابدأ الاستكشاف الآن
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>

              {/* Right Side - Image with Search Bar Overlay */}
              <div className="flex-shrink-0 w-full lg:w-1/2 max-w-lg relative">
                <img 
                  src={landing3Image} 
                  alt="Search" 
                  className="w-full h-auto object-contain"
                />
                
                {/* Decorative Search Bar Overlay - Positioned Lower */}
                <div className="absolute top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-md">
                  <div className="relative pointer-events-none">
                    <div className="bg-white rounded-full px-6 py-4 pr-14 shadow-2xl border-2 border-gray-200">
                      <div className="text-gray-800 noto-sans-arabic-medium text-right" dir="rtl">
                        {typingText}
                        <span className="inline-block w-0.5 h-5 bg-[#4A9EFF] animate-pulse ml-1 align-middle"></span>
                      </div>
                    </div>
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Genre Showcase Section with Background Image */}
        <section 
          className="w-full py-16 px-4 relative bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(28, 28, 28, 0.75), rgba(28, 28, 28, 0.75)), url(${landingTextImage})`
          }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-3 noto-sans-arabic-extrabold">
                استكشف حسب النوع
              </h2>
              <p className="text-[#AAAAAA] text-lg noto-sans-arabic-medium">
                اختر النوع المفضل لديك واكتشف أفضل الروايات
              </p>
            </div>

            {/* Genre Grid */}
            {genresLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-48 bg-[#3A3A3A] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {genres?.map((genre) => {
                  const IconComponent = GENRE_ICONS[genre.slug] || Compass;
                  
                  return (
                    <button
                      key={genre.id}
                      onClick={() => navigate(`/genre/${genre.slug}`)}
                      className="group relative bg-gradient-to-br from-[#3A3A3A] to-[#2A2A2A] rounded-2xl p-6 hover:from-[#4A9EFF] hover:to-[#3A7EDF] transition-all duration-500 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
                      style={{ 
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(74, 158, 255, 0.1)'
                      }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(74, 158, 255, 0.3) 0%, transparent 50%)`
                        }} />
                      </div>

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center justify-center min-h-[140px] gap-4">
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#4A9EFF]/20 to-[#3A7EDF]/20 flex items-center justify-center group-hover:from-white/20 group-hover:to-white/10 transition-all duration-500 group-hover:scale-110">
                          <IconComponent className="w-8 h-8 text-[#4A9EFF] group-hover:text-white transition-colors duration-500" />
                        </div>

                        {/* Genre Name */}
                        <div className="text-center">
                          <h3 className="text-white text-lg font-bold noto-sans-arabic-bold mb-1 group-hover:scale-105 transition-transform duration-300">
                            {translateGenre(genre.name)}
                          </h3>
                          <p className="text-[#AAAAAA] text-xs noto-sans-arabic-regular line-clamp-2 group-hover:text-white/80 transition-colors duration-300">
                            {genre.description}
                          </p>
                        </div>
                      </div>

                      {/* Hover Shine Effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl text-white noto-sans-arabic-bold text-center mb-12">
              لماذا تختار منصتنا؟
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-[#2C2C2C] rounded-2xl p-8 border border-gray-700 hover:border-[#4A9EFF] transition-colors"
                  >
                    <div className="w-16 h-16 bg-[#4A9EFF]/10 rounded-full flex items-center justify-center mb-6">
                      <Icon className="w-8 h-8 text-[#4A9EFF]" />
                    </div>
                    <h3 className="text-2xl text-white noto-sans-arabic-bold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 noto-sans-arabic-medium text-lg">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl text-white noto-sans-arabic-bold mb-6">
              هل أنت مستعد للبدء؟
            </h2>
            <p className="text-xl text-gray-300 noto-sans-arabic-medium mb-8">
              انضم إلى آلاف الكتاب والقراء اليوم
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/register"
                className="bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white px-8 py-4 rounded-xl noto-sans-arabic-bold text-lg transition-all transform hover:scale-105 flex items-center gap-2"
              >
                ابدأ الآن مجاناً
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="bg-transparent hover:bg-[#2C2C2C] text-white px-8 py-4 rounded-xl noto-sans-arabic-bold text-lg transition-all border border-gray-700"
              >
                لدي حساب بالفعل
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-gray-800">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-gray-500 noto-sans-arabic-medium">
              © 2025 منصة الروايات العربية. جميع الحقوق محفوظة.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
