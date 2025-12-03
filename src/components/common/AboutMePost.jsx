import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquareText, Share2, MoreHorizontal, LibraryBig, Star, Trash2 } from "lucide-react";
import PostCommentPanel from "./PostCommentPanel";
import ConfirmModal from "./ConfirmModal";
import ShareModal from "./ShareModal";
import { useLikePost, useUnlikePost } from "../../hooks/post/useLikePost";
import { useDeletePost } from "../../hooks/post/useDeletePost";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import AddNovelToReadingListModal from "../novel/AddNovelToReadingListModal";
import { toast } from "sonner";
import { getTimeAgo } from "../../utils/date";

const AboutMePost = ({ 
  content, 
  postId, 
  author, 
  createdAt, 
  attachedImage, 
  attachedNovel,
  likesCount: initialLikesCount = 0,
  commentsCount: initialCommentsCount = 0,
  isLiked: initialIsLiked = false,
}) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [commentsCount, setCommentsCount] = useState(initialCommentsCount);
  const [showComments, setShowComments] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const menuRef = useRef(null);

  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { data: loggedInUser } = useGetLoggedInUser();

  // Check if current user is the post author
  const isOwnPost = loggedInUser?.id === author?.userId || loggedInUser?.id === author?.id;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleDeleteClick = () => {
    setShowMenu(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    deletePost(postId, {
      onSuccess: () => {
        setShowDeleteModal(false);
        toast.success("تم حذف المنشور بنجاح");
      },
      onError: () => {
        toast.error("فشل حذف المنشور. حاول مرة أخرى.");
      }
    });
  };

  const handleLike = () => {
    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikesCount = newIsLiked ? likesCount + 1 : likesCount - 1;
    
    setIsLiked(newIsLiked);
    setLikesCount(newLikesCount);

    // Call API
    if (newIsLiked) {
      likePost(postId, {
        onError: () => {
          // Revert on error
          setIsLiked(false);
          setLikesCount(likesCount);
        },
      });
    } else {
      unlikePost(postId, {
        onError: () => {
          // Revert on error
          setIsLiked(true);
          setLikesCount(likesCount);
        },
      });
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg mb-6 overflow-hidden" dir="rtl">
      {/* Post Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${author?.userName || ""}`}>
            <img
              src={author?.profilePhoto || "/default-avatar.png"}
              alt={author?.displayName}
              className="h-12 w-12 rounded-full object-cover flex-shrink-0"
            />
          </Link>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  to={`/profile/${author?.userName || ""}`}
                  className="text-base font-bold text-white noto-sans-arabic-extrabold hover:text-[#4A9EFF] transition-colors"
                >
                  {author?.displayName || "مستخدم"}
                </Link>
                <p className="text-sm text-[#B0B0B0] noto-sans-arabic-medium">
                  {getTimeAgo(createdAt)}
                </p>
              </div>
              {isOwnPost && (
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-[#B0B0B0] hover:text-white transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                  {showMenu && (
                    <div className="absolute left-0 mt-2 w-48 bg-[#3C3C3C] rounded-lg shadow-lg border border-white/10 z-10">
                      <button
                        onClick={handleDeleteClick}
                        className="w-full px-4 py-3 text-right text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2 rounded-lg noto-sans-arabic-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>حذف المنشور</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-lg leading-relaxed text-white noto-sans-arabic-medium whitespace-pre-wrap">
          {content}
        </p>
      </div>

      {/* Attached Image */}
      {attachedImage && (
        <div className="px-2 sm:px-4 pb-4">
          <img
            src={attachedImage}
            alt="Post attachment"
            className="w-full h-auto max-h-[500px] object-cover rounded-lg"
          />
        </div>
      )}

      {/* Attached Novel */}
      {attachedNovel && (
        <div className="px-6 pb-2">
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-bold text-white/70 noto-sans-arabic-extrabold mb-3">
              رواية مرفقة
            </h4>
            <Link
              to={`/novel/${attachedNovel.slug}`}
              className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              <img
                src={attachedNovel.coverImageUrl || "/default-cover.png"}
                alt={attachedNovel.title}
                className="w-16 h-24 object-cover rounded-md shadow-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-base font-bold truncate text-white noto-sans-arabic-extrabold">
                  {attachedNovel.title}
                </h5>
                <div className="flex items-center mt-2 gap-2 text-sm text-[#B0B0B0]">
                  <Star className="w-4 h-4 text-[#FFD700] fill-[#FFD700]" />
                  <span className="noto-sans-arabic-medium">
                    {attachedNovel.totalAverageScore?.toFixed(1) || "0.0"} (
                    {attachedNovel.reviewCount?.toLocaleString("ar-SA") || "0"} تقييمًا)
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsAddToListModalOpen(true);
                }}
                className="self-start text-[#B0B0B0] hover:text-[#0077FF] transition-colors"
                aria-label="إضافة إلى قائمة القراءة"
              >
                <LibraryBig className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-white/10 px-6 py-3">
        <div className="flex justify-around items-center text-white/60">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 transition-colors duration-200 noto-sans-arabic-extrabold ${
              isLiked
                ? "text-red-400"
                : "hover:text-white"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-400" : ""}`} />
            <span className="font-medium">إعجاب</span>
            {likesCount > 0 && (
              <span className="text-sm">{likesCount.toLocaleString("ar-SA")}</span>
            )}
          </button>

          <div className="h-6 w-px bg-white/10"></div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:text-white transition-colors duration-200 noto-sans-arabic-extrabold"
          >
            <MessageSquareText className="w-5 h-5" />
            <span className="font-medium">تعليق</span>
            {commentsCount > 0 && (
              <span className="text-sm">{commentsCount.toLocaleString("ar-SA")}</span>
            )}
          </button>

          <div className="h-6 w-px bg-white/10"></div>

          <button 
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-2 hover:text-white transition-colors duration-200 noto-sans-arabic-extrabold"
          >
            <Share2 className="w-5 h-5" />
            <span className="font-medium">مشاركة</span>
          </button>
        </div>
      </div>

      {/* Comment Panel - Inline */}
      <PostCommentPanel 
        isOpen={showComments} 
        postId={postId} 
        onCommentCountChange={setCommentsCount}
      />

      {/* Add to Reading List Modal */}
      {attachedNovel && (
        <AddNovelToReadingListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          novelId={attachedNovel.id}
          novelTitle={attachedNovel.title}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="حذف المنشور"
          message="هل أنت متأكد من حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء."
          confirmText="حذف"
          cancelText="إلغاء"
          isLoading={isDeleting}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={author?.displayName ? `منشور ${author.displayName}` : "منشور"}
        description={content?.length > 150 ? content.substring(0, 150) + "..." : content}
        imageUrl={attachedImage || attachedNovel?.coverImageUrl}
        shareUrl={`${window.location.origin}/profile/${author?.userName}?post=${postId}`}
        itemType="post"
      />
    </div>
  );
};

export default AboutMePost;
