import { ArrowRight, NotebookPen } from "lucide-react";
import { Link } from "react-router-dom";

const WorkEmptyState = () => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-dashed border-[#5A5A5A] bg-[#3C3C3C] px-10 py-16 text-center">
      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#0077FF]/40 bg-[#0077FF]/20 text-[#0077FF]">
          <NotebookPen className="h-10 w-10" />
        </div>
        <h3 className="text-3xl noto-sans-arabic-extrabold text-white">
          أنشئ عملك الأول
        </h3>
        <p className="text-base text-[#B8B8B8] leading-relaxed noto-sans-arabic-medium">
          احفظ فكرتك، هويتك البصرية، وخطة النشر في مكان واحد. سنرشدك من الفكرة إلى الفصول الجاهزة للنشر.
        </p>
        <div className="grid gap-4 text-right sm:grid-cols-3">
          {[
            "حدد أعمدة القصة ووعد القارئ",
            "ارفع غلاف جذاب لتحديد النمط",
            "خطط جدول الإطلاق بالمراحل والمسودات",
          ].map((item) => (
            <div
              key={item}
              className="rounded-xl border border-[#5A5A5A] bg-[#2C2C2C] px-4 py-4 text-sm text-[#B8B8B8] noto-sans-arabic-medium"
            >
              {item}
            </div>
          ))}
        </div>
        <Link
          to="/novel/create"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#0077FF] px-6 py-3 text-sm noto-sans-arabic-bold text-white transition-all duration-200 hover:bg-[#0066DD]"
        >
          ابدأ عملية الإنشاء
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default WorkEmptyState;
