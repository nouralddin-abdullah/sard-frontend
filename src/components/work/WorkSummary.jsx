import { ArrowUpRight, Clock3, Sparkles, UsersRound } from "lucide-react";

const computeLastUpdated = (works) => {
  const timestamps = works
    .map((work) => {
      if (!work?.lastUpdatedAt) return null;
      // Ensure UTC parsing
      const dateStr = work.lastUpdatedAt.endsWith('Z') ? work.lastUpdatedAt : work.lastUpdatedAt + 'Z';
      return new Date(dateStr);
    })
    .filter((date) => date instanceof Date && !Number.isNaN(date?.getTime()));

  if (timestamps.length === 0) return "لا توجد تحديثات";

  const mostRecent = timestamps.sort((a, b) => b.getTime() - a.getTime())[0];
  const day = mostRecent.getDate();
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const month = months[mostRecent.getMonth()];
  const year = mostRecent.getFullYear();
  
  return `${day} ${month} ${year}`;
};

const insightCards = [
  {
    key: "momentum",
    title: "Momentum",
    description:
      "Focus your energy on works moving through the pipeline right now. Prioritise drafts with active feedback loops.",
    accent:
      "bg-gradient-to-br from-blue-600/25 to-indigo-500/25 border-blue-400/40",
    icon: Sparkles,
  },
  {
    key: "cadence",
    title: "Release cadence",
    description:
      "Set a consistent publishing rhythm. Readers trust creators who ship on a predictable timeline.",
    accent:
      "bg-gradient-to-br from-purple-600/20 to-violet-500/20 border-purple-400/40",
    icon: Clock3,
  },
];

const WorkSummary = ({ works = [], isLoading = false }) => {
  const totalWorks = works.length;
  const ongoingCount = works.filter(
    (work) => work?.status?.toLowerCase() === "ongoing"
  ).length;
  const completedCount = works.filter(
    (work) => work?.status?.toLowerCase() === "completed"
  ).length;
  const hiatusCount = works.filter(
    (work) => work?.status?.toLowerCase() === "hiatus"
  ).length;
  const totalViews = works.reduce(
    (acc, work) => acc + (work.totalViews || 0),
    0
  );
  const lastUpdated = computeLastUpdated(works);

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1.1fr]">
      <div className="rounded-[28px] border border-zinc-700/70 bg-zinc-900/80 px-8 py-7 shadow-[0_20px_55px_-35px_rgba(0,0,0,0.7)]">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">
              Portfolio health
            </p>
            <h2 className="text-2xl font-semibold text-zinc-50 mt-1">
              Your pipeline at a glance
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <ArrowUpRight className="w-3 h-3" /> Updated{" "}
            {isLoading ? "just now" : lastUpdated}
          </div>
        </header>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatBlock
            label="إجمالي الأعمال"
            value={isLoading ? "—" : totalWorks}
            caption="جميع المشاريع"
          />
          <StatBlock
            label="جاري"
            value={isLoading ? "—" : ongoingCount}
            caption="قيد الإنتاج"
          />
          <StatBlock
            label="مكتمل"
            value={isLoading ? "—" : completedCount}
            caption="جاهز للقراءة"
          />
          <StatBlock
            label="متوقف"
            value={isLoading ? "—" : hiatusCount}
            caption="في فترة راحة"
          />
          <StatBlock
            label="Lifetime views"
            value={isLoading ? "—" : totalViews.toLocaleString()}
            caption="Audience reach"
            // icon={UsersRound}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {insightCards.map(({ key, title, description, accent, icon: Icon }) => (
          <article
            key={key}
            className={`rounded-3xl border px-5 py-6 backdrop-blur-sm ${accent} shadow-[0_16px_50px_-40px_rgba(79,70,229,0.8)]`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-50">{title}</h3>
            </div>
            <p className="mt-3 text-sm text-zinc-200/90 leading-relaxed">
              {description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
};

const StatBlock = ({ label, value, caption, icon: Icon }) => {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900/60 px-5 py-4 text-center">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-zinc-400 uppercase tracking-[0.25em]">
            {label}
          </p>
          <p className="mt-3 text-3xl font-semibold text-zinc-50">{value}</p>
          <p className="mt-1 text-xs text-zinc-500">{caption}</p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-zinc-800/70 text-zinc-400 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkSummary;
