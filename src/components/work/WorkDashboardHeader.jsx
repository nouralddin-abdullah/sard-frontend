import { CalendarDays, PenLine, Plus, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HighlightStat = ({ label, value, helper, icon: Icon, testId }) => (
  <div
    className="flex items-center gap-4 bg-zinc-900/70 border border-zinc-700/60 rounded-2xl px-5 py-4"
    data-testid={testId}
  >
    <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-200 flex items-center justify-center">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-2xl font-semibold text-zinc-50 leading-tight">{value}</p>
      <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      {helper && <p className="text-xs text-zinc-400 mt-2">{helper}</p>}
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
    <header className="relative overflow-hidden rounded-[32px] border border-zinc-700 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/40 px-8 py-10 shadow-[0_35px_120px_-45px_rgba(37,99,235,0.75)]">
      <div className="absolute inset-0 pointer-events-none opacity-40" aria-hidden>
        <div className="absolute -top-32 -left-16 h-64 w-64 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-20 right-10 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      <div className="relative grid gap-10 lg:grid-cols-[2.5fr_2fr]">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.45em] text-blue-200">
              <Sparkles className="w-3.5 h-3.5" /> Creator workspace
            </span>
            <h1 className="text-4xl md:text-5xl font-semibold text-zinc-50 leading-tight">
              Shape ambitious stories with a well-crafted production hub
            </h1>
            <p className="text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed">
              Keep your ideas, drafts, and launches organised. Track readiness at a glance, quickly open works that need attention, and ship polished narratives faster.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <HighlightStat
              label="Ongoing works"
              value={ongoingCount}
              helper="Stories currently receiving updates"
              icon={PenLine}
              testId="highlight-ongoing"
            />
            <HighlightStat
              label="Completed arcs"
              value={completedCount}
              helper="Finished sagas ready for binge sessions"
              icon={Sparkles}
              testId="highlight-completed"
            />
            <HighlightStat
              label="Total works"
              value={totalWorks}
              helper={`Across every lifecycle stage • ${hiatusCount} on pause`}
              icon={Plus}
              testId="highlight-total"
            />
            <HighlightStat
              label="Last update"
              value={lastUpdatedLabel}
              helper="Most recent change across your portfolio"
              icon={CalendarDays}
              testId="highlight-last-updated"
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl bg-zinc-900/70 border border-zinc-700/70 px-6 py-7 shadow-[0_25px_55px_-35px_rgba(59,130,246,0.7)] space-y-5">
            <h2 className="text-xl font-semibold text-zinc-50">Quick actions</h2>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Start something new, review your publishing checklist, or learn how top creators organise their production pipeline.
            </p>
            <Link
              to="/novel/create"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-400"
            >
              <Plus className="w-4 h-4" /> Start a brand new work
            </Link>
            <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 px-4 py-4 space-y-3">
              <p className="text-sm font-medium text-blue-100">Production checklist</p>
              <ul className="space-y-2 text-xs text-blue-100/80">
                <li>• Outline core premise and key arcs</li>
                <li>• Define release cadence and chapter cadence</li>
                <li>• Prepare launch assets and promotional copy</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
};

export default WorkDashboardHeader;
