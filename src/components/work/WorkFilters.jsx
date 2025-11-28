import Button from "../ui/button";
import { RotateCcw, Search } from "lucide-react";

const statusOptions = [
  { value: "all", label: "الكل" },
  { value: "ongoing", label: "جارية" },
  { value: "completed", label: "مكتملة" },
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
    <section className="rounded-2xl border border-[#5A5A5A] bg-[#3C3C3C] px-4 md:px-6 py-4 md:py-5">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs noto-sans-arabic-medium text-[#797979]">
            التصفية
          </p>
          <h3 className="text-base md:text-lg noto-sans-arabic-extrabold text-white">
            صفّ أعمالك
          </h3>
        </div>
        <button
          type="button"
          onClick={onClearFilters}
          className="text-xs noto-sans-arabic-medium text-[#0077FF] hover:text-[#0066DD] cursor-pointer"
        >
          إعادة تعيين الفلاتر
        </button>
      </header>

      <div className="mt-4 md:mt-6 flex flex-col gap-3 md:gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full flex-col gap-3 md:gap-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">البحث في الأعمال</span>
            <Search className="pointer-events-none absolute right-3 md:right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#797979]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="ابحث عن عمل بالعنوان"
              className="w-full rounded-xl border border-transparent bg-[#5A5A5A] pr-10 md:pr-11 pl-3 md:pl-4 py-2.5 md:py-3 text-sm text-white placeholder:text-[#797979] focus:border-[#0077FF] focus:outline-none focus:ring-2 focus:ring-[#0077FF]/30 noto-sans-arabic-medium"
              dir="rtl"
            />
          </label>

          <div className="flex items-center gap-1 md:gap-2 rounded-xl border border-[#5A5A5A] bg-[#2C2C2C] p-1">
            {statusOptions.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onStatusChange(value)}
                className={`flex-1 rounded-lg px-3 md:px-4 py-2 text-xs noto-sans-arabic-bold transition-colors duration-200 cursor-pointer ${
                  statusFilter === value
                    ? "bg-[#0077FF] text-white"
                    : "text-[#B8B8B8] hover:text-white"
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
            className="border-[#5A5A5A] bg-transparent text-white hover:bg-[#5A5A5A] gap-2 noto-sans-arabic-medium w-full sm:w-auto justify-center"
          >
            <RotateCcw
              className={`h-4 w-4 transition-transform ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span>تحديث</span>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkFilters;
