import { useMemo, useState } from "react";
import Header from "../../components/common/Header";
import WorkDashboardHeader from "../../components/work/WorkDashboardHeader";
import WorkFilters from "../../components/work/WorkFilters";
import WorkSkeletonGrid from "../../components/work/WorkSkeletonGrid";
import WorkEmptyState from "../../components/work/WorkEmptyState";
import WorkGrid from "../../components/work/WorkGrid";
import { useGetMyWorks } from "../../hooks/work/useGetMyWorks";

const filterByStatus = (work, statusFilter) => {
  if (statusFilter === "all") return true;
  const status = work?.status?.toLowerCase?.();
  return status === statusFilter;
};

const computeLastUpdatedLabel = (works) => {
  const timestamps = works
    .map((work) => (work?.lastUpdatedAt ? new Date(work.lastUpdatedAt) : null))
    .filter((date) => date instanceof Date && !Number.isNaN(date?.getTime()));

  if (timestamps.length === 0) return "لا توجد تحديثات";

  const mostRecent = timestamps.sort((a, b) => b.getTime() - a.getTime())[0];
  const day = mostRecent.getDate();
  const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  const month = months[mostRecent.getMonth()];
  const year = mostRecent.getFullYear();
  
  return `${day} ${month} ${year}`;
};

const filterBySearch = (work, searchTerm) => {
  if (!searchTerm) return true;
  const normalized = searchTerm.trim().toLowerCase();
  return work?.title?.toLowerCase?.().includes(normalized);
};

const WorkDashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data,
    error,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetMyWorks({ pageSize: 12 });

  const works = useMemo(
    () => data?.pages?.flatMap((page) => page?.items ?? []) ?? [],
    [data]
  );

  const filteredWorks = useMemo(
    () =>
      works.filter(
        (work) => filterByStatus(work, statusFilter) && filterBySearch(work, searchTerm)
      ),
    [works, statusFilter, searchTerm]
  );

  const { ongoingCount, completedCount, hiatusCount } = useMemo(() => {
    return works.reduce(
      (acc, work) => {
        const status = work?.status?.toLowerCase?.();
        if (status === "ongoing") acc.ongoingCount += 1;
        if (status === "completed") acc.completedCount += 1;
        if (status === "hiatus") acc.hiatusCount += 1;
        return acc;
      },
      { ongoingCount: 0, completedCount: 0, hiatusCount: 0 }
    );
  }, [works]);

  const lastUpdatedLabel = useMemo(() => computeLastUpdatedLabel(works), [works]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#2C2C2C] py-12 px-4 md:px-8 lg:px-16 space-y-10 text-white" dir="rtl">
      <WorkDashboardHeader
        totalWorks={works.length}
        ongoingCount={ongoingCount}
        completedCount={completedCount}
        hiatusCount={hiatusCount}
        lastUpdatedLabel={lastUpdatedLabel}
      />

      <WorkFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClearFilters={() => {
          setSearchTerm("");
          setStatusFilter("all");
        }}
        onRefresh={async () => {
          setIsRefreshing(true);
          try {
            await refetch();
          } finally {
            setIsRefreshing(false);
          }
        }}
        isRefreshing={isRefreshing}
      />

      {error && (
        <div className="bg-red-900/30 border border-red-700/60 rounded-xl px-6 py-5 text-sm text-red-200 noto-sans-arabic-medium">
          فشل تحميل أعمالك. يرجى تحديث الصفحة.
        </div>
      )}

      {isPending ? (
        <WorkSkeletonGrid itemCount={6} />
      ) : filteredWorks.length === 0 ? (
        <WorkEmptyState />
      ) : (
        <WorkGrid
          works={filteredWorks}
          onLoadMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      )}
    </main>
    </>
  );
};

export default WorkDashboardPage;
