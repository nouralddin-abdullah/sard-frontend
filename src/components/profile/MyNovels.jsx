import { useEffect, useCallback } from "react";
import NovelCard from "../novel/NovelCard";
import NovelCardSkeleton from "../novel/NovelCardSkeleton";
import { Book, Plus } from "lucide-react";
import Button from "../ui/button";
import { useGetMyWorks } from "../../hooks/work/useGetMyWorks";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const MyNovels = () => {
  const { t } = useTranslation();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    error,
  } = useGetMyWorks();

  const novelsList = data?.pages.flatMap((page) => page.items) || [];

  // Scroll pagination handler
  const handleScroll = useCallback(() => {
    // Check if we're near the bottom of the page
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // Trigger when user is within 100px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Add scroll event listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Show error state
  if (error) {
    return (
      <section className="bg-zinc-800 p-6">
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-8 max-w-md mx-auto">
            <h3 className="text-red-400 text-xl font-semibold mb-2">
              {t("profilePage.myNovels.novelsErrorTitle")}
            </h3>
            <p className="text-red-300 text-sm">
              {t("profilePage.myNovels.novelsErrorMessage")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-800 min-h-screen">
      {/* Add Novel Section */}
      <div className="p-3 border-b border-zinc-700">
        <div className="bg-zinc-700 rounded-lg p-4 text-center">
          <h3 className="text-white text-lg font-semibold mb-2">
            {t("profilePage.myNovels.createNovelTitle")}
          </h3>
          <p className="text-zinc-300 text-sm mb-4">
            {t("profilePage.myNovels.createNovelMessage")}
          </p>
          <Link
            to="/novel/create"
            className="max-w-56 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2 mx-auto"
          >
            <Plus />
            {t("profilePage.myNovels.addNovelButton")}
          </Link>
          <Link
            to="/dashboard/works"
            className="block mt-4 text-sm text-blue-200 hover:text-blue-100 transition-colors"
          >
            {t("profilePage.myNovels.manageWorksLink")}
          </Link>
        </div>
      </div>

      {/* Loading state for initial load */}
      {isPending && (
        <div className="p-3 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <NovelCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty state - only show if not loading and no novels */}
      {!isPending && novelsList.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-zinc-700 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-zinc-400 mb-4">
              <Book className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-white text-xl font-semibold mb-2">
              {t("profilePage.myNovels.noNovelsTitle")}
            </h3>
            <p className="text-zinc-300 text-sm mb-6">
              {t("profilePage.myNovels.noNovelsMessage")}
            </p>
          </div>
        </div>
      )}

      {/* Novels Grid */}
      {novelsList.length > 0 && (
        <>
          <div className="p-3 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {novelsList.map((novel, index) => (
              <NovelCard key={`${novel.id || index}`} novel={novel} />
            ))}
          </div>

          {/* Loading more skeletons */}
          {isFetchingNextPage && (
            <div className="p-3 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <NovelCardSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default MyNovels;
