import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import metsardBg from "../../assets/metsard-1.jpg";
import sardAuthorImg from "../../assets/sard-author.png";

const MetsardPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: "المميزات الأساسية" },
    { id: 1, title: "مسابقات الكتابة" },
  ];

  return (
    <div className="min-h-screen bg-[#1C1C1C] relative">
      <Helmet>
        <title>مميزات الكتّاب في سرد | انضم لمجتمع الكتاب العرب</title>
        <meta
          name="description"
          content="اكتشف مميزات الكتابة في سرد - نظام الهدايا، المسابقات، حقوق النشر والمزيد. انضم لأكثر من 400,000 كاتب عربي."
        />
      </Helmet>

      {/* Top Banner with Tabs */}
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex-shrink-0">
            <h1 className="noto-sans-arabic-extrabold text-white text-[32px] md:text-[40px] leading-none cursor-pointer hover:opacity-80 transition-opacity">
              سَرْد
            </h1>
          </Link>

          {/* Tabs - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-sm font-bold tracking-wider transition-all duration-300 pb-1 border-b-2 noto-sans-arabic-bold ${activeTab === tab.id
                  ? "text-white border-[#4A9EFF]"
                  : "text-gray-400 border-transparent hover:text-gray-200"
                  }`}
              >
                {tab.title}
              </button>
            ))}
          </div>

          {/* CTA Button */}
          <Link
            to="/dashboard/works"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4A9EFF] hover:bg-[#3A8EEF] text-white rounded-full font-bold transition-all transform hover:scale-105 shadow-lg noto-sans-arabic-bold"
          >
            <span>ابدأ الآن</span>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.3034 15.3033V15.3033C12.3742 18.2325 7.62586 18.2325 4.69669 15.3033V15.3033C1.76753 12.3742 1.76753 7.62583 4.69669 4.69666V4.69666C7.62586 1.76749 12.3742 1.76749 15.3034 4.69666V4.69666C18.2325 7.62583 18.2325 12.3742 15.3034 15.3033Z" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12.5 7.5L7.5 12.5" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8.75 7.5H12.5V11.25" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        {/* Tabs - Mobile */}
        <div className="md:hidden flex items-center gap-4 px-4 pb-3 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 pb-1 border-b-2 noto-sans-arabic-bold ${activeTab === tab.id
                ? "text-white border-[#4A9EFF]"
                : "text-gray-400 border-transparent"
                }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <main className="relative w-full min-h-screen">
        {/* Background Image - Extended to cover guide section */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${metsardBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 py-20 max-w-6xl mx-auto">

          {/* Tab Content Based on activeTab */}
          {activeTab === 0 && (
            <>
              {/* Top Part: Author Image */}
              <div className="flex flex-col items-center text-center mb-12">
                <img
                  src={sardAuthorImg}
                  alt="Sard Author"
                  className="w-96 md:w-[30rem] h-auto drop-shadow-2xl animate-fade-in"
                />
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

                {/* Card 1: Authors */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
                    style={{ backgroundImage: `url(${metsardBg})` }}>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-4xl font-bold text-white mb-2">+10 <br />كاتب</div>
                      </div>
                      <div className="transition-transform group-hover:scale-110">
                        <span className="noto-sans-arabic-extrabold text-white text-3xl leading-none inline-block">
                          سَرْد
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200 mb-4 leading-relaxed noto-sans-arabic-regular">
                      انطلق بقصتك على <span className="text-[#4A9EFF] font-bold noto-sans-arabic-bold">سرد</span> مع كتّاب من +5 دولة ومنطقة!
                    </p>
                    <div className="h-px bg-white/30 my-3 group-hover:bg-[#4A9EFF]/50 transition-colors" />
                    <div className="text-xs text-gray-300 tracking-wider font-bold noto-sans-arabic-bold group-hover:text-white transition-colors">سرد انطلق في 2024</div>
                  </div>
                </div>

                {/* Card 2: Readers */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
                    style={{ backgroundImage: `url(${metsardBg})` }}>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-white leading-tight noto-sans-arabic-bold">القرّاء <br />يدفعون لفتح الفصول</div>
                      </div>
                      <div className="bg-white/20 p-3 rounded-lg group-hover:bg-[#4A9EFF]/30 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 25 24" fill="none" className="transition-transform group-hover:scale-110">
                          <path fillRule="evenodd" clipRule="evenodd" d="M17.3475 17.2942L16.0349 20.3565C15.8655 20.7513 15.476 21.0061 15.0464 21.003C14.6168 21 14.2309 20.7397 14.0671 20.3425L10.4156 11.4758C10.2514 11.0773 10.343 10.6191 10.6478 10.3144C10.9525 10.0096 11.4107 9.91802 11.8092 10.0822L20.6759 13.7337C21.073 13.8975 21.3333 14.2834 21.3364 14.713C21.3395 15.1426 21.0847 15.5321 20.6899 15.7015L17.6276 17.0141C17.5017 17.0679 17.4013 17.1683 17.3475 17.2942V17.2942Z" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M6.69398 15.3334L5.57251 16.4549" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M11.1809 2.99625V4.58191" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M5.57251 5.23918L6.69398 6.36065" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M3.32959 10.8475H4.91525" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                          <path d="M16.7882 5.23918L15.6667 6.36065" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-200 mb-4 noto-sans-arabic-regular group-hover:text-white transition-colors">
                      اقرأ مجانًا للتجربة،<br />ثم افتح بالعملات.
                    </p>
                    <button className="w-full py-2.5 bg-white/10 hover:bg-[#4A9EFF]/50 rounded-lg text-sm font-bold text-white transition-all flex items-center justify-center gap-2 noto-sans-arabic-bold group-hover:shadow-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 25 24" fill="none" className="transition-transform group-hover:rotate-12">
                        <path fillRule="evenodd" clipRule="evenodd" d="M17.3475 17.2942L16.0349 20.3565C15.8655 20.7513 15.476 21.0061 15.0464 21.003C14.6168 21 14.2309 20.7397 14.0671 20.3425L10.4156 11.4758C10.2514 11.0773 10.343 10.6191 10.6478 10.3144C10.9525 10.0096 11.4107 9.91802 11.8092 10.0822L20.6759 13.7337C21.073 13.8975 21.3333 14.2834 21.3364 14.713C21.3395 15.1426 21.0847 15.5321 20.6899 15.7015L17.6276 17.0141C17.5017 17.0679 17.4013 17.1683 17.3475 17.2942V17.2942Z" stroke="#EDEDED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                      فتح الفصل
                    </button>
                  </div>
                </div>

                {/* Card 3: Benefits */}
                <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transition-all duration-300 transform hover:scale-105 group overflow-hidden">
                  {/* Background Image on Hover */}
                  <div className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl"
                    style={{ backgroundImage: `url(${metsardBg})` }}>
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="text-2xl font-bold text-white mb-6 leading-tight noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors">حزمة مميزات<br />شاملة</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-sm text-gray-200 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 31 31" fill="none" className="flex-shrink-0 transition-transform group-hover:scale-110 group-hover:rotate-12">
                          <path fillRule="evenodd" clipRule="evenodd" d="M14.371 17.9597L13.6667 30.6362H17.0001L16.2958 17.9597L24.7615 27.4213L27.1185 25.0643L17.6569 16.5986L30.3334 17.3028V13.9695L17.6569 14.6738L27.1185 6.20811L24.7615 3.85108L16.2958 13.3127L17.0001 0.636185H13.6667L14.371 13.3127L5.90529 3.85106L3.54827 6.20808L13.0099 14.6738L0.333374 13.9695V17.3028L13.0099 16.5986L3.54826 25.0643L5.90529 27.4213L14.371 17.9597Z" fill="#EDEDED"></path>
                        </svg>
                        <span className="noto-sans-arabic-regular">الشخصيات والهدايا</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-200 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 31 29" fill="none" className="flex-shrink-0 transition-transform group-hover:scale-110">
                          <path d="M0.945682 15.4349C0.129271 15.2773 0.129271 14.1089 0.945682 13.9513L2.73208 13.6065C8.89907 12.4162 13.6506 7.4754 14.5993 1.26665C14.7277 0.426051 15.939 0.42605 16.0675 1.26665C17.0161 7.47541 21.7677 12.4162 27.9347 13.6065L29.7211 13.9513C30.5375 14.1089 30.5375 15.2773 29.7211 15.4349L27.9347 15.7797C21.7677 16.9699 17.0161 21.9107 16.0675 28.1195C15.939 28.9601 14.7277 28.9601 14.5993 28.1195C13.6506 21.9108 8.89907 16.9699 2.73208 15.7797L0.945682 15.4349Z" fill="white"></path>
                        </svg>
                        <span className="noto-sans-arabic-regular">المسابقات والاحتفالات</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-200 group-hover:text-white transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 31 27" fill="none" className="flex-shrink-0 transition-transform group-hover:scale-110">
                          <path fillRule="evenodd" clipRule="evenodd" d="M30.3334 9.5C30.3334 11.0938 29.6029 12.588 28.3266 13.875C25.7331 11.2596 20.8855 9.49999 15.3334 9.49999C9.78126 9.49999 4.93368 11.2596 2.34011 13.875C4.93368 16.4904 9.78126 18.25 15.3334 18.25C20.8855 18.25 25.7331 16.4904 28.3266 13.875C29.6029 15.162 30.3334 16.6562 30.3334 18.25C30.3334 23.0825 23.6176 27 15.3334 27C7.0491 27 0.333374 23.0825 0.333374 18.25C0.333374 16.6562 1.06383 15.162 2.3401 13.875C1.06383 12.588 0.333374 11.0938 0.333374 9.5C0.333374 4.66751 7.0491 0.75 15.3334 0.75C23.6176 0.75 30.3334 4.66751 30.3334 9.5Z" fill="white"></path>
                        </svg>
                        <span className="noto-sans-arabic-regular">التحويلات وحقوق النشر</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

          {activeTab === 1 && (
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold noto-sans-arabic-bold mb-4 leading-tight" style={{ color: 'rgba(255, 255, 255, 0.95)', textShadow: '0 2px 8px rgba(255, 255, 255, 0.1)' }}>
                مسابقات الكتابة
              </h1>
              <p className="text-xl noto-sans-arabic-regular max-w-3xl" style={{ color: 'rgba(255, 255, 255, 0.90)', textShadow: '0 2px 8px rgba(255, 255, 255, 0.1)' }}>
                قريباً... سنعلن عن مسابقاتنا الشهرية واربح جوائز قيمة.
              </p>
            </div>
          )}
        </div>

        {/* Scrollspy Guide Section - Only show for tab 0 */}
        {activeTab === 0 && (
          <div className="relative z-10">
            <GuideSection />
          </div>
        )}
      </main>
    </div>
  );
};

const GuideSection = () => {
  const [activeSection, setActiveSection] = useState("privilege");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-100px 0px -60% 0px" }
    );

    const sections = document.querySelectorAll(".guide-section");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const sections = [
    { 
      id: "privilege", 
      title: "نظام الامتياز",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    { 
      id: "gifting", 
      title: "نظام الهدايا",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      )
    },
    { 
      id: "payment", 
      title: "قواعد الدفع",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
  ];

  return (
    <div className="w-full border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A9EFF]/10 border border-[#4A9EFF]/20 rounded-full mb-6">
            <svg className="w-4 h-4 text-[#4A9EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[#4A9EFF] text-sm font-bold tracking-wide">دليل شامل</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white noto-sans-arabic-extrabold mb-4">
            دليل المؤلف المتكامل
          </h2>
          <p className="text-gray-400 text-lg noto-sans-arabic-regular max-w-2xl mx-auto">
            كل ما تحتاج معرفته عن الأنظمة والمميزات المتاحة للكتّاب في سرد
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Modern Sticky Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
                <h3 className="text-white/60 text-xs font-bold mb-6 px-2 noto-sans-arabic-bold tracking-widest uppercase">
                  المحتويات
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-right px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 group ${
                        activeSection === section.id
                          ? "bg-[#4A9EFF] text-white shadow-lg shadow-[#4A9EFF]/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className={`flex-shrink-0 transition-transform duration-200 ${
                        activeSection === section.id ? "scale-110" : "group-hover:scale-110"
                      }`}>
                        {section.icon}
                      </div>
                      <span className="noto-sans-arabic-bold text-base flex-1">
                        {section.title}
                      </span>
                      {activeSection === section.id && (
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 space-y-24">
            {/* Privilege System */}
            <div id="privilege" className="guide-section scroll-mt-32">
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden transition-all duration-300 hover:border-[#4A9EFF]/30 hover:shadow-2xl hover:shadow-[#4A9EFF]/10">
                {/* Card Header */}
                <div className="relative bg-gradient-to-br from-[#4A9EFF]/10 via-[#4A9EFF]/5 to-transparent p-8 md:p-10 border-b border-white/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#4A9EFF] to-[#3A8EEF] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4A9EFF]/30 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-white noto-sans-arabic-extrabold mb-2">
                        نظام الامتياز
                      </h2>
                      <p className="text-[#4A9EFF] text-sm font-semibold tracking-wide">PRIVILEGE SYSTEM</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 md:p-10 space-y-8">
                  {/* Description */}
                  <div className="bg-gradient-to-br from-[#4A9EFF]/5 to-transparent rounded-2xl p-6 border border-[#4A9EFF]/20">
                    <h3 className="text-xl text-white font-bold mb-3 noto-sans-arabic-bold">خزّن فصولاً أكثر، اربح أكثر!</h3>
                    <p className="text-gray-300 leading-relaxed noto-sans-arabic-regular">
                      يتيح نظام الامتياز للمؤلفين تخزين عدد معين من الفصول وتحديد "رسوم دخول". يمكن للقراء الذين لا يستطيعون انتظار التحديثات اختيار دفع هذه الرسوم للوصول المبكر إلى الفصول المخزنة.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-[#4A9EFF]/50 transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#4A9EFF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#4A9EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">للمؤلفين</h4>
                          <p className="text-gray-400 text-sm noto-sans-arabic-regular leading-relaxed">
                            يمكن للمؤلفين تحديد عدد الفصول التي يريدون قفلها. لا توجد مستويات معقدة، أنت فقط تحدد عدد الفصول المحجوزة.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-[#4A9EFF]/50 transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#4A9EFF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#4A9EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">للقراء</h4>
                          <p className="text-gray-400 text-sm noto-sans-arabic-regular leading-relaxed">
                            يمكن للقراء فتح الفصول المتقدمة عن طريق دفع العملات. هذا يدعم المؤلف مباشرة ويمنح القارئ أسبقية في الأحداث.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Benefits List */}
                  <div>
                    <h4 className="text-lg font-bold text-white mb-5 noto-sans-arabic-bold flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#4A9EFF] rounded-full"></span>
                      مميزات النظام
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {[
                        "زيادة دخل المؤلف بشكل ملحوظ",
                        "مرونة في إدارة الفصول ونشرها",
                        "تفاعل أكبر مع المعجبين الأوفياء",
                        "حماية إضافية ضد القرصنة"
                      ].map((benefit, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-300 bg-black/20 px-4 py-3 rounded-lg border border-white/5 hover:border-[#4A9EFF]/30 transition-colors group/benefit">
                          <div className="w-6 h-6 rounded-md bg-[#4A9EFF]/10 flex items-center justify-center text-[#4A9EFF] text-xs font-bold flex-shrink-0 group-hover/benefit:bg-[#4A9EFF] group-hover/benefit:text-white transition-colors">
                            {idx + 1}
                          </div>
                          <span className="noto-sans-arabic-regular text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gifting System */}
            <div id="gifting" className="guide-section scroll-mt-32">
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden transition-all duration-300 hover:border-[#FF4A8D]/30 hover:shadow-2xl hover:shadow-[#FF4A8D]/10">
                {/* Card Header */}
                <div className="relative bg-gradient-to-br from-[#FF4A8D]/10 via-[#FF4A8D]/5 to-transparent p-8 md:p-10 border-b border-white/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#FF4A8D] to-[#E03A7D] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF4A8D]/30 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-white noto-sans-arabic-extrabold mb-2">
                        نظام الهدايا
                      </h2>
                      <p className="text-[#FF4A8D] text-sm font-semibold tracking-wide">GIFTING SYSTEM</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row gap-10 items-center">
                    {/* Content */}
                    <div className="flex-1 space-y-6">
                      <p className="text-xl text-gray-200 leading-relaxed noto-sans-arabic-regular">
                        اربح المزيد من خلال تلقي الهدايا من القراء؛ دع القراء يعبرون عن حبهم لكتابك!
                      </p>
                      
                      <div className="bg-gradient-to-br from-[#FF4A8D]/5 to-transparent rounded-2xl p-6 border-r-4 border-[#FF4A8D]">
                        <h4 className="text-lg font-bold text-white mb-3 noto-sans-arabic-bold flex items-center gap-2">
                          <svg className="w-5 h-5 text-[#FF4A8D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          كيف يعمل؟
                        </h4>
                        <p className="text-gray-300 leading-relaxed noto-sans-arabic-regular">
                          يمكن للقراء استخدام العملات لإرسال هدايا كنوع من التقدير لعمل المؤلف. يحصل المؤلفون على حصة من الإيرادات الناتجة عن هذه الهدايا وتضاف مباشرة إلى محفظتهم.
                        </p>
                      </div>
                    </div>
                    
                    {/* Visual Element */}
                    <div className="w-full md:w-1/3 flex justify-center">
                      <div className="relative w-40 h-40 md:w-48 md:h-48">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#FF4A8D]/20 to-purple-600/20 rounded-full animate-pulse"></div>
                        <div className="absolute inset-2 bg-[#1C1C1C] rounded-full flex items-center justify-center border-2 border-[#FF4A8D]/30">
                          <svg className="w-20 h-20 md:w-24 md:h-24 text-[#FF4A8D] drop-shadow-[0_0_15px_rgba(255,74,141,0.5)]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Rules */}
            <div id="payment" className="guide-section scroll-mt-32">
              <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl overflow-hidden transition-all duration-300 hover:border-[#4ADE80]/30 hover:shadow-2xl hover:shadow-[#4ADE80]/10">
                {/* Card Header */}
                <div className="relative bg-gradient-to-br from-[#4ADE80]/10 via-[#4ADE80]/5 to-transparent p-8 md:p-10 border-b border-white/10">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-[#4ADE80] to-[#3ACD70] rounded-2xl flex items-center justify-center shadow-lg shadow-[#4ADE80]/30 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl md:text-4xl font-bold text-white noto-sans-arabic-extrabold mb-2">
                        قواعد الدفع والسحب
                      </h2>
                      <p className="text-[#4ADE80] text-sm font-semibold tracking-wide">PAYMENT RULES</p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-8 md:p-10 space-y-8">
                  {/* Payment Info Grid */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-[#4ADE80]/50 transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">موعد الدفع</h4>
                          <p className="text-gray-400 text-sm noto-sans-arabic-regular leading-relaxed">
                            يتم إصدار المدفوعات في يوم 10 من الشهر التالي، بناءً على إحصائيات الشهر السابق.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/20 rounded-xl p-6 border border-white/10 hover:border-[#4ADE80]/50 transition-all duration-200 hover:-translate-y-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[#4ADE80]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-2 noto-sans-arabic-bold">الحد الأدنى للسحب</h4>
                          <p className="text-gray-400 text-sm noto-sans-arabic-regular leading-relaxed">
                            الحد الأدنى لسحب الأرباح هو <span className="text-[#4ADE80] font-bold text-lg mx-1">1000</span> نقطة.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="bg-gradient-to-br from-[#4ADE80]/5 to-transparent rounded-2xl p-6 border border-[#4ADE80]/20">
                    <h4 className="text-lg font-bold text-white mb-5 noto-sans-arabic-bold flex items-center gap-2">
                      <span className="w-1 h-6 bg-[#4ADE80] rounded-full"></span>
                      طرق السحب المتاحة
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {["Instapay", "Vodafone Cash", "PayPal"].map((method) => (
                        <div key={method} className="px-6 py-3 bg-black/40 rounded-xl border border-white/10 text-white font-semibold flex items-center gap-2 hover:border-[#4ADE80]/50 hover:bg-[#4ADE80]/10 transition-all cursor-default group/method">
                          <div className="w-2 h-2 rounded-full bg-[#4ADE80] group-hover/method:animate-pulse"></div>
                          <span className="text-sm">{method}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MetsardPage;


