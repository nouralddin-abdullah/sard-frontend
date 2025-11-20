import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import vodafoneLogo from "../../assets/vodaphonecash.png";
import instapayLogo from "../../assets/InstaPay_Logo.png";
import paypalLogo from "../../assets/Paypal_2014_logo.png";
import earningsBackground from "../../assets/earnings-background.png";

const EarningsPage = () => {
  return (
    <div className="relative flex h-auto w-full flex-col bg-[#101018]" style={{ backgroundImage: `url(${earningsBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      {/* Dark overlay for better text readability */}
      <div className="fixed inset-0 bg-black/60 z-0"></div>
      
      <Helmet>
        <title>نظام الأرباح للكتّاب - سرد</title>
        <meta name="description" content="حوّل كلماتك إلى مصدر دخل. نظام مبتكر يمكّن الكتّاب من تحقيق الربح مباشرة من دعم قرائهم على سرد" />
      </Helmet>

      {/* Hero Section */}
      <div className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <Link 
          to="/home" 
          className="absolute top-8 right-8 z-20"
        >
          <h1 className="text-white text-3xl font-bold noto-sans-arabic-extrabold hover:text-[#B76E4F] transition-colors">
            سرد
          </h1>
        </Link>
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#B76E4F]/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#B76E4F]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>
        
        <div className="relative z-10 flex h-full grow flex-col px-4 sm:px-6 md:px-8 lg:px-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-1 justify-center py-20">
            <div className="flex flex-col max-w-4xl flex-1 text-center items-center">
              <div className="flex min-h-[480px] flex-col gap-6 items-center justify-center p-4">
                <div className="flex flex-col gap-4 text-center">
                  <h1 
                    className="text-white text-5xl font-black leading-tight tracking-tight md:text-7xl noto-sans-arabic-extrabold"
                    style={{ textShadow: "0 0 15px rgba(183, 110, 79, 0.5)" }}
                  >
                    حوّل كلماتك إلى مصدر دخل
                  </h1>
                  <h2 className="text-gray-300 text-lg font-normal leading-normal md:text-xl max-w-2xl mx-auto" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                    نظام مبتكر يمكّن الكتّاب من تحقيق الربح مباشرة من دعم قرائهم على سرد.
                  </h2>
                </div>
                <button
                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-8 bg-[#B76E4F] text-white text-base font-bold leading-normal tracking-wide transition-all hover:scale-105 noto-sans-arabic-bold"
                  style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 25px 5px rgba(183, 110, 79, 0.5)"}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 0 15px 0px rgba(183, 110, 79, 0.5)"}
                >
                  <span className="truncate">اكتشف المزيد</span>
                </button>
              </div>
              <button 
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                className="absolute bottom-10 animate-bounce text-white cursor-pointer bg-transparent border-none"
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative z-10 py-8">
        <div className="py-20 px-8 bg-[#F5F5DC]/95 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl">
          <h2 className="text-[#1a1a1a] text-4xl font-bold leading-tight tracking-tight px-4 pb-12 pt-5 text-center noto-sans-arabic-extrabold">
            مسار تحقيق الأرباح
          </h2>
          
          <div className="grid grid-cols-[auto_1fr] gap-x-4 px-4 relative">
            {/* Glowing vertical line */}
            <div 
              className="absolute w-0.5 bg-gradient-to-b from-[#B76E4F]/30 via-[#B76E4F] to-[#B76E4F]/30"
              style={{
                top: "28px",
                bottom: "28px",
                left: "calc(20px - 1px)",
                right: "auto"
              }}
            ></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1 pt-3 z-10">
              <div className="bg-[#FFF8F0] p-2 rounded-full border border-[#B76E4F]/50" style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}>
                <svg className="w-6 h-6 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="w-0 h-2 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#1a1a1a] text-lg font-medium leading-normal noto-sans-arabic-bold">أنشئ وانشر</p>
              <p className="text-[#4a4a4a] text-base font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                يقوم الكاتب بنشر أعماله الإبداعية على المنصة.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-0 h-2"></div>
              <div className="bg-[#FFF8F0] p-2 rounded-full border border-[#B76E4F]/50" style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}>
                <svg className="w-6 h-6 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="w-0 h-2 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#1a1a1a] text-lg font-medium leading-normal noto-sans-arabic-bold">دعم القراء</p>
              <p className="text-[#4a4a4a] text-base font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                يقوم القراء بشحن حساباتهم بالنقاط لدعم كتّابهم المفضلين.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-0 h-2"></div>
              <div className="bg-[#FFF8F0] p-2 rounded-full border border-[#B76E4F]/50" style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}>
                <svg className="w-6 h-6 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="w-0 h-2 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#1a1a1a] text-lg font-medium leading-normal noto-sans-arabic-bold">إهداء النقاط</p>
              <p className="text-[#4a4a4a] text-base font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                يرسل القراء هدايا افتراضية (تعتمد على النقاط) للكتّاب الذين يعجبون بهم.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1 z-10">
              <div className="w-0 h-2"></div>
              <div className="bg-[#FFF8F0] p-2 rounded-full border border-[#B76E4F]/50" style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}>
                <svg className="w-6 h-6 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="w-0 h-2 grow"></div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#1a1a1a] text-lg font-medium leading-normal noto-sans-arabic-bold">تحقيق الأرباح</p>
              <p className="text-[#4a4a4a] text-base font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                يحصل الكاتب على 90% من قيمة الهدية كأرباح قابلة للسحب.
              </p>
            </div>

            {/* Step 5 */}
            <div className="flex flex-col items-center gap-1 pb-3 z-10">
              <div className="w-0 h-2"></div>
              <div className="bg-[#FFF8F0] p-2 rounded-full border border-[#B76E4F]/50" style={{ boxShadow: "0 0 15px 0px rgba(183, 110, 79, 0.5)" }}>
                <svg className="w-6 h-6 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex flex-1 flex-col py-3">
              <p className="text-[#1a1a1a] text-lg font-medium leading-normal noto-sans-arabic-bold">سحب الأرباح</p>
              <p className="text-[#4a4a4a] text-base font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                يمكن للكتّاب سحب أرباحهم بسهولة وأمان.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Showcase Section */}
        <div className="py-20 px-8 bg-[#F5F5DC]/95 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl mt-8">
          <div className="flex flex-col gap-10 px-4">
            <div className="text-center">
              <h2 className="text-[#1a1a1a] text-4xl font-bold leading-tight tracking-tight px-4 pb-3 pt-5 noto-sans-arabic-extrabold">
                لماذا تكتب على سرد؟
              </h2>
              <p className="text-[#4a4a4a] text-lg font-normal leading-normal max-w-3xl mx-auto" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                انضم إلى مجتمع يدعم الإبداع ويقدره. نوفر لك الأدوات اللازمة لتحويل شغفك بالكتابة إلى مصدر دخل حقيقي.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-0">
              {/* Benefit 1 */}
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-[#B76E4F]/20 bg-[#FFF8F0]/95 p-6 backdrop-blur-sm transition-all hover:border-[#B76E4F]/50 hover:-translate-y-1" 
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 15px 0px rgba(183, 110, 79, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div className="p-2 bg-[#B76E4F]/20 rounded-full w-fit">
                  <svg className="w-8 h-8 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#1a1a1a] text-lg font-bold leading-tight noto-sans-arabic-bold">أعلى نسبة ربح</h3>
                  <p className="text-[#4a4a4a] text-sm font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                    احصل على 90% من قيمة دعم القراء، وهي من أعلى النسب في المجال.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-[#B76E4F]/20 bg-[#FFF8F0]/95 p-6 backdrop-blur-sm transition-all hover:border-[#B76E4F]/50 hover:-translate-y-1"
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 15px 0px rgba(183, 110, 79, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div className="p-2 bg-[#B76E4F]/20 rounded-full w-fit">
                  <svg className="w-8 h-8 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#1a1a1a] text-lg font-bold leading-tight noto-sans-arabic-bold">دعم مباشر من مجتمعك</h3>
                  <p className="text-[#4a4a4a] text-sm font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                    تواصل مع قرائك واحصل على دعمهم المباشر لتقدير أعمالك.
                  </p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-[#B76E4F]/20 bg-[#FFF8F0]/95 p-6 backdrop-blur-sm transition-all hover:border-[#B76E4F]/50 hover:-translate-y-1"
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 15px 0px rgba(183, 110, 79, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div className="p-2 bg-[#B76E4F]/20 rounded-full w-fit">
                  <svg className="w-8 h-8 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#1a1a1a] text-lg font-bold leading-tight noto-sans-arabic-bold">نظام نقاط مرن</h3>
                  <p className="text-[#4a4a4a] text-sm font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                    نقاط القراء لا تنتهي صلاحيتها أبداً، مما يشجع على الدعم المستمر.
                  </p>
                </div>
              </div>

              {/* Benefit 4 */}
              <div className="flex flex-1 flex-col gap-4 rounded-lg border border-[#B76E4F]/20 bg-[#FFF8F0]/95 p-6 backdrop-blur-sm transition-all hover:border-[#B76E4F]/50 hover:-translate-y-1"
                style={{ transition: "all 0.3s ease" }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 0 15px 0px rgba(183, 110, 79, 0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "none"}
              >
                <div className="p-2 bg-[#B76E4F]/20 rounded-full w-fit">
                  <svg className="w-8 h-8 text-[#B76E4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[#1a1a1a] text-lg font-bold leading-tight noto-sans-arabic-bold">عمليات دفع آمنة وسلسة</h3>
                  <p className="text-[#4a4a4a] text-sm font-normal leading-normal" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
                    عمليات سحب آمنة وسريعة عبر وسائل دفع متعددة وموثوقة.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="py-20 px-8 bg-[#F5F5DC]/95 backdrop-blur-md rounded-3xl border border-white/30 shadow-2xl mt-8 mb-8">
          <div className="text-center mb-12">
            <h2 className="text-[#1a1a1a] text-4xl font-bold leading-tight tracking-tight px-4 pb-3 pt-5 noto-sans-arabic-extrabold">
              عمليات دفع وسحب مرنة
            </h2>
            <p className="text-[#4a4a4a] text-lg font-normal leading-normal max-w-3xl mx-auto" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>
              نحن ندعم أشهر طرق الدفع لضمان تجربة سلسة لك وللقراء.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Recharge Info */}
            <div className="bg-[#FFF8F0]/95 border border-[#B76E4F]/20 p-8 rounded-lg text-center flex flex-col items-center shadow-lg">
              <h3 className="text-[#B76E4F] text-2xl font-bold mb-2 noto-sans-arabic-bold">شحن النقاط</h3>
              <p className="text-[#4a4a4a] mb-6" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>الحد الأدنى للشحن</p>
              <p className="text-[#1a1a1a] text-5xl font-bold mb-8 noto-sans-arabic-extrabold">
                500 <span className="text-xl text-[#4a4a4a]" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>نقطة</span>
              </p>
              <p className="text-[#4a4a4a] text-sm mb-4" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>وسائل الشحن المتاحة:</p>
              <div className="flex justify-center items-center gap-6">
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={instapayLogo} 
                  alt="InstaPay logo" 
                />
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={vodafoneLogo} 
                  alt="Vodafone Cash logo" 
                />
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={paypalLogo} 
                  alt="PayPal logo" 
                />
              </div>
            </div>

            {/* Withdrawal Info */}
            <div className="bg-[#FFF8F0]/95 border border-[#B76E4F]/20 p-8 rounded-lg text-center flex flex-col items-center shadow-lg">
              <h3 className="text-[#B76E4F] text-2xl font-bold mb-2 noto-sans-arabic-bold">سحب الأرباح</h3>
              <p className="text-[#4a4a4a] mb-6" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>الحد الأدنى للسحب</p>
              <p className="text-[#1a1a1a] text-5xl font-bold mb-8 noto-sans-arabic-extrabold">
                1000 <span className="text-xl text-[#4a4a4a]" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>نقطة</span>
              </p>
              <p className="text-[#4a4a4a] text-sm mb-4" style={{ fontFamily: "'Markazi Text', serif", fontWeight: 400 }}>وسائل السحب المتاحة:</p>
              <div className="flex justify-center items-center gap-6">
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={instapayLogo} 
                  alt="InstaPay logo" 
                />
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={vodafoneLogo} 
                  alt="Vodafone Cash logo" 
                />
                <img 
                  className="h-8 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" 
                  src={paypalLogo} 
                  alt="PayPal logo" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;
