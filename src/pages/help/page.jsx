import React, { useState } from "react";
import { 
  Search, 
  ChevronRight, 
  ArrowLeft,
  Rocket,
  Wallet,
  Shield,
  PenTool,
  BookOpen,
  AlertCircle,
  MessageCircle,
  Mail,
  Twitter,
  HelpCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Help categories with icons
  const categories = [
    {
      id: 1,
      title: "البداية",
      description: "ابدأ على القدم الصحيحة! كل ما تحتاج معرفته للبدء في رحلتك معنا.",
      icon: Rocket,
      gradient: "from-[#5865f2] to-[#7983f5]",
      articles: [
        { id: "create-account", title: "كيفية إنشاء حساب جديد", file: "getting-started/create-account.md" },
        { id: "setup-profile", title: "إعداد ملفك الشخصي", file: "getting-started/setup-profile.md" },
        { id: "publish-first-novel", title: "نشر روايتك الأولى", file: "getting-started/publish-first-novel.md" },
        { id: "follow-writers", title: "كيفية متابعة الكتّاب المفضلين", file: "getting-started/follow-writers.md" },
        { id: "explore-novels", title: "استكشاف الروايات والأنواع", file: "getting-started/explore-novels.md" },
      ]
    },
    {
      id: 2,
      title: "المحفظة والنقاط",
      description: "إدارة نقاطك والمدفوعات. دعنا نساعدك في ذلك.",
      icon: Wallet,
      gradient: "from-[#57f287] to-[#43b581]",
      articles: [
        { id: "recharge-points", title: "كيفية شحن النقاط", file: "wallet/recharge-points.md" },
        { id: "use-points", title: "استخدام النقاط لفتح الفصول المميزة", file: "wallet/use-points.md" },
        { id: "gift-points", title: "إهداء النقاط للكتّاب", file: "wallet/gift-points.md" },
        { id: "refund-policy", title: "سياسة الاسترجاع والإلغاء", file: "wallet/refund-policy.md" },
        { id: "payment-methods", title: "طرق الدفع المتاحة", file: "wallet/payment-methods.md" },
      ]
    },
    {
      id: 3,
      title: "الحساب والأمان",
      description: "حماية حسابك وخصوصيتك أمر بالغ الأهمية بالنسبة لنا.",
      icon: Shield,
      gradient: "from-[#ed4245] to-[#f04747]",
      articles: [
        { id: "change-password", title: "تغيير كلمة المرور", file: "security/change-password.md" },
        { id: "two-factor-auth", title: "تفعيل المصادقة الثنائية", file: "security/two-factor-auth.md" },
        { id: "recover-account", title: "استعادة حساب محذوف", file: "security/recover-account.md" },
        { id: "privacy-settings", title: "إدارة إعدادات الخصوصية", file: "security/privacy-settings.md" },
        { id: "report-security", title: "الإبلاغ عن مشكلة أمنية", file: "security/report-security.md" },
      ]
    },
    {
      id: 4,
      title: "الكتابة والنشر",
      description: "أدوات وإرشادات للكتّاب. أطلق العنان لإبداعك!",
      icon: PenTool,
      gradient: "from-[#fee75c] to-[#f0b232]",
      articles: [
        { id: "rich-text-editor", title: "استخدام محرر النصوص المتقدم", file: "writing/rich-text-editor.md" },
        { id: "add-chapters", title: "إضافة فصول جديدة لروايتك", file: "writing/add-chapters.md" },
        { id: "manage-comments", title: "إدارة التعليقات والمراجعات", file: "writing/manage-comments.md" },
        { id: "increase-readers", title: "نصائح لزيادة القراء", file: "writing/increase-readers.md" },
        { id: "novel-statistics", title: "فهم إحصائيات روايتك", file: "writing/novel-statistics.md" },
      ]
    },
    {
      id: 5,
      title: "قوائم القراءة والمكتبة",
      description: "تنظيم رواياتك المفضلة بالطريقة التي تناسبك.",
      icon: BookOpen,
      gradient: "from-[#eb459e] to-[#fe73c5]",
      articles: [
        { id: "create-reading-lists", title: "إنشاء قوائم قراءة جديدة", file: "reading/create-reading-lists.md" },
        { id: "add-to-lists", title: "إضافة روايات إلى قوائمك", file: "reading/add-to-lists.md" },
        { id: "follow-lists", title: "متابعة قوائم القراءة", file: "reading/follow-lists.md" },
        { id: "manage-library", title: "إدارة المكتبة الشخصية", file: "reading/manage-library.md" },
        { id: "bookmarks", title: "استخدام الإشارات المرجعية", file: "reading/bookmarks.md" },
      ]
    },
    {
      id: 6,
      title: "المشاكل الشائعة",
      description: "واجهتك مشكلة؟ لدينا الحل. إليك إجابات سريعة.",
      icon: AlertCircle,
      gradient: "from-[#f26522] to-[#ff7744]",
      articles: [
        { id: "cant-login", title: "لا أستطيع تسجيل الدخول", file: "troubleshooting/cant-login.md" },
        { id: "page-loading", title: "مشكلة في تحميل الصفحات", file: "troubleshooting/page-loading.md" },
        { id: "images-not-showing", title: "الصور لا تظهر بشكل صحيح", file: "troubleshooting/images-not-showing.md" },
        { id: "payment-error", title: "رسالة خطأ عند الدفع", file: "troubleshooting/payment-error.md" },
        { id: "formatting-issues", title: "مشاكل في التنسيق والعرض", file: "troubleshooting/formatting-issues.md" },
      ]
    }
  ];

  const filteredCategories = searchQuery
    ? categories.map(category => ({
        ...category,
        articles: category.articles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.articles.length > 0)
    : categories;

  // Category Detail View
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    const Icon = category.icon;
    
    return (
      <>
        <Header />
        <div className="bg-[#1e1f22] min-h-screen">
          {/* Category Hero */}
          <div className={`bg-gradient-to-br ${category.gradient} relative overflow-hidden`}>
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            
            <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
              <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 text-white/90 hover:text-white mb-8 noto-sans-arabic-medium transition-colors"
              >
                <ArrowLeft size={20} />
                <span>العودة إلى مركز المساعدة</span>
              </button>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-white text-4xl font-bold noto-sans-arabic-bold mb-2">
                    {category.title}
                  </h1>
                  <p className="text-white/80 text-lg noto-sans-arabic-regular">
                    {category.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Articles List */}
          <div className="max-w-5xl mx-auto px-6 py-12">
            <div className="space-y-3">
              {category.articles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/help/article/${article.id}`}
                  className="flex items-center justify-between p-5 bg-[#2b2d31] rounded-xl hover:bg-[#35373c] border border-[#3f4147] hover:border-[#5865f2] transition-all group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[#3f4147] group-hover:bg-[#5865f2]/20 flex items-center justify-center transition-colors">
                      <HelpCircle size={20} className="text-[#b5bac1] group-hover:text-[#5865f2] transition-colors" />
                    </div>
                    <span className="text-[#f2f3f5] text-lg group-hover:text-[#5865f2] transition-colors noto-sans-arabic-medium">
                      {article.title}
                    </span>
                  </div>
                  <ChevronRight size={20} className="text-[#4e5058] group-hover:text-[#5865f2] group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main Help Center View
  return (
    <>
      <Header />
      <div className="bg-[#1e1f22] min-h-screen">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#5865f2] via-[#7289da] to-[#99aab5]">
            <div className="absolute inset-0">
              {/* Floating shapes */}
              <div className="absolute top-20 left-[10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute top-40 right-[15%] w-48 h-48 bg-[#eb459e]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute bottom-10 left-[30%] w-72 h-72 bg-[#57f287]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-20 right-[25%] w-56 h-56 bg-[#fee75c]/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto px-6 py-24 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <HelpCircle size={16} className="text-white" />
              <span className="text-white/90 text-sm noto-sans-arabic-medium">مركز المساعدة</span>
            </div>

            <h1 className="text-white text-5xl md:text-6xl font-black mb-4 noto-sans-arabic-bold leading-tight">
              تحتاج مساعدة؟
              <br />
              <span className="text-white/90">نحن هنا من أجلك.</span>
            </h1>
            <p className="text-white/80 text-xl mb-10 noto-sans-arabic-regular max-w-2xl mx-auto">
              من إعدادات الحساب إلى أدوات الكتابة، اعثر على المساعدة لكل ما يتعلق بـ سرد
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center h-16 w-full rounded-2xl bg-white overflow-hidden shadow-2xl shadow-black/20 border-4 border-white/20">
                <div className="flex items-center justify-center px-5">
                  <Search size={24} className="text-[#4e5058]" />
                </div>
                <input
                  type="text"
                  className="flex-1 h-full bg-transparent text-[#1e1f22] px-2 focus:outline-none placeholder:text-[#80848e] noto-sans-arabic-regular text-lg"
                  placeholder="ابحث عن مقالات المساعدة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Quick Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-white/60 text-sm noto-sans-arabic-regular">بحث شائع:</span>
                {['شحن النقاط', 'نسيت كلمة المرور', 'نشر رواية'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-white/90 text-sm noto-sans-arabic-regular transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {searchQuery && (
            <div className="mb-8">
              <h2 className="text-[#f2f3f5] text-2xl font-bold noto-sans-arabic-bold">
                نتائج البحث عن "{searchQuery}"
              </h2>
              <p className="text-[#b5bac1] mt-1 noto-sans-arabic-regular">
                {filteredCategories.reduce((acc, cat) => acc + cat.articles.length, 0)} نتيجة
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => !searchQuery && setSelectedCategory(category.id)}
                  className="group bg-[#2b2d31] rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-black/20 transition-all cursor-pointer border border-[#3f4147] hover:border-[#5865f2] hover:-translate-y-1"
                >
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-br ${category.gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-white text-xl font-bold noto-sans-arabic-bold">
                        {category.title}
                      </h3>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    <p className="text-[#b5bac1] text-sm mb-5 noto-sans-arabic-regular leading-relaxed">
                      {category.description}
                    </p>

                    {/* Articles Preview */}
                    <div className="space-y-2">
                      {category.articles.slice(0, 3).map((article) => (
                        <Link
                          key={article.id}
                          to={`/help/article/${article.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 text-[#00a8fc] hover:text-[#5865f2] text-sm noto-sans-arabic-regular group/article transition-colors"
                        >
                          <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover/article:opacity-100 -translate-x-1 group-hover/article:translate-x-0 transition-all" />
                          <span className="line-clamp-1">{article.title}</span>
                        </Link>
                      ))}
                    </div>
                    
                    {category.articles.length > 3 && !searchQuery && (
                      <div className="mt-4 pt-4 border-t border-[#3f4147]">
                        <span className="text-[#80848e] text-sm noto-sans-arabic-medium flex items-center gap-1 group-hover:text-[#5865f2] transition-colors">
                          عرض جميع المقالات ({category.articles.length})
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* No Results */}
          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[#2b2d31] flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-[#4e5058]" />
              </div>
              <h3 className="text-[#f2f3f5] text-2xl font-bold mb-2 noto-sans-arabic-bold">
                لم نعثر على أي نتائج
              </h3>
              <p className="text-[#b5bac1] text-lg noto-sans-arabic-regular mb-6">
                جرب البحث بمصطلحات مختلفة أو تصفح الفئات أدناه
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-xl noto-sans-arabic-medium transition-colors"
              >
                مسح البحث
              </button>
            </div>
          )}
        </div>

        {/* Other Ways to Find Help */}
        {!searchQuery && (
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <h2 className="text-[#f2f3f5] text-2xl font-bold mb-8 noto-sans-arabic-bold text-center">
              طرق أخرى للحصول على المساعدة
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Contact Support */}
              <div className="bg-[#2b2d31] rounded-2xl p-6 border border-[#3f4147] hover:border-[#5865f2] transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#5865f2] to-[#7983f5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Mail size={24} className="text-white" />
                </div>
                <h3 className="text-[#f2f3f5] text-lg font-bold noto-sans-arabic-bold mb-2">
                  تواصل مع الدعم
                </h3>
                <p className="text-[#b5bac1] text-sm noto-sans-arabic-regular mb-4">
                  أرسل لنا رسالة وسنرد عليك في أقرب وقت ممكن
                </p>
                <Link 
                  to="/contact"
                  className="text-[#00a8fc] hover:text-[#5865f2] text-sm noto-sans-arabic-medium flex items-center gap-1 transition-colors"
                >
                  إرسال طلب
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Community */}
              <div className="bg-[#2b2d31] rounded-2xl p-6 border border-[#3f4147] hover:border-[#5865f2] transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#57f287] to-[#43b581] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} className="text-white" />
                </div>
                <h3 className="text-[#f2f3f5] text-lg font-bold noto-sans-arabic-bold mb-2">
                  مجتمع سرد
                </h3>
                <p className="text-[#b5bac1] text-sm noto-sans-arabic-regular mb-4">
                  انضم إلى مجتمعنا وتفاعل مع القراء والكتّاب الآخرين
                </p>
                <Link 
                  to="/community"
                  className="text-[#00a8fc] hover:text-[#5865f2] text-sm noto-sans-arabic-medium flex items-center gap-1 transition-colors"
                >
                  زيارة المجتمع
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Social Media */}
              <div className="bg-[#2b2d31] rounded-2xl p-6 border border-[#3f4147] hover:border-[#5865f2] transition-all group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1da1f2] to-[#0077b5] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Twitter size={24} className="text-white" />
                </div>
                <h3 className="text-[#f2f3f5] text-lg font-bold noto-sans-arabic-bold mb-2">
                  تابعنا على تويتر
                </h3>
                <p className="text-[#b5bac1] text-sm noto-sans-arabic-regular mb-4">
                  احصل على آخر الأخبار والتحديثات من فريق سرد
                </p>
                <a 
                  href="https://twitter.com/sard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#00a8fc] hover:text-[#5865f2] text-sm noto-sans-arabic-medium flex items-center gap-1 transition-colors"
                >
                  @sard
                  <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer Banner */}
        {!searchQuery && (
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5865f2] via-[#7289da] to-[#eb459e]">
                <div className="absolute inset-0">
                  <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
                </div>
              </div>
              
              <div className="relative z-10 p-12 text-center">
                <h3 className="text-white text-3xl md:text-4xl font-bold mb-4 noto-sans-arabic-bold">
                  لم تجد ما تبحث عنه؟
                </h3>
                <p className="text-white/90 text-lg mb-8 noto-sans-arabic-regular max-w-xl mx-auto">
                  فريقنا جاهز للإجابة على جميع استفساراتك. لا تتردد في التواصل معنا!
                </p>
                <button className="px-8 py-4 bg-white text-[#5865f2] font-bold rounded-xl hover:bg-gray-100 transition-all noto-sans-arabic-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                  تواصل مع فريق الدعم
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default HelpCenterPage;
