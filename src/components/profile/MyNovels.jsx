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
      <section style={{ backgroundColor: '#2C2C2C' }} className="p-6">
        <div className="text-center py-12">
          <div className="border rounded-2xl p-8 max-w-md mx-auto" style={{ backgroundColor: '#3C3C3C', borderColor: '#5A5A5A' }}>
            <h3 className="text-red-400 text-xl noto-sans-arabic-extrabold mb-2">
              {t("profilePage.myNovels.novelsErrorTitle")}
            </h3>
            <p className="text-red-300 text-sm noto-sans-arabic-medium">
              {t("profilePage.myNovels.novelsErrorMessage")}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ backgroundColor: '#2C2C2C' }} className="min-h-screen">
      {/* Add Novel Section */}
      <div className="p-6 border-b" style={{ borderColor: '#5A5A5A' }}>
        <div className="rounded-2xl p-8 text-center border" style={{ backgroundColor: '#3C3C3C', borderColor: '#5A5A5A' }}>
          <h3 className="text-white text-xl noto-sans-arabic-extrabold mb-3">
            إدارة رواياتك
          </h3>
          <p className="text-sm mb-6 noto-sans-arabic-medium" style={{ color: '#B8B8B8' }}>
            للتحكم الكامل في رواياتك وتعديلها، استخدم أدوات المؤلف المخصصة
          </p>
          <Link
            to="/dashboard/works"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl noto-sans-arabic-bold text-white transition-colors duration-200"
            style={{ backgroundColor: '#0077FF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0066DD'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0077FF'}
          >
            <Book className="h-5 w-5" />
            انتقل إلى أدوات المؤلف
          </Link>
        </div>
      </div>

      {/* Loading state for initial load */}
      {isPending && (
        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <NovelCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty state - only show if not loading and no novels */}
      {!isPending && novelsList.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="rounded-2xl p-8 max-w-md mx-auto border" style={{ backgroundColor: '#3C3C3C', borderColor: '#5A5A5A' }}>
            <div className="mb-4" style={{ color: '#797979' }}>
              <Book className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-white text-xl noto-sans-arabic-extrabold mb-3">
              {t("profilePage.myNovels.noNovelsTitle")}
            </h3>
            <p className="text-sm noto-sans-arabic-medium" style={{ color: '#B8B8B8' }}>
              {t("profilePage.myNovels.noNovelsMessage")}
            </p>
          </div>
        </div>
      )}

      {/* Novels Grid */}
      {novelsList.length > 0 && (
        <>
          <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
            {novelsList.map((novel, index) => (
              <NovelCard key={`${novel.id || index}`} novel={novel} />
            ))}
          </div>

          {/* Loading more skeletons */}
          {isFetchingNextPage && (
            <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <NovelCardSkeleton key={`loading-${index}`} />
              ))}
            </div>
          )}

          {/* Load More Button - optional fallback */}
          {hasNextPage && !isFetchingNextPage && (
            <div className="p-6 text-center">
              <button
                onClick={() => fetchNextPage()}
                className="px-6 py-3 rounded-xl noto-sans-arabic-bold text-white transition-colors duration-200"
                style={{ backgroundColor: '#0077FF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0066DD'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0077FF'}
              >
                تحميل المزيد
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default MyNovels;
