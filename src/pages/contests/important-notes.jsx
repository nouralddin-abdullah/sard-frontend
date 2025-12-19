import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, AlertTriangle } from 'lucide-react';

const ImportantNotesPage = () => {
  const navigate = useNavigate();

  const notes = [
    {
      number: '01',
      title: 'مراقبة المشاركات',
      description: 'سيقوم المحررون بمراقبة الأعمال التي دخلت المسابقة بنجاح. في حال اكتشاف أي مخالفات، تحتفظ المنصة بالحق في إزالتها وإلغاء حقوق مشاركة المؤلف.',
    },
    {
      number: '02',
      title: 'عدد الكلمات عند التسجيل',
      description: 'لا يوجد حد أدنى لعدد الكلمات عند التسجيل في المسابقة. يجب استيفاء المتطلبات الأساسية لإنشاء كتاب جديد فقط. سيتم مراجعة عدد الكلمات والمتطلبات الأخرى في يوم انتهاء فترة التقديم.',
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
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-yellow-500" />
              <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight noto-sans-arabic-extrabold">
                ملاحظات هامة
              </h1>
            </div>
            <p className="text-gray-400 text-lg font-normal leading-relaxed noto-sans-arabic-medium">
              يرجى قراءة هذه الملاحظات الهامة والشروط والأحكام قبل المشاركة في المسابقة.
            </p>
          </div>
        </div>

        {/* Notes List */}
        <div className="flex flex-col gap-6 pb-16">
          {notes.map((note) => (
            <div 
              key={note.number}
              className="group flex flex-col md:flex-row gap-6 items-start bg-[#2C2C2C] p-6 md:p-8 rounded-xl border border-[#3C3C3C] shadow-sm hover:shadow-md hover:border-[#4A4A4A] transition-all duration-300"
            >
              <div className="shrink-0 select-none">
                <span className="text-6xl md:text-7xl font-black text-[#3C3C3C] tracking-tighter group-hover:text-yellow-500/30 transition-colors noto-sans-arabic-extrabold">
                  {note.number}
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-2xl font-bold tracking-tight noto-sans-arabic-bold">
                  {note.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-[720px] noto-sans-arabic-medium">
                  {note.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-16">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-yellow-500 font-bold mb-2 noto-sans-arabic-bold">تنبيه</h4>
              <p className="text-gray-400 noto-sans-arabic-medium">
                أي مخالفة لهذه الشروط قد تؤدي إلى استبعادك من المسابقة ومصادرة أي جوائز مستحقة. يرجى الالتزام بجميع القواعد والإرشادات.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center pt-8 pb-20 border-t border-[#3C3C3C]">
          <p className="text-gray-500 text-center noto-sans-arabic-medium">
            تطبق هذه الملاحظات على جميع مسابقات سرد
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportantNotesPage;
