import React from "react";
import { ChevronRight, ThumbsUp, ThumbsDown, Clock, Eye } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/common/Header";

const HelpArticlePage = () => {
  const { articleId } = useParams();

  // Placeholder article data
  const article = {
    id: articleId,
    title: "كيفية شحن النقاط",
    category: "المحفظة والنقاط",
    lastUpdated: "منذ 3 أيام",
    views: "20K",
    helpful: 1234,
    notHelpful: 45,
    content: `
## نظرة عامة

شحن النقاط في منصتنا عملية سهلة وآمنة. يمكنك استخدام النقاط لفتح الفصول المميزة، شراء الباقات المدفوعة، وإهداء الكتّاب المفضلين لديك.

## الخطوات

### 1. الذهاب إلى المحفظة

انتقل إلى صفحة ملفك الشخصي واضغط على تبويب "المحفظة" في القائمة العلوية.

### 2. اختيار كمية النقاط

- يمكنك اختيار أحد الخيارات السريعة: 500، 1000، 2000، 5000 نقطة
- أو إدخال الكمية المخصصة التي تريدها (الحد الأدنى 500 نقطة)
- كل 10 نقاط = 1 جنيه مصري

### 3. اختيار طريقة الدفع

نوفر ثلاث طرق للدفع:

**Vodafone Cash**
- الأسرع والأكثر شيوعاً في مصر
- التحويل فوري بعد التحقق

**InstaPay**
- طريقة دفع حديثة وآمنة
- مناسبة لجميع البنوك المصرية

**PayPal**
- للمستخدمين خارج مصر
- يتم احتساب المبلغ بالدولار الأمريكي (1$ = 47 جنيه)

### 4. إتمام الدفع

1. بعد اختيار طريقة الدفع، اضغط على "إتمام الشراء"
2. سيتم عرض تفاصيل الدفع (رقم الحساب أو البريد الإلكتروني)
3. قم بإرسال المبلغ المطلوب إلى الحساب المعروض
4. التقط لقطة شاشة لإثبات الدفع

### 5. رفع إثبات الدفع

- اسحب وأفلت لقطة شاشة الدفع، أو اضغط للتصفح
- تأكد من وضوح الصورة وظهور جميع التفاصيل
- اضغط "إرسال للتحقق"

## الرسوم

- رسوم المعاملة: 10% من قيمة الشراء
- تشمل الرسوم تكاليف معالجة الدفع والضرائب

## وقت التحقق

- عادة يتم التحقق خلال 24 ساعة
- في أوقات الذروة قد يستغرق حتى 48 ساعة
- ستصلك إشعار فور إضافة النقاط إلى حسابك

## الأسئلة الشائعة

**هل يمكنني إلغاء طلب الشحن؟**
نعم، يمكنك إلغاء الطلب قبل التحقق منه من خلال صفحة المحفظة.

**ماذا لو رفض طلبي؟**
في حالة الرفض، سيتم إخبارك بالسبب. يمكنك إعادة المحاولة مع التأكد من صحة البيانات.

**هل النقاط لها تاريخ انتهاء؟**
لا، النقاط المشحونة صالحة للاستخدام دون حد زمني.

## المساعدة

إذا واجهت أي مشكلة أثناء عملية الشحن، يرجى التواصل مع فريق الدعم.
    `
  };

  // Related articles
  const relatedArticles = [
    { id: 2, title: "استخدام النقاط لفتح الفصول المميزة", category: "المحفظة والنقاط" },
    { id: 3, title: "إهداء النقاط للكتّاب", category: "المحفظة والنقاط" },
    { id: 4, title: "سياسة الاسترجاع والإلغاء", category: "المحفظة والنقاط" },
  ];

  return (
    <>
      <Header />
      <div className="bg-zinc-800 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
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
          <div className="bg-[#2C2C2C] border border-[#3A3A3A] rounded-xl p-8 mb-8">
            <div
              className="prose prose-invert max-w-none"
              style={{
                color: "#B8B8B8",
                fontSize: "16px",
                lineHeight: "1.8"
              }}
            >
              {article.content.split('\n').map((line, index) => {
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-white text-2xl font-bold mt-8 mb-4 noto-sans-arabic-bold">
                      {line.replace('## ', '')}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-white text-xl font-bold mt-6 mb-3 noto-sans-arabic-bold">
                      {line.replace('### ', '')}
                    </h3>
                  );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={index} className="text-white font-bold mt-4 mb-2 noto-sans-arabic-bold">
                      {line.replace(/\*\*/g, '')}
                    </p>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={index} className="text-[#B8B8B8] mb-2 mr-6 noto-sans-arabic-regular">
                      {line.replace('- ', '')}
                    </li>
                  );
                }
                if (line.match(/^\d+\. /)) {
                  return (
                    <li key={index} className="text-[#B8B8B8] mb-2 mr-6 noto-sans-arabic-regular list-decimal">
                      {line.replace(/^\d+\. /, '')}
                    </li>
                  );
                }
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="text-[#B8B8B8] mb-3 noto-sans-arabic-regular">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          {/* Was this helpful? */}
          <div className="bg-[#2C2C2C] border border-[#3A3A3A] rounded-xl p-6 mb-8 text-center">
            <h3 className="text-white text-lg font-bold mb-4 noto-sans-arabic-bold">
              هل كانت هذه المقالة مفيدة؟
            </h3>
            <div className="flex items-center justify-center gap-4">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#3A3A3A] text-white rounded-lg hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium">
                <ThumbsUp size={20} />
                <span>نعم ({article.helpful})</span>
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#3A3A3A] text-white rounded-lg hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium">
                <ThumbsDown size={20} />
                <span>لا ({article.notHelpful})</span>
              </button>
            </div>
          </div>

          {/* Related Articles */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4 noto-sans-arabic-bold">
              مقالات ذات صلة
            </h3>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/help/article/${related.id}`}
                  className="flex items-center justify-between p-4 bg-[#2C2C2C] border border-[#3A3A3A] rounded-lg hover:border-[#4A9EFF] transition-colors group"
                >
                  <div className="flex-1">
                    <h4 className="text-white text-base font-medium group-hover:text-[#4A9EFF] transition-colors noto-sans-arabic-medium">
                      {related.title}
                    </h4>
                    <p className="text-[#686868] text-sm mt-1 noto-sans-arabic-regular">
                      {related.category}
                    </p>
                  </div>
                  <ChevronRight size={20} className="text-[#686868] group-hover:text-[#4A9EFF] transition-colors flex-shrink-0 mr-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpArticlePage;
