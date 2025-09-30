import Button from "../ui/button";
import { RotateCcw, Search } from "lucide-react";

const statusOptions = [
  { value: "all", label: "All" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const WorkFilters = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClearFilters,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <section className="rounded-[26px] border border-zinc-800 bg-zinc-900/70 px-6 py-5 shadow-[0_20px_55px_-45px_rgba(15,23,42,0.9)]">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Filters</p>
          <h3 className="text-lg font-semibold text-zinc-50">Refine your workspace</h3>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs font-medium text-blue-300 hover:text-blue-200"
        >
          Reset filters
        </button>
      </header>

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full flex-col gap-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search works</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Find a work by title"
              className="w-full rounded-xl border border-transparent bg-zinc-950/80 pl-11 pr-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </label>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/60 p-1">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusChange(value)}
                className={`flex-1 rounded-lg px-4 py-2 text-xs font-semibold transition-colors duration-200 ${
                  statusFilter === value
                    ? "bg-blue-500 text-white shadow-[0_12px_30px_-15px_rgba(59,130,246,0.8)]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="border-zinc-700 bg-transparent text-zinc-100 hover:bg-zinc-800 gap-2"
          >
            <RotateCcw
              className={`h-4 w-4 transition-transform ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkFilters;
