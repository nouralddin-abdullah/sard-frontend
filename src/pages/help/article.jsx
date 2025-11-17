import React, { useState, useEffect } from "react";
import { ChevronRight, ThumbsUp, ThumbsDown, Clock, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "../../components/common/Header";

const HelpArticlePage = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Article metadata mapping
  const articlesMetadata = {
    "create-account": { 
      title: "كيفية إنشاء حساب جديد", 
      category: "البداية",
      file: "getting-started/create-account.md",
      views: "15.2K"
    },
    "setup-profile": { 
      title: "إعداد ملفك الشخصي", 
      category: "البداية",
      file: "getting-started/setup-profile.md",
      views: "12.8K"
    },
    "recharge-points": { 
      title: "كيفية شحن النقاط", 
      category: "المحفظة والنقاط",
      file: "wallet/recharge-points.md",
      views: "28.5K"
    },
    "use-points": { 
      title: "استخدام النقاط لفتح الفصول المميزة", 
      category: "المحفظة والنقاط",
      file: "wallet/use-points.md",
      views: "24.1K"
    },
    "change-password": { 
      title: "تغيير كلمة المرور", 
      category: "الحساب والأمان",
      file: "security/change-password.md",
      views: "18.7K"
    },
    "rich-text-editor": { 
      title: "استخدام محرر النصوص المتقدم", 
      category: "الكتابة والنشر",
      file: "writing/rich-text-editor.md",
      views: "22.3K"
    },
    "create-reading-lists": { 
      title: "إنشاء قوائم قراءة جديدة", 
      category: "قوائم القراءة والمكتبة",
      file: "reading/create-reading-lists.md",
      views: "16.4K"
    },
    "add-to-lists": { 
      title: "إضافة روايات إلى قوائمك", 
      category: "قوائم القراءة والمكتبة",
      file: "reading/add-to-lists.md",
      views: "19.2K"
    },
    "follow-lists": { 
      title: "متابعة قوائم القراءة", 
      category: "قوائم القراءة والمكتبة",
      file: "reading/follow-lists.md",
      views: "11.5K"
    },
    "manage-library": { 
      title: "إدارة المكتبة الشخصية", 
      category: "قوائم القراءة والمكتبة",
      file: "reading/manage-library.md",
      views: "14.8K"
    },
    "bookmarks": { 
      title: "استخدام الإشارات المرجعية", 
      category: "قوائم القراءة والمكتبة",
      file: "reading/bookmarks.md",
      views: "13.1K"
    }
  };

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      setError(null);
      
      const metadata = articlesMetadata[articleId];
      if (!metadata) {
        setError("المقال غير موجود");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/src/docs/${metadata.file}`);
        if (!response.ok) throw new Error("فشل تحميل المقال");
        
        const content = await response.text();
        
        setArticle({
          id: articleId,
          title: metadata.title,
          category: metadata.category,
          lastUpdated: "منذ أسبوع",
          views: metadata.views,
          helpful: Math.floor(Math.random() * 2000) + 500,
          notHelpful: Math.floor(Math.random() * 100) + 10,
          content
        });
      } catch (err) {
        console.error("Error loading article:", err);
        setError("حدث خطأ في تحميل المقال");
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  // Related articles based on category
  const getRelatedArticles = (currentCategory, currentId) => {
    const related = {
      "البداية": [
        { id: "setup-profile", title: "إعداد ملفك الشخصي" },
        { id: "create-account", title: "كيفية إنشاء حساب جديد" }
      ],
      "المحفظة والنقاط": [
        { id: "use-points", title: "استخدام النقاط لفتح الفصول المميزة" },
        { id: "recharge-points", title: "كيفية شحن النقاط" }
      ],
      "الحساب والأمان": [
        { id: "change-password", title: "تغيير كلمة المرور" }
      ],
      "الكتابة والنشر": [
        { id: "rich-text-editor", title: "استخدام محرر النصوص المتقدم" }
      ],
      "قوائم القراءة والمكتبة": [
        { id: "create-reading-lists", title: "إنشاء قوائم قراءة جديدة" },
        { id: "add-to-lists", title: "إضافة روايات إلى قوائمك" },
        { id: "follow-lists", title: "متابعة قوائم القراءة" },
        { id: "manage-library", title: "إدارة المكتبة الشخصية" },
        { id: "bookmarks", title: "استخدام الإشارات المرجعية" }
      ]
    };

    return (related[currentCategory] || [])
      .filter(a => a.id !== currentId)
      .slice(0, 3)
      .map(a => ({ ...a, category: currentCategory }));
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="bg-[#36393f] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#5865f2] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-[#dcddde] text-lg noto-sans-arabic-regular">جاري التحميل...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Header />
        <div className="bg-[#36393f] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#2f3136] flex items-center justify-center mx-auto mb-6">
              <Eye size={48} className="text-[#72767d]" />
            </div>
            <h2 className="text-white text-3xl font-bold mb-3 noto-sans-arabic-bold">
              {error || "المقال غير موجود"}
            </h2>
            <p className="text-[#b9bbbe] text-lg mb-6 noto-sans-arabic-regular">
              عذراً، لم نتمكن من العثور على هذا المقال
            </p>
            <Link 
              to="/help"
              className="inline-block px-6 py-3 bg-[#5865f2] text-white rounded-lg hover:bg-[#4752c4] transition-colors noto-sans-arabic-medium"
            >
              العودة إلى مركز المساعدة
            </Link>
          </div>
        </div>
      </>
    );
  }

  const relatedArticles = getRelatedArticles(article.category, article.id);

  return (
    <>
      <Header />
      <div className="bg-[#36393f] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <Link
              to="/help"
              className="text-[#4A9EFF] hover:underline noto-sans-arabic-medium"
            >
              مركز المساعدة
            </Link>
            <ChevronRight size={16} className="text-[#686868]" />
            <Link
              to="/help"
              className="text-[#4A9EFF] hover:underline noto-sans-arabic-medium"
            >
              {article.category}
            </Link>
            <ChevronRight size={16} className="text-[#686868]" />
            <span className="text-[#B8B8B8] noto-sans-arabic-regular">
              {article.title}
            </span>
          </div>

          {/* Article Header */}
          <div className="mb-8">
            <h1 className="text-white text-4xl font-black mb-4 noto-sans-arabic-bold">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#9db9a6]">
              <div className="flex items-center gap-1.5">
                <Clock size={16} />
                <span className="noto-sans-arabic-regular">
                  آخر تحديث: {article.lastUpdated}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Eye size={16} />
                <span className="noto-sans-arabic-regular">
                  {article.views} مشاهدة
                </span>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="bg-[#2f3136] rounded-lg p-8 mb-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => (
                  <h1 className="text-white text-4xl font-bold mt-10 mb-6 noto-sans-arabic-bold" {...props} />
                ),
                h2: ({node, ...props}) => (
                  <h2 className="text-white text-3xl font-bold mt-8 mb-5 noto-sans-arabic-bold" {...props} />
                ),
                h3: ({node, ...props}) => (
                  <h3 className="text-white text-2xl font-bold mt-6 mb-4 noto-sans-arabic-bold" {...props} />
                ),
                h4: ({node, ...props}) => (
                  <h4 className="text-white text-xl font-bold mt-5 mb-3 noto-sans-arabic-bold" {...props} />
                ),
                p: ({node, ...props}) => (
                  <p className="text-[#dcddde] mb-4 leading-relaxed text-base noto-sans-arabic-regular" {...props} />
                ),
                ul: ({node, ...props}) => (
                  <ul className="mr-6 mb-4 list-disc space-y-2" {...props} />
                ),
                ol: ({node, ...props}) => (
                  <ol className="mr-6 mb-4 list-decimal space-y-2" {...props} />
                ),
                li: ({node, ...props}) => (
                  <li className="text-[#dcddde] noto-sans-arabic-regular" {...props} />
                ),
                strong: ({node, ...props}) => (
                  <strong className="text-white font-bold noto-sans-arabic-bold" {...props} />
                ),
                em: ({node, ...props}) => (
                  <em className="text-[#00b0f4] italic" {...props} />
                ),
                code: ({node, inline, ...props}) => 
                  inline ? (
                    <code className="bg-[#36393f] text-[#00b0f4] px-2 py-1 rounded text-sm font-mono" {...props} />
                  ) : (
                    <code className="block bg-[#36393f] text-[#dcddde] p-4 rounded-lg mb-4 overflow-x-auto font-mono text-sm" {...props} />
                  ),
                pre: ({node, ...props}) => (
                  <pre className="bg-[#36393f] p-4 rounded-lg mb-4 overflow-x-auto" {...props} />
                ),
                blockquote: ({node, ...props}) => (
                  <blockquote className="border-r-4 border-[#5865f2] bg-[#36393f] pr-4 py-2 my-4 italic text-[#b9bbbe]" {...props} />
                ),
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-collapse bg-[#36393f] rounded-lg overflow-hidden" {...props} />
                  </div>
                ),
                thead: ({node, ...props}) => (
                  <thead className="bg-[#2f3136]" {...props} />
                ),
                th: ({node, ...props}) => (
                  <th className="border border-[#4A4A4A] px-4 py-3 text-right text-white font-bold noto-sans-arabic-bold" {...props} />
                ),
                td: ({node, ...props}) => (
                  <td className="border border-[#4A4A4A] px-4 py-3 text-[#dcddde] noto-sans-arabic-regular" {...props} />
                ),
                hr: ({node, ...props}) => (
                  <hr className="border-t-2 border-[#4A4A4A] my-8" {...props} />
                ),
                a: ({node, ...props}) => (
                  <a className="text-[#00b0f4] hover:underline" {...props} />
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Was this helpful? */}
          <div className="bg-[#2f3136] rounded-lg p-6 mb-8 text-center">
            <h3 className="text-white text-lg font-bold mb-4 noto-sans-arabic-bold">
              هل كانت هذه المقالة مفيدة؟
            </h3>
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#36393f] text-white rounded-lg hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium">
                <ThumbsUp size={20} />
                <span>نعم ({article.helpful})</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#36393f] text-white rounded-lg hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium">
                <ThumbsDown size={20} />
                <span>لا ({article.notHelpful})</span>
              </button>
            </div>
          </div>

          {/* Related Articles */}
          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div>
              <h3 className="text-white text-xl font-bold mb-4 noto-sans-arabic-bold">
                مقالات ذات صلة
              </h3>
              <div className="space-y-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/help/article/${related.id}`}
                    className="flex items-center justify-between p-4 bg-[#2f3136] rounded-lg hover:bg-[#36393f] border border-transparent hover:border-[#00b0f4] transition-all group"
                  >
                    <div>
                      <h4 className="text-white text-base font-medium group-hover:text-[#00b0f4] transition-colors noto-sans-arabic-medium mb-1">
                        {related.title}
                      </h4>
                      <p className="text-[#72767d] text-sm noto-sans-arabic-regular">
                        {related.category}
                      </p>
                    </div>
                    <ChevronRight size={20} className="text-[#72767d] group-hover:text-[#00b0f4] transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpArticlePage;
