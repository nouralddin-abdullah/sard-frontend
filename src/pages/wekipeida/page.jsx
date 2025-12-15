import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";
import backgroundImage from "../../assets/wekipedia-background.jpg";
import step1Image from "../../assets/wekepdia-step1.png";
import step1Video from "../../assets/Timelinsde 1.mp4";
import step3Video from "../../assets/step3-video.mp4";
import step4Image from "../../assets/step4-entitypreview.png";

const WekipeidaTutorial = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { data: currentUser } = useGetLoggedInUser();

  const handleStartClick = () => {
    if (currentUser) {
      navigate("/dashboard/works");
    } else {
      setIsAuthModalOpen(true);
    }
  };

  useEffect(() => {
    const scrollContainer = document.querySelector('.scroll-snap-container');
    
    const handleScroll = () => {
      if (!scrollContainer) return;
      
      const sections = document.querySelectorAll('.scroll-snap-section');
      const scrollPosition = scrollContainer.scrollTop + scrollContainer.clientHeight / 2;

      sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(index);
        }
      });
    };

    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial call
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>دليل ويكبيديا - سرد</title>
        <meta name="description" content="تعلم كيفية استخدام ويكبيديا سرد بكل سهولة" />
      </Helmet>

      <div className="fixed inset-0 text-[#3D2817] overflow-hidden">

        {/* Navigation Dots */}
        <nav className="fixed top-1/2 left-4 md:left-8 -translate-y-1/2 z-50">
          <div className="flex flex-col items-center gap-4">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <a
                key={index}
                href={`#section-${index}`}
                aria-label={`Go to section ${index + 1}`}
                className={`block w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeSection === index
                    ? "bg-[#B76E4F] scale-125"
                    : "bg-[#3D2817]/30 hover:bg-[#B76E4F]/70"
                }`}
              ></a>
            ))}
          </div>
        </nav>

        {/* Scroll Container */}
        <div className="scroll-snap-container w-full h-full" style={{ 
          scrollSnapType: 'y mandatory', 
          overflowY: 'scroll', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}>
          <style>{`
            .scroll-snap-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {/* Hero Section */}
          <section id="section-0" className="scroll-snap-section px-4" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="flex min-h-[480px] w-full flex-col gap-6 items-center justify-center p-4 text-center">
              <div className="flex flex-col gap-4 backdrop-blur-xl bg-white/70 p-8 md:p-12 rounded-2xl shadow-xl">
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight noto-sans-arabic-extrabold text-[#3D2817]">
                  مرحباً بك في ويكبيديا سرد
                </h1>
                <h2 className="text-lg md:text-xl text-[#3D2817] noto-sans-arabic-regular" style={{ fontFamily: 'Markazi Text, serif' }}>
                  ابدع موسوعة روايتك وأحيِ عالمك الخاص
                </h2>
              </div>
              <a 
                href="#section-1"
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-gradient-to-r from-[#B76E4F] to-[#8B5A3C] hover:from-[#8B5A3C] hover:to-[#B76E4F] text-white text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#B76E4F]/30 mt-4 noto-sans-arabic-bold"
              >
                <span>ابدأ الدليل</span>
              </a>
            </div>
          </section>

          {/* Step 1 Section */}
          <section id="section-1" className="scroll-snap-section px-4 py-16" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div className="order-2 md:order-1 text-center md:text-right backdrop-blur-xl bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-[#B76E4F] text-lg font-bold noto-sans-arabic-bold">01</h3>
                  <h4 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-1 text-[#3D2817] noto-sans-arabic-bold">ما هي ويكبيديا سرد؟</h4>
                  <p className="text-[#3D2817] text-base leading-normal mt-3 max-w-md mx-auto md:mx-0 md:mr-0 noto-sans-arabic-regular" style={{ fontFamily: 'Markazi Text, serif' }}>
                    موسوعة تفاعلية لروايتك تتيح لك إنشاء وتوثيق الشخصيات والأماكن والأشياء والفصائل والمزيد. امنح قراءك عالماً متكاملاً يستكشفونه
                  </p>
                </div>
                <div className="order-1 md:order-2 w-full h-auto rounded-lg overflow-hidden scale-110">
                  <img 
                    src={step1Image}
                    alt="ما هي ويكبيديا سرد؟"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 2 Section */}
          <section id="section-2" className="scroll-snap-section px-4 py-16" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div className="order-1 md:order-2 text-center md:text-right backdrop-blur-xl bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-[#B76E4F] text-lg font-bold noto-sans-arabic-bold">02</h3>
                  <h4 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-1 text-[#3D2817] noto-sans-arabic-bold">أنشئ فئات وعناصر</h4>
                  <p className="text-[#3D2817] text-base leading-normal mt-3 max-w-md mx-auto md:mx-0 md:mr-0 noto-sans-arabic-regular" style={{ fontFamily: 'Markazi Text, serif' }}>
                    قم بإنشاء فئات خاصة بروايتك (شخصيات، أماكن، أشياء، فصائل)، ثم أضف عناصر داخل كل فئة مع تفاصيلها وصورها
                  </p>
                </div>
                <div className="order-2 md:order-1 w-full h-auto aspect-video rounded-lg overflow-hidden">
                  <video 
                    src={step1Video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 3 Section */}
          <section id="section-3" className="scroll-snap-section px-4 py-16" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div className="order-2 md:order-1 text-center md:text-right backdrop-blur-xl bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-[#B76E4F] text-lg font-bold noto-sans-arabic-bold">03</h3>
                  <h4 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-1 text-[#3D2817] noto-sans-arabic-bold">خصص وأضف التفاصيل</h4>
                  <p className="text-[#3D2817] text-base leading-normal mt-3 max-w-md mx-auto md:mx-0 md:mr-0 noto-sans-arabic-regular" style={{ fontFamily: 'Markazi Text, serif' }}>
                    أضف خصائص مفردة أو قوائم لكل عنصر، واملأ التفاصيل والوصف والعلاقات. أحيِ عالمك ببيانات غنية ومنظمة
                  </p>
                </div>
                <div className="order-1 md:order-2 w-full h-auto aspect-video rounded-lg overflow-hidden">
                  <video 
                    src={step3Video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Step 4 Section */}
          <section id="section-4" className="scroll-snap-section px-4 py-16" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
                <div className="order-2 md:order-1 text-center md:text-right backdrop-blur-xl bg-white/70 p-6 md:p-8 rounded-2xl shadow-xl">
                  <h3 className="text-[#B76E4F] text-lg font-bold noto-sans-arabic-bold">04</h3>
                  <h4 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mt-1 text-[#3D2817] noto-sans-arabic-bold">هكذا يرى القراء عالمك</h4>
                  <p className="text-[#3D2817] text-base leading-normal mt-3 max-w-md mx-auto md:mx-0 md:mr-0 noto-sans-arabic-regular" style={{ fontFamily: 'Markazi Text, serif' }}>
                    صفحات جميلة ومنظمة تعرض كل عنصر بتفاصيله وصوره. يستكشف القراء موسوعتك بسهولة ويغوصون في عمق عالم روايتك
                  </p>
                </div>
                <div className="order-1 md:order-2 w-full h-auto rounded-lg overflow-hidden">
                  <img 
                    src={step4Image}
                    alt="هكذا يرى القراء عالمك"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section id="section-5" className="scroll-snap-section px-4" style={{ scrollSnapAlign: 'start', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="flex min-h-[480px] w-full flex-col gap-6 items-center justify-center p-4 text-center">
              <div className="flex flex-col gap-4 backdrop-blur-xl bg-white/70 p-8 md:p-12 rounded-2xl shadow-xl">
                <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight text-[#3D2817] noto-sans-arabic-extrabold">
                  أنت جاهز الآن
                </h1>
              </div>
              <button
                onClick={handleStartClick}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-8 bg-gradient-to-r from-[#B76E4F] to-[#8B5A3C] hover:from-[#8B5A3C] hover:to-[#B76E4F] text-white text-base font-bold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-[#B76E4F]/30 mt-4 noto-sans-arabic-bold"
              >
                <span>ابدأ استكشاف ويكبيديا</span>
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionDescription="الوصول إلى أدوات الكاتب"
      />
    </>
  );
};

export default WekipeidaTutorial;
