import { Link } from "react-router-dom";
import { Eye, Layers, Sparkles, Star } from "lucide-react";
import { getTimeAgo } from "../../utils/date";
import mainPicture from "../../assets/mainPicture.jpg";

const STATUS_STYLES = {
  ongoing: "bg-blue-500/15 text-blue-200 border border-blue-400/40",
  hiatus: "bg-amber-500/15 text-amber-200 border border-amber-400/40",
  completed: "bg-purple-500/15 text-purple-200 border border-purple-400/40",
  archived: "bg-zinc-700/60 text-zinc-200 border border-zinc-600/60",
};

const WorkCard = ({ work }) => {
  const statusKey = work?.status?.toLowerCase?.() ?? "ongoing";
  const statusStyle = STATUS_STYLES[statusKey] ?? STATUS_STYLES.ongoing;
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
        className="group relative flex flex-col overflow-hidden rounded-[28px] border border-zinc-800/70 bg-gradient-to-b from-zinc-900 via-zinc-900/80 to-zinc-950/80 shadow-[0_18px_60px_-24px_rgba(15,23,42,0.7)] transition-transform duration-300 hover:-translate-y-1"
        data-testid={`work-card-${work?.id ?? "unknown"}`}
      >
        <div className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden>
          <div className="absolute inset-x-8 top-0 h-1 rounded-full bg-gradient-to-r from-blue-500 via-sky-400 to-indigo-500" />
        </div>

  <div className="relative h-52 overflow-hidden">
          <img
            src={coverImage}
            alt={work?.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/30" />

          <div className="absolute inset-x-6 bottom-5 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyle}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {work?.status || "Ongoing"}
            </span>
            <span className="text-xs font-medium text-zinc-200/90">
              Updated {lastUpdatedLabel}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-6 pb-6 pt-5">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-zinc-100" dir="auto">
              {work?.title}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400 line-clamp-3" dir="auto">
              {work?.summary || "No summary provided yet."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatBox
              label="Total views"
              value={(work?.totalViews ?? 0).toLocaleString()}
              Icon={Eye}
              subLabel="Lifetime"
            />
            <StatBox
              label="Chapters live"
              value={chapterCount}
              Icon={Layers}
              subLabel={
                chapterCount === 0
                  ? "No chapters yet"
                  : chapterCount === 1
                    ? "Chapter published"
                    : "Chapters published"
              }
            />
            <StatBox
              label="Score"
              value={formattedScore}
              Icon={Star}
              subLabel={averageScore !== undefined && averageScore > 0 ? "Community rating" : "Awaiting reviews"}
            />
          </div>

          {work?.genresList?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {work.genresList.map((genre) => (
                <span
                  key={genre.id}
                  className="rounded-full border border-zinc-700/70 bg-zinc-800/80 px-3 py-1 text-xs uppercase tracking-wide text-zinc-200"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-zinc-800/60 bg-zinc-900/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          {workspaceUrl && (
            <Link
              to={workspaceUrl}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-400"
            >
              Open editing workspace
            </Link>
          )}
          {work?.slug && (
            <Link
              to={`/novel/${work.slug}`}
              className="text-sm font-medium text-blue-300 underline-offset-4 transition hover:text-blue-200 hover:underline"
            >
              View public page
            </Link>
          )}
        </div>
      </article>
    </>
  );
};

const StatBox = ({ label, value, Icon, subLabel }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 px-6 py-6 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800/70 text-zinc-100">
      <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      <p className="text-xl font-semibold text-zinc-100" dir="auto">{value}</p>
      {subLabel && <p className="text-xs text-zinc-500">{subLabel}</p>}
    </div>
  </div>
);

export default WorkCard;
