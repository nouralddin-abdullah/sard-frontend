import React, { useState } from "react";
import { Search, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "../../components/common/Header";

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Help categories - articles map to actual markdown files
  const categories = [
    {
      id: 1,
      title: "البداية",
      description: "كل ما تحتاج معرفته للبدء",
      color: "bg-[#5865f2]",
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
      description: "إدارة نقاطك والمدفوعات",
      color: "bg-[#57f287]",
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
      description: "حماية حسابك وخصوصيتك",
      color: "bg-[#ed4245]",
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
      description: "أدوات وإرشادات للكتّاب",
      color: "bg-[#fee75c]",
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
      description: "تنظيم رواياتك المفضلة",
      color: "bg-[#eb459e]",
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
      description: "حلول سريعة للمشاكل الشائعة",
      color: "bg-[#f26522]",
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

  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    
    return (
      <>
        <Header />
        <div className="bg-[#36393f] min-h-screen">
          <div className="max-w-5xl mx-auto px-6 py-12">
            {/* Back Button */}
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex items-center gap-2 text-[#00b0f4] hover:underline mb-8 noto-sans-arabic-medium"
            >
              <ArrowLeft size={20} />
              <span>العودة إلى جميع الفئات</span>
            </button>

            {/* Category Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                <h1 className="text-white text-4xl font-bold noto-sans-arabic-bold">
                  {category.title}
                </h1>
              </div>
              <p className="text-[#b9bbbe] text-lg noto-sans-arabic-regular">
                {category.description}
              </p>
            </div>

            {/* Articles List */}
            <div className="space-y-3">
              {category.articles.map((article) => (
                <Link
                  key={article.id}
                  to={`/help/article/${article.id}`}
                  className="flex items-center justify-between p-5 bg-[#2f3136] rounded-lg hover:bg-[#36393f] border border-transparent hover:border-[#00b0f4] transition-all group"
                >
                  <span className="text-[#dcddde] text-lg group-hover:text-[#00b0f4] transition-colors noto-sans-arabic-medium">
                    {article.title}
                  </span>
                  <ChevronRight size={20} className="text-[#72767d] group-hover:text-[#00b0f4] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#36393f] min-h-screen">
        {/* Hero Section */}
        <div className="bg-[#5865f2] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-6 py-20 text-center relative z-10">
            <h1 className="text-white text-6xl font-black mb-4 noto-sans-arabic-bold">
              مركز المساعدة
            </h1>
            <p className="text-white/90 text-xl mb-10 noto-sans-arabic-regular">
              كيف يمكننا مساعدتك؟
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center h-14 w-full rounded-lg bg-white overflow-hidden shadow-xl">
                <input
                  type="text"
                  className="flex-1 h-full bg-transparent text-[#2c2f33] px-6 focus:outline-none placeholder:text-[#747f8d] noto-sans-arabic-regular text-base"
                  placeholder="ابحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="flex items-center justify-center px-5">
                  <Search size={22} className="text-[#747f8d]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          {searchQuery && (
            <h2 className="text-white text-2xl font-bold mb-8 noto-sans-arabic-bold">
              نتائج البحث
            </h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                onClick={() => !searchQuery && setSelectedCategory(category.id)}
                className="bg-[#2f3136] rounded-lg p-6 hover:shadow-lg transition-all cursor-pointer group border border-transparent hover:border-[#00b0f4]"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${category.color} group-hover:scale-110 transition-transform`}></div>
                  <h3 className="text-white text-xl font-bold noto-sans-arabic-bold">
                    {category.title}
                  </h3>
                </div>

                <p className="text-[#b9bbbe] text-sm mb-5 noto-sans-arabic-regular">
                  {category.description}
                </p>

                {/* Articles Preview (first 3) */}
                <div className="space-y-2">
                  {category.articles.slice(0, 3).map((article) => (
                    <Link
                      key={article.id}
                      to={`/help/article/${article.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-[#00b0f4] hover:underline text-sm noto-sans-arabic-regular group/article"
                    >
                      <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover/article:opacity-100 transition-opacity" />
                      <span className="line-clamp-1">{article.title}</span>
                    </Link>
                  ))}
                  
                  {category.articles.length > 3 && !searchQuery && (
                    <button className="text-[#00b0f4] text-sm hover:underline noto-sans-arabic-medium mt-3">
                      عرض المزيد ({category.articles.length - 3})
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {searchQuery && filteredCategories.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-[#2f3136] flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-[#72767d]" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2 noto-sans-arabic-bold">
                لم نعثر على أي نتائج
              </h3>
              <p className="text-[#b9bbbe] text-lg noto-sans-arabic-regular">
                جرب البحث بمصطلحات مختلفة
              </p>
            </div>
          )}
        </div>

        {/* Contact Support Banner */}
        {!searchQuery && (
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <div className="bg-[#5865f2] rounded-xl p-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-white text-3xl font-bold mb-3 noto-sans-arabic-bold">
                  هل تحتاج إلى مزيد من المساعدة؟
                </h3>
                <p className="text-white/90 text-lg mb-6 noto-sans-arabic-regular">
                  فريقنا جاهز للإجابة على استفساراتك
                </p>
                <button className="px-8 py-4 bg-white text-[#5865f2] font-bold rounded-lg hover:bg-gray-100 transition-colors noto-sans-arabic-bold text-lg shadow-lg">
                  تواصل مع الدعم
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
