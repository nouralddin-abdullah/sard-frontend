import { Link } from "react-router-dom";
import { Eye, Layers, Sparkles, Star } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import mainPicture from "../../assets/mainPicture.jpg";
import GenreBadge from "../common/GenreBadge";

const STATUS_STYLES = {
  ongoing: "bg-[#0077FF]/20 text-[#0077FF] border border-[#0077FF]/40",
  hiatus: "bg-amber-500/15 text-amber-300 border border-amber-400/40",
  completed: "bg-green-500/15 text-green-300 border border-green-400/40",
  archived: "bg-[#5A5A5A]/60 text-[#B8B8B8] border border-[#5A5A5A]/60",
};

const WorkCard = ({ work }) => {
  const statusKey = work?.status?.toLowerCase?.() ?? "ongoing";
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.ongoing;
  
  // Translate status to Arabic
  const statusLabels = {
    ongoing: "مستمر",
    completed: "مكتمل",
    hiatus: "متوقف",
    archived: "مؤرشف"
  };
  const statusLabel = statusLabels[statusKey] || statusLabels.ongoing;
  
  const chapterCount = work?.chapterCount ?? work?.chaptersCount ?? 0;
  const averageScore = Number.isFinite(Number(work?.totalAverageScore))
    ? Number(work.totalAverageScore)
    : undefined;
  const formattedScore =
    averageScore !== undefined && !Number.isNaN(averageScore)
      ? averageScore.toFixed(1)
      : "—";
  const lastUpdatedLabel = work?.lastUpdatedAt ? getTimeAgo(work.lastUpdatedAt) : "—";

  const coverImage = work?.coverImageUrl || mainPicture;
  const workspaceUrl = work?.id ? `/dashboard/works/${work.id}/edit` : undefined;

  return (
    <>
      <article
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#5A5A5A] bg-[#3C3C3C] transition-all duration-300 hover:shadow-xl hover:border-[#0077FF]/50"
        data-testid={`work-card-${work?.id ?? "unknown"}`}
      >
        <div className="relative h-40 md:h-52 overflow-hidden">
          <img
            src={coverImage}
            alt={work?.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C]/90 via-transparent to-[#2C2C2C]/30" />

          <div className="absolute inset-x-4 md:inset-x-6 bottom-3 md:bottom-5 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 md:gap-2 rounded-full px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs noto-sans-arabic-bold ${statusStyle}`}
            >
              <Sparkles className="h-3 w-3 md:h-3.5 md:w-3.5" />
              {statusLabel}
            </span>
            <span className="text-[10px] md:text-xs noto-sans-arabic-medium text-white/90">
              آخر تحديث {lastUpdatedLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 md:gap-6 px-4 md:px-6 pb-4 md:pb-6 pt-4 md:pt-5">
          <div className="space-y-1.5 md:space-y-2">
            <h3 className="text-xl md:text-2xl noto-sans-arabic-extrabold text-white" dir="rtl">
              {work?.title}
            </h3>
            <p className="text-xs md:text-sm leading-relaxed text-[#B8B8B8] line-clamp-2 md:line-clamp-3 noto-sans-arabic-medium" dir="rtl">
              {work?.summary || "لا يوجد ملخص بعد."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatBox
              label="إجمالي المشاهدات"
              value={(work?.totalViews ?? 0).toLocaleString()}
              Icon={Eye}
              subLabel="كل الوقت"
            />
            <StatBox
              label="فصول منشورة"
              value={chapterCount}
              Icon={Layers}
              subLabel={
                chapterCount === 0
                  ? "لا توجد فصول بعد"
                  : chapterCount === 1
                    ? "فصل منشور"
                    : "فصول منشورة"
              }
            />
            <StatBox
              label="التقييم"
              value={formattedScore}
              Icon={Star}
              subLabel={averageScore !== undefined && averageScore > 0 ? "تقييم القراء" : "في انتظار التقييمات"}
            />
          </div>

          {work?.genresList?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.genresList.map((genre) => (
                <GenreBadge key={genre.id} genre={genre} size="sm" />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 md:gap-3 border-t border-[#5A5A5A] bg-[#2C2C2C] px-4 md:px-6 py-3 md:py-5 sm:flex-row sm:items-center sm:justify-between">
          {workspaceUrl && (
            <Link
              to={workspaceUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0077FF] px-3 md:px-4 py-2 text-xs md:text-sm noto-sans-arabic-bold text-white transition hover:bg-[#0066DD]"
            >
              فتح مساحة التحرير
            </Link>
          )}
          {work?.slug && (
            <Link
              to={`/novel/${work.slug}`}
              className="text-xs md:text-sm noto-sans-arabic-medium text-[#0077FF] underline-offset-4 transition hover:text-[#0066DD] hover:underline text-center sm:text-right"
            >
              عرض الصفحة العامة
            </Link>
          )}
        </div>
      </article>
    </>
  );
};

const StatBox = ({ label, value, Icon, subLabel }) => (
  <div className="flex flex-col items-center gap-2 md:gap-3 rounded-xl border border-[#5A5A5A] bg-[#2C2C2C] px-2 md:px-6 py-3 md:py-6 text-center">
    <div className="flex h-8 w-8 md:h-12 md:w-12 items-center justify-center rounded-lg bg-[#0077FF]/20 text-[#0077FF]">
      <Icon className="h-4 w-4 md:h-5 md:w-5" />
    </div>
    <div className="space-y-0.5 md:space-y-1">
      <p className="text-[10px] md:text-xs noto-sans-arabic-medium text-[#797979] line-clamp-1 md:line-clamp-none">{label}</p>
      <p className="text-base md:text-xl noto-sans-arabic-extrabold text-white" dir="rtl">{value}</p>
      {subLabel && <p className="text-[10px] md:text-xs noto-sans-arabic-medium text-[#797979] line-clamp-1 md:line-clamp-none hidden md:block">{subLabel}</p>}
    </div>
  </div>
);

export default WorkCard;
