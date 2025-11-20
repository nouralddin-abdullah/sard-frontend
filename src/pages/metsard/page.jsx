import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import metsardBg from "../../assets/metsard-1.jpg";
import sardAuthorImg from "../../assets/sard-author.png";

const MetsardPage = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: "المميزات الأساسية" },
    { id: 1, title: "مسابقات الكتابة" },
    { id: 2, title: "التحويلات والاقتباسات" },
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
                className={`text-sm font-bold tracking-wider transition-all duration-300 pb-1 border-b-2 noto-sans-arabic-bold ${
                  activeTab === tab.id
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
              className={`text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 pb-1 border-b-2 noto-sans-arabic-bold ${
                activeTab === tab.id
                  ? "text-white border-[#4A9EFF]"
                  : "text-gray-400 border-transparent"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      <main className="relative w-full min-h-screen overflow-hidden">
        {/* Background Image */}
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
                    <div className="text-4xl font-bold text-white mb-2">400,000+ <br/>كاتب</div>
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg group-hover:bg-[#4A9EFF]/30 transition-colors">
                    <img 
                      src={sardAuthorImg} 
                      alt="Sard" 
                      className="w-12 h-12 object-contain transition-transform group-hover:scale-110"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-200 mb-4 leading-relaxed noto-sans-arabic-regular">
                  انطلق بقصتك على <span className="text-[#4A9EFF] font-bold noto-sans-arabic-bold">سرد</span> مع كتّاب من 100+ دولة ومنطقة!
                </p>
                <div className="h-px bg-white/30 my-3 group-hover:bg-[#4A9EFF]/50 transition-colors" />
                <div className="text-xs text-gray-400 tracking-wider font-bold noto-sans-arabic-bold group-hover:text-white transition-colors">سرد انطلق في 2024</div>
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
                    <div className="text-2xl font-bold text-white leading-tight noto-sans-arabic-bold">القرّاء <br/>يدفعون لفتح الفصول</div>
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
                  اقرأ مجانًا للتجربة،<br/>ثم افتح بالعملات.
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
                <div className="text-2xl font-bold text-white mb-6 leading-tight noto-sans-arabic-bold group-hover:text-[#4A9EFF] transition-colors">حزمة مميزات<br/>شاملة</div>
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
              <h1 className="text-4xl md:text-5xl font-bold text-white noto-sans-arabic-bold mb-4 leading-tight drop-shadow-lg">
                مسابقات الكتابة
              </h1>
              <p className="text-xl text-gray-200 noto-sans-arabic-regular drop-shadow-md max-w-3xl">
                انضم إلى مسابقاتنا الشهرية واربح جوائز قيمة. نقدم فرصاً مستمرة للكتّاب الموهوبين لإظهار إبداعهم والحصول على التقدير والمكافآت المالية.
              </p>
            </div>
          )}

          {activeTab === 2 && (
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white noto-sans-arabic-bold mb-4 leading-tight drop-shadow-lg">
                التحويلات والاقتباسات
              </h1>
              <p className="text-xl text-gray-200 noto-sans-arabic-regular drop-shadow-md max-w-3xl">
                احصل على فرصة تحويل روايتك إلى أعمال درامية، أفلام، أو ألعاب. نساعد الكتّاب في حماية حقوق النشر والحصول على أفضل صفقات التحويل والاقتباس.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MetsardPage;
