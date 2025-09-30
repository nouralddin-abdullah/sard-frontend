import { ArrowRight, NotebookPen } from "lucide-react";
import { Link } from "react-router-dom";

const WorkEmptyState = () => {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-dashed border-zinc-700/60 bg-gradient-to-br from-zinc-950 via-zinc-900 to-blue-950/30 px-10 py-16 text-center shadow-[0_35px_110px_-60px_rgba(59,130,246,0.6)]">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-24 right-10 h-48 w-48 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-32 left-8 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-blue-400/40 bg-blue-500/15 text-blue-200">
          <NotebookPen className="h-10 w-10" />
        </div>
        <h3 className="text-3xl font-semibold text-zinc-50">
          Build your first flagship work
        </h3>
        <p className="text-base text-zinc-300 leading-relaxed">
          Capture your premise, visual identity, and publishing roadmap in one flow. We&apos;ll guide you from idea to polished release-ready chapters.
        </p>
        <div className="grid gap-4 text-left sm:grid-cols-3">
          {[
            "Outline the story pillars and reader promise",
            "Upload a compelling hero cover to set the tone",
            "Plan launch cadence with milestones and drafts",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-zinc-700/70 bg-zinc-900/60 px-4 py-4 text-sm text-zinc-300"
            >
              {item}
            </div>
          ))}
        </div>
        <Link
          to="/novel/create"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-400"
        >
          Launch the creation flow
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
};

export default WorkEmptyState;
