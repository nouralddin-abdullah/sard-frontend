import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";
import Header from "../../components/common/Header";
import StarRating from "../../components/common/StarRating";
import GenreBadge from "../../components/common/GenreBadge";
import UpdateReadingListModal from "../../components/profile/UpdateReadingListModal";
import ConfirmModal from "../../components/common/ConfirmModal";
import { useGetReadingListById } from "../../hooks/reading-list/useGetReadingListById";
import { useFollowReadingList } from "../../hooks/reading-list/useFollowReadingList";
import { useUnfollowReadingList } from "../../hooks/reading-list/useUnfollowReadingList";
import { useRemoveNovelFromReadingList } from "../../hooks/reading-list/useRemoveNovelFromReadingList";
import { useDeleteReadingList } from "../../hooks/reading-list/useDeleteReadingList";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import AuthRequiredModal from "../../components/common/AuthRequiredModal";

const ReadingListPage = () => {
  const { username, listId } = useParams();
  const navigate = useNavigate();
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [openMenuNovelId, setOpenMenuNovelId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [novelToDelete, setNovelToDelete] = useState(null);
  const [deleteListModalOpen, setDeleteListModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch reading list data
  const { data: listData, isLoading, error, dataUpdatedAt } = useGetReadingListById(listId);
  const { data: loggedInUser } = useGetLoggedInUser();
  
  // Cache-busting for cover image (in case backend replaces with same filename)
  const getCoverImageUrl = (url) => {
    if (!url) return "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop";
    // Add timestamp to bust cache after refetch
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${dataUpdatedAt}`;
  };
  
  // Follow/Unfollow mutations
  const followMutation = useFollowReadingList();
  const unfollowMutation = useUnfollowReadingList();
  const removeNovelMutation = useRemoveNovelFromReadingList();
  const deleteListMutation = useDeleteReadingList();

  // API returns isOwner boolean directly in the response
  const isOwner = listData?.isOwner;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside any menu by looking for data attribute
      const clickedMenu = event.target.closest('[data-novel-menu]');
      if (!clickedMenu) {
        setOpenMenuNovelId(null);
      }
    };

    if (openMenuNovelId) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuNovelId]);

  const handleFollowToggle = () => {
    if (!listData) return;
    
    if (!loggedInUser) {
      setIsAuthModalOpen(true);
      return;
    }
    
    if (listData.isFollowing) {
      unfollowMutation.mutate(listId);
    } else {
      followMutation.mutate(listId);
    }
  };

  // Open delete confirmation modal
  const handleRemoveNovel = (novelId) => {
    setNovelToDelete(novelId);
    setDeleteModalOpen(true);
    setOpenMenuNovelId(null); // Close dropdown menu
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setNovelToDelete(null);
  };

  // Confirm delete novel from list
  const confirmDelete = () => {
    if (!listData || !novelToDelete) return;
    
    removeNovelMutation.mutate(
      { readingListId: listData.id, novelId: novelToDelete },
      {
        onSuccess: () => {
          setDeleteModalOpen(false);
          setNovelToDelete(null);
        },
      }
    );
  };

  // Delete reading list handlers
  const handleDeleteList = () => {
    setDeleteListModalOpen(true);
  };

  const cancelDeleteList = () => {
    setDeleteListModalOpen(false);
  };

  const confirmDeleteList = () => {
    if (!listData) return;
    
    deleteListMutation.mutate(listData.id, {
      onSuccess: () => {
        setDeleteListModalOpen(false);
        // Navigate to user's profile after successful deletion
        navigate(`/profile/${loggedInUser?.userName || username}`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#2C2C2C" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#2C2C2C" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white noto-sans-arabic-medium text-xl">
            حدث خطأ في تحميل القائمة
          </p>
        </div>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#2C2C2C" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white noto-sans-arabic-medium text-xl">
            القائمة غير موجودة
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#2C2C2C" }}>
      <Header />

      {/* Return to Profile Button - Only show if username is in URL */}
      {username && (
        <div className="flex justify-center py-6">
          <Link
            to={`/profile/${username}`}
            className="px-6 py-3 bg-[#0077FF] text-white rounded-lg noto-sans-arabic-medium hover:bg-[#0066DD] transition-colors"
          >
            العودة إلى الملف الشخصي
          </Link>
        </div>
      )}

      {/* Reading List Content */}
      <div className="w-[90%] mx-auto px-4 py-8">
        {/* List Header */}
        <div 
          className="flex flex-col md:flex-row gap-8 mb-12 p-8 rounded-lg"
          style={{ backgroundColor: "#3C3C3C", boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
        >
          {/* List Cover - Left Side */}
          <div className="flex-shrink-0">
            <img
              src={getCoverImageUrl(listData.coverImageUrl)}
              alt={listData.name}
              className="w-64 h-64 object-cover rounded-lg"
              style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            />
          </div>

          {/* List Info - Right Side */}
          <div className="flex-1 text-white flex flex-col">
            {/* Title */}
            <h1 className="text-4xl noto-sans-arabic-extrabold mb-4">
              {listData.name}
            </h1>

            {/* Privacy, Followers, Novel Count Row */}
            <div className="flex items-center gap-6 mb-6">
              <span className="text-[#686868] noto-sans-arabic-medium flex items-center gap-2">
                {!listData.isPublic ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                    </svg>
                    خاصة
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM2.04 4.326c.325 1.329 2.532 2.54 3.717 3.19.48.263.793.434.743.484-.08.08-.162.158-.242.234-.416.396-.787.749-.758 1.266.035.634.618.824 1.214 1.017.577.188 1.168.38 1.286.983.082.417-.075.988-.22 1.52-.215.782-.406 1.48.22 1.48 1.5-.5 3.798-3.186 4-5 .138-1.243-2-2-3.5-2.5-.478-.16-.755.081-.99.284-.172.15-.322.279-.51.216-.445-.148-2.5-2-1.5-2.5.78-.39.952-.171 1.227.182.078.099.163.208.273.318.609.304.662-.132.723-.633.039-.322.081-.671.277-.867.434-.434 1.265-.791 2.028-1.12.712-.306 1.365-.587 1.579-.88A7 7 0 1 0 2.04 4.327z"/>
                    </svg>
                    عامة
                  </>
                )}
              </span>
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.followersCount} متابع
              </span>
              <span className="text-[#686868] noto-sans-arabic-medium">
                {listData.novelsCount} رواية
              </span>
            </div>

            {/* Description */}
            {listData.description && (
              <p className="text-white noto-sans-arabic-medium leading-relaxed mb-6">
                {listData.description}
              </p>
            )}

            {/* Owner Info and Follow Button Row - Pushed to bottom */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-auto gap-4">
              {/* Owner Info - API returns flat fields: ownerUserName, ownerDisplayName, ownerProfilePhoto */}
              {listData.ownerUserName && (
                <Link
                  to={`/profile/${listData.ownerUserName}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={listData.ownerProfilePhoto || "/profilePicture.jpg"}
                    alt={listData.ownerDisplayName || listData.ownerUserName}
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
                  />
                  <div>
                    <p className="text-white noto-sans-arabic-medium">
                      {listData.ownerDisplayName || listData.ownerUserName}
                    </p>
                    <p className="text-[#686868] noto-sans-arabic-medium text-sm">
                      @{listData.ownerUserName}
                    </p>
                  </div>
                </Link>
              )}

              {/* Action Buttons - Edit & Delete if owner, Follow if not */}
              {isOwner ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    className="px-4 sm:px-8 py-2 sm:py-3 rounded-lg noto-sans-arabic-medium transition-colors bg-[#0077FF] text-white hover:bg-[#0066DD] flex items-center justify-center gap-2 text-sm sm:text-base"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span className="hidden xs:inline">تعديل القائمة</span>
                    <span className="xs:hidden">تعديل</span>
                  </button>
                  <button
                    className="px-4 sm:px-8 py-2 sm:py-3 rounded-lg noto-sans-arabic-medium transition-colors bg-[#DC2626] text-white hover:bg-[#B91C1C] flex items-center justify-center gap-2 text-sm sm:text-base"
                    onClick={handleDeleteList}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden xs:inline">حذف القائمة</span>
                    <span className="xs:hidden">حذف</span>
                  </button>
                </div>
              ) : (
                <button
                  className={`px-4 sm:px-8 py-2 sm:py-3 rounded-lg noto-sans-arabic-medium transition-colors w-full sm:w-auto text-sm sm:text-base ${
                    listData.isFollowing
                      ? "bg-[#5A5A5A] text-white hover:bg-[#6A6A6A]"
                      : "bg-[#0077FF] text-white hover:bg-[#0066DD]"
                  }`}
                  onClick={handleFollowToggle}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                >
                  {followMutation.isPending || unfollowMutation.isPending
                    ? "جاري التحميل..."
                    : listData.isFollowing
                    ? "إلغاء المتابعة"
                    : "متابعة القائمة"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Novels Grid */}
        <div>
          <h2 className="text-white text-2xl noto-sans-arabic-bold mb-6">
            الروايات في هذه القائمة
          </h2>
          
          {listData.novels && listData.novels.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {listData.novels.map((novel) => (
                <div
                  key={novel.novelId}
                  className="flex flex-col md:flex-row gap-6 p-6 rounded-lg hover:bg-[#3C3C3C] transition-colors relative"
                >
                  {/* Three-dot menu - Only show if owner */}
                  {isOwner && (
                    <div data-novel-menu={novel.novelId} className="absolute top-4 left-4 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuNovelId(openMenuNovelId === novel.novelId ? null : novel.novelId);
                        }}
                        className="text-white hover:text-[#4A9EFF] p-2 hover:bg-[#4A4A4A] rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openMenuNovelId === novel.novelId && (
                        <div className="absolute top-full left-0 mt-1 bg-[#3C3C3C] rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveNovel(novel.novelId);
                            }}
                            disabled={removeNovelMutation.isPending}
                            className="w-full px-4 py-3 text-right text-white hover:bg-[#4A4A4A] transition-colors noto-sans-arabic-medium flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            <span>حذف من القائمة</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/novel/${novel.slug}`}
                    className="flex flex-col md:flex-row gap-6 flex-1"
                  >
                    {/* Novel Cover */}
                    <div className="flex-shrink-0">
                      <img
                        src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                        alt={novel.title}
                        className="w-36 h-48 object-cover rounded"
                        style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
                      />
                    </div>

                    {/* Novel Details */}
                    <div className="flex-1 text-white">
                      <h3 className="text-2xl noto-sans-arabic-bold mb-4">
                        {novel.title}
                    </h3>

                      {/* Description/Summary */}
                      {novel.summary && (
                        <p className="text-white noto-sans-arabic-medium leading-relaxed mb-4 line-clamp-5 text-sm min-h-[5rem]">
                          {novel.summary}
                        </p>
                      )}

                      {/* Divider Line */}
                      <div className="w-full h-[1px] mb-4" style={{ backgroundColor: "#797979" }}></div>

                      {/* Tags and Rating Row */}
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Tags - genres is array of strings like ["Horror", "Fantasy"] */}
                        {novel.genres && novel.genres.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {novel.genres.map((genre, idx) => (
                              <GenreBadge 
                                key={idx} 
                                genre={{ id: idx, name: genre }} 
                                size="sm" 
                              />
                            ))}
                          </div>
                        )}

                        {/* Rating - using totalAverageScore and reviewCount from API */}
                        {novel.totalAverageScore > 0 && (
                          <div className="flex items-center gap-2">
                            <StarRating rating={novel.totalAverageScore} className="w-4 h-4" />
                            <span className="text-sm noto-sans-arabic-medium text-[#686868]">
                              {novel.totalAverageScore.toFixed(1)} ({novel.reviewCount} تقييم)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                لا توجد روايات في هذه القائمة بعد
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Reading List Modal */}
      <UpdateReadingListModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        readingList={listData}
      />

      {/* Delete Novel Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="حذف الرواية"
        message="هل أنت متأكد من حذف هذه الرواية من القائمة؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={removeNovelMutation.isPending}
      />

      {/* Delete Reading List Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteListModalOpen}
        onClose={cancelDeleteList}
        onConfirm={confirmDeleteList}
        title="حذف قائمة القراءة"
        message="هل أنت متأكد من حذف قائمة القراءة؟ سيتم حذف جميع الروايات والمتابعين بشكل نهائي. لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteListMutation.isPending}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action="لمتابعة قائمة القراءة"
      />
    </div>
  );
};

export default ReadingListPage;
