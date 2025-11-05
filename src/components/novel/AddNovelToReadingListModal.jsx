import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { useGetMyReadingLists } from "../../hooks/reading-list/useGetMyReadingLists";
import { useAddNovelToReadingList } from "../../hooks/reading-list/useAddNovelToReadingList";
import CreateReadingListModal from "../profile/CreateReadingListModal";
import { toast } from "sonner";

const AddNovelToReadingListModal = ({ isOpen, onClose, novelId, novelTitle }) => {
  const [selectedListId, setSelectedListId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const pageSize = 6;

  // Fetch user's reading lists
  const { data: listsData, isLoading } = useGetMyReadingLists(currentPage, pageSize, { enabled: isOpen });
  const addNovelMutation = useAddNovelToReadingList();

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedListId(null);
      setCurrentPage(1);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddToList = () => {
    if (!selectedListId) {
      toast.error("الرجاء اختيار قائمة");
      return;
    }

    addNovelMutation.mutate(
      { readingListId: selectedListId, novelId },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const lists = listsData?.items || [];
  const totalPages = listsData?.totalPages || 1;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#3C3C3C] rounded-2xl w-full max-w-3xl p-6 relative max-h-[85vh] overflow-y-auto shadow-[0px_4px_4px_rgba(0,0,0,0.25)]">
        {/* Header with buttons and title */}
        <div className="flex items-center justify-between mb-6">
          {/* Close button on left */}
          <button
            onClick={onClose}
            className="text-white hover:text-[#4A9EFF] transition-colors duration-300 flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Title - Centered */}
          <h2 className="text-2xl font-bold text-white text-center noto-sans-arabic-extrabold flex-1 px-4">
            إضافة الرواية لقائمة قراءة
          </h2>

          {/* Add new list button on right */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="text-white hover:text-[#4A9EFF] transition-colors duration-300 flex-shrink-0"
            title="إنشاء قائمة قراءة جديدة"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 47 47"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
            >
              <path
                d="M23.5 0C10.5199 0 0 10.5199 0 23.5C0 36.4801 10.5199 47 23.5 47C36.4801 47 47 36.4801 47 23.5C47 10.5199 36.4801 0 23.5 0ZM37.2053 25.4553C37.2053 26.5385 36.3332 27.4105 35.25 27.4105H27.4197V35.25C27.4197 36.3332 26.5477 37.2053 25.4645 37.2053H21.5447C20.4615 37.2053 19.5895 36.324 19.5895 35.25V27.4197H11.75C10.6668 27.4197 9.79473 26.5385 9.79473 25.4645V21.5447C9.79473 20.4615 10.6668 19.5895 11.75 19.5895H19.5803V11.75C19.5803 10.6668 20.4523 9.79473 21.5355 9.79473H25.4553C26.5385 9.79473 27.4105 10.676 27.4105 11.75V19.5803H35.25C36.3332 19.5803 37.2053 20.4615 37.2053 21.5355V25.4553Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#4A9EFF]" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && lists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-[#686868] noto-sans-arabic-bold text-xl mb-2">
              ليس لديك قوائم قراءة بعد
            </p>
            <p className="text-[#808080] noto-sans-arabic-regular text-sm">
              قم بإنشاء قائمة قراءة جديدة من صفحة ملفك الشخصي
            </p>
          </div>
        )}

        {/* Reading Lists */}
        {!isLoading && lists.length > 0 && (
          <>
            <div className="space-y-4 mb-6">
              {lists.map((list) => {
                const isSelected = selectedListId === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={`w-full p-4 rounded-lg transition-all duration-200 relative ${
                      isSelected
                        ? "bg-[#0077FF] shadow-lg"
                        : "bg-[#666666] hover:bg-[#777777]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Cover Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={list.coverImageUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=200&h=300&fit=crop"}
                          alt={list.name}
                          className="w-24 h-32 object-cover rounded shadow-sm"
                        />
                      </div>

                      {/* List Info */}
                      <div className="flex-1 text-right space-y-2">
                        {/* List Name */}
                        <h3 className="text-white noto-sans-arabic-bold text-lg">
                          {list.name}
                        </h3>

                        {/* Privacy Status */}
                        <p className={`noto-sans-arabic-medium text-sm ${
                          isSelected ? "text-white/90" : "text-[#B0B0B0]"
                        }`}>
                          {list.isPublic ? "عامة" : "خاصة"}
                        </p>

                        {/* Stats */}
                        <div className={`flex items-center gap-3 noto-sans-arabic-medium text-sm ${
                          isSelected ? "text-white/80" : "text-[#B0B0B0]"
                        }`}>
                          <span>{list.novelsCount} {list.novelsCount === 1 ? "رواية" : "روايات"}</span>
                          <span>•</span>
                          <span>{list.followersCount || 0} متابع</span>
                        </div>
                      </div>
                    </div>

                    {/* Selection Checkmark */}
                    {isSelected && (
                      <div className="absolute top-4 left-4">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToList}
              disabled={!selectedListId || addNovelMutation.isPending}
              className="w-full py-3 bg-[#0077FF] text-white rounded-lg noto-sans-arabic-bold text-lg hover:bg-[#0066DD] transition-colors disabled:bg-[#5A5A5A] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {addNovelMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <span>إضافة للقائمة</span>
              )}
            </button>

            {/* Helper Text */}
            {!selectedListId && (
              <p className="text-[#686868] noto-sans-arabic-medium text-sm text-center mt-3">
                الرجاء اختيار قائمة قراءة لإضافة الرواية لها
              </p>
            )}
          </>
        )}
      </div>

      {/* Create Reading List Modal */}
      <CreateReadingListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default AddNovelToReadingListModal;
