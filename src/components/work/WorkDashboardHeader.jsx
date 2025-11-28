import { CalendarDays, PenLine, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HighlightStat = ({ label, value, helper, icon: Icon, testId }) => (
  <div
    className="flex items-center gap-3 md:gap-4 bg-[#3C3C3C] border border-[#5A5A5A] rounded-xl px-3 md:px-5 py-3 md:py-4 hover:bg-[#444444] transition-colors"
    data-testid={testId}
  >
    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-[#0077FF]/20 text-[#0077FF] flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 md:w-5 md:h-5" />
    </div>
    <div className="min-w-0">
      <p className="text-lg md:text-2xl noto-sans-arabic-extrabold text-white leading-tight truncate">{value}</p>
      <p className="text-xs noto-sans-arabic-medium text-[#797979]">{label}</p>
      {helper && <p className="text-xs text-[#686868] mt-1 md:mt-2 noto-sans-arabic-medium line-clamp-1">{helper}</p>}
    </div>
  </div>
);

const WorkDashboardHeader = ({
  totalWorks = 0,
  ongoingCount = 0,
  completedCount = 0,
  hiatusCount = 0,
  lastUpdatedLabel = "No updates yet",
}) => {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-[#5A5A5A] bg-[#3C3C3C] px-4 md:px-8 py-6 md:py-10">
      <div className="relative grid gap-6 md:gap-10 lg:grid-cols-[2.5fr_2fr]">
        <div className="space-y-6 md:space-y-8">
          <div className="space-y-3 md:space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0077FF]/20 px-3 md:px-4 py-1.5 md:py-2 text-xs noto-sans-arabic-bold text-[#0077FF]">
              <Sparkles className="w-3.5 h-3.5" /> مساحة الكاتب
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl noto-sans-arabic-extrabold text-white leading-tight">
              لوحة التحكم الخاصة بأعمالك
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-[#B8B8B8] max-w-2xl leading-relaxed noto-sans-arabic-medium">
              تابع أعمالك ومسوداتك وإصداراتك بشكل منظم. تتبع جاهزية رواياتك بنظرة واحدة وأطلق قصصاً مصقولة بشكل أسرع.
            </p>
          </div>

          <div className="grid gap-3 md:gap-4 grid-cols-2">
            <HighlightStat
              label="أعمال جارية"
              value={ongoingCount}
              helper="قصص تتلقى تحديثات حالياً"
              icon={PenLine}
              testId="highlight-ongoing"
            />
            <HighlightStat
              label="أعمال مكتملة"
              value={completedCount}
              helper="روايات منتهية جاهزة للقراءة"
              icon={Sparkles}
              testId="highlight-completed"
            />
            <HighlightStat
              label="إجمالي الأعمال"
              value={totalWorks}
              helper={`في جميع المراحل • ${hiatusCount} متوقف مؤقتاً`}
              icon={Plus}
              testId="highlight-total"
            />
            <HighlightStat
              label="آخر تحديث"
              value={lastUpdatedLabel}
              helper="آخر تغيير في أعمالك"
              icon={CalendarDays}
              testId="highlight-last-updated"
            />
          </div>
        </div>

        <aside className="space-y-4 md:space-y-6">
          <div className="rounded-2xl bg-[#2C2C2C] border border-[#5A5A5A] px-4 md:px-6 py-5 md:py-7 space-y-4 md:space-y-5">
            <h2 className="text-lg md:text-xl noto-sans-arabic-extrabold text-white">إجراءات سريعة</h2>
            <p className="text-xs md:text-sm text-[#B8B8B8] leading-relaxed noto-sans-arabic-medium">
              ابدأ عملاً جديداً، راجع قائمة النشر، أو تعلم كيف ينظم الكتّاب الكبار عملية الإنتاج.
            </p>
            <Link
              to="/novel/create"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0077FF] px-4 md:px-5 py-2.5 md:py-3 text-sm noto-sans-arabic-bold text-white transition-all duration-200 hover:bg-[#0066DD]"
            >
              <Plus className="w-4 h-4" /> ابدأ عملاً جديداً
            </Link>
            <div className="rounded-xl border border-[#0077FF]/40 bg-[#0077FF]/10 px-3 md:px-4 py-3 md:py-4 space-y-2 md:space-y-3">
              <p className="text-xs md:text-sm noto-sans-arabic-bold text-[#0077FF]">قائمة الإنتاج</p>
              <ul className="space-y-1.5 md:space-y-2 text-xs text-[#B8B8B8] noto-sans-arabic-medium">
                <li>• حدد الفكرة الأساسية والأحداث الرئيسية</li>
                <li>• حدد جدول النشر وعدد الفصول</li>
                <li>• جهز الصور والمواد الترويجية</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default WorkDashboardHeader;
