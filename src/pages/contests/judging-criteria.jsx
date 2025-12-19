import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const JudgingCriteriaPage = () => {
  const navigate = useNavigate();

  const criteria = [
    {
      number: '01',
      title: 'التوافق مع موضوع المسابقة',
      description: 'يجب أن يتوافق المحتوى مع موضوع المسابقة المحدد. الأعمال التي لا تلتزم بالموضوع لن تكون مؤهلة للتحكيم.',
    },
    {
      number: '02',
      title: 'الأصالة والابتكار',
      description: 'فقط الروايات الأصلية مؤهلة للمسابقة. يجب أن تكون القصة من تأليف المشارك بالكامل دون أي نسخ أو اقتباس غير مصرح به.',
    },
    {
      number: '03',
      title: 'الحد الأدنى من الكلمات',
      description: 'يجب أن يكون العمل رواية طويلة ومسلسلة باستمرار، بحد أدنى 80,000 كلمة لأغراض التحكيم. الأعمال التي لا تصل لهذا الحد لن تُقبل.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white font-sans" dir="rtl">
      {/* Back Button Header */}
      <div className="sticky top-0 z-50 bg-[#1E1E1E]/95 backdrop-blur-sm border-b border-[#3C3C3C]">
        <div className="max-w-[960px] mx-auto px-4 md:px-10 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
            <span className="noto-sans-arabic-medium">العودة</span>
          </button>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 md:px-10 py-10">
        {/* Page Heading */}
        <div className="flex flex-col gap-6 py-6 md:pb-12">
          <div className="flex flex-col gap-4 max-w-[720px]">
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight noto-sans-arabic-extrabold">
              معايير التحكيم
            </h1>
            <p className="text-gray-400 text-lg font-normal leading-relaxed noto-sans-arabic-medium">
              سيتم تقييم المشاركات من قبل لجنة التحكيم بناءً على المعايير التالية. يرجى مراجعتها بعناية قبل تقديم مشاركتك.
            </p>
          </div>
        </div>

        {/* Criteria List */}
        <div className="flex flex-col gap-6 pb-16">
          {criteria.map((criterion) => (
            <div 
              key={criterion.number}
              className="group flex flex-col md:flex-row gap-6 items-start bg-[#2C2C2C] p-6 md:p-8 rounded-xl border border-[#3C3C3C] shadow-sm hover:shadow-md hover:border-[#4A4A4A] transition-all duration-300"
            >
              <div className="shrink-0 select-none">
                <span className="text-6xl md:text-7xl font-black text-[#3C3C3C] tracking-tighter group-hover:text-[#4A9EFF]/30 transition-colors noto-sans-arabic-extrabold">
                  {criterion.number}
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-2xl font-bold tracking-tight noto-sans-arabic-bold">
                  {criterion.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-[720px] noto-sans-arabic-medium">
                  {criterion.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center pt-8 pb-20 border-t border-[#3C3C3C]">
          <p className="text-gray-500 text-center noto-sans-arabic-medium">
            تطبق هذه المعايير على جميع مسابقات سرد
          </p>
        </div>
      </div>
    </div>
  );
};

export default JudgingCriteriaPage;
