import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const WinningRulesPage = () => {
  const navigate = useNavigate();

  const rules = [
    {
      number: '01',
      title: 'الالتزام بإرشادات المحتوى',
      description: 'يجب أن تلتزم الأعمال الفائزة بإرشادات إنشاء المحتوى الخاصة بسرد. سيتم إلغاء أهلية الجوائز للمشاركات التي تُكتشف مخالفتها.',
    },
    {
      number: '02',
      title: 'حظر الانتحال والكتابة المشتركة',
      description: 'يُحظر تمامًا الانتحال أو الكتابة المشتركة أو الكتابة الشبحية للمشاركات. في حال اكتشاف أي من هذه المخالفات، سيتم استبعاد المؤلف وجميع أعماله من المسابقة، ولن يتم صرف أي مكافأة.',
    },
    {
      number: '03',
      title: 'آلية تحديد الفائزين',
      description: 'سيتم تحديد قائمة الفائزين بالتعاون بين فريق التحرير وفريق البرمجة وكتّاب مشهورين، بناءً على بيانات أداء الأعمال وجودة المحتوى وتفاعل القراء وثراء محتوى ويكيبيديا.',
    },
    {
      number: '04',
      title: 'التوقيع الحصري مع سرد',
      description: 'يجب أن تكون الأعمال الفائزة موقعة حصريًا مع سرد. لا يُسمح بنشر العمل على منصات أخرى.',
    },
    {
      number: '05',
      title: 'صرف الجوائز النقدية',
      description: 'لضمان تجربة قراءة مُرضية للقراء ومنع تخلي المؤلفين عن أعمالهم في منتصف الطريق، سيتم توزيع الجائزة النقدية للمشاركات الفائزة بعد شهر واحد من إعلان النتائج. ومع ذلك، إذا ظل العمل في حالة توقف لأكثر من أسبوع خلال هذه الفترة، سيتم مصادرة أي جائزة نقدية معلقة.',
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
              قواعد الفوز
            </h1>
            <p className="text-gray-400 text-lg font-normal leading-relaxed noto-sans-arabic-medium">
              يرجى قراءة قواعد الفوز بعناية لضمان أهليتك للحصول على الجوائز.
            </p>
          </div>
        </div>

        {/* Rules List */}
        <div className="flex flex-col gap-6 pb-16">
          {rules.map((rule) => (
            <div 
              key={rule.number}
              className="group flex flex-col md:flex-row gap-6 items-start bg-[#2C2C2C] p-6 md:p-8 rounded-xl border border-[#3C3C3C] shadow-sm hover:shadow-md hover:border-[#4A4A4A] transition-all duration-300"
            >
              <div className="shrink-0 select-none">
                <span className="text-6xl md:text-7xl font-black text-[#3C3C3C] tracking-tighter group-hover:text-[#4A9EFF]/30 transition-colors noto-sans-arabic-extrabold">
                  {rule.number}
                </span>
              </div>
              <div className="flex flex-col gap-3 pt-2">
                <h3 className="text-2xl font-bold tracking-tight noto-sans-arabic-bold">
                  {rule.title}
                </h3>
                <p className="text-gray-400 text-base leading-relaxed max-w-[720px] noto-sans-arabic-medium">
                  {rule.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="flex flex-col items-center justify-center pt-8 pb-20 border-t border-[#3C3C3C]">
          <p className="text-gray-500 text-center noto-sans-arabic-medium">
            تطبق هذه القواعد على جميع مسابقات سرد
          </p>
        </div>
      </div>
    </div>
  );
};

export default WinningRulesPage;
