import { useState, useCallback, useRef, useEffect } from "react";
import { ThumbsUp, MessageCircle, Flag, Trash2, Loader2, X } from "lucide-react";
import { useCommentReplies } from "../../hooks/comment/useCommentReplies";
import { getTimeAgo } from "../../utils/date";
import ConfirmModal from "../common/ConfirmModal";

const CommentReplies = ({
  parentCommentId,
  onClose,
  onLike,
  onDelete,
  currentUserId,
  likeCommentMutation,
  unlikeCommentMutation,
  deleteCommentMutation,
}) => {
  const [sorting, setSorting] = useState("oldest");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [replyToDelete, setReplyToDelete] = useState(null);
  const [likingReplyId, setLikingReplyId] = useState(null);

  const {
    data: repliesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useCommentReplies(parentCommentId, sorting);

  const replies = repliesData?.pages.flatMap((page) => page.items) || [];
  const repliesEndRef = useRef(null);

  // Scroll to load more
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    repliesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Handle delete with modal
  const handleDelete = (replyId) => {
    setReplyToDelete(replyId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!replyToDelete) return;

    await onDelete(replyToDelete);
    setDeleteModalOpen(false);
    setReplyToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setReplyToDelete(null);
  };

  // Handle like with loading state
  const handleLike = async (replyId, isLiked) => {
    setLikingReplyId(replyId);
    try {
      await onLike(replyId, isLiked);
    } finally {
      setLikingReplyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-[#0077FF]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Close/Hide Replies Button */}
      <button
        onClick={onClose}
        className="text-[#0077FF] hover:text-[#0066DD] noto-sans-arabic-medium text-sm py-2 transition-colors flex items-center gap-1"
      >
        <X size={16} />
        إخفاء الردود
      </button>

      {/* Replies List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar" onScroll={handleScroll}>
        {replies.map((reply) => (
          <div key={reply.id} className="hover:bg-[#2C2C2C] rounded-lg p-3 transition-colors">
            {/* Reply User Info */}
            <div className="flex items-start gap-3 mb-2">
              <img
                src={reply.user.profilePhoto || "/profilePicture.jpg"}
                alt={reply.user.displayName}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white noto-sans-arabic-medium text-sm">
                    {reply.user.displayName}
                  </span>
                  <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                    @{reply.user.userName}
                  </span>
                </div>
                <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                  {getTimeAgo(reply.createdAt)}
                </span>
              </div>
            </div>

            {/* Reply Content */}
            <p className="text-white noto-sans-arabic-medium text-sm leading-relaxed mb-3 pr-11">
              {reply.content}
            </p>

            {/* Reply Image */}
            {reply.attachedImageUrl && (
              <div className="pr-11 mb-3">
                <img
                  src={reply.attachedImageUrl}
                  alt="Reply attachment"
                  className="max-w-full h-auto rounded-lg max-h-60 object-cover"
                />
              </div>
            )}

            {/* Reply Actions */}
            <div className="flex items-center gap-4 pr-11">
              {/* Only show like button if not own reply */}
              {reply.user.id !== currentUserId && (
                <button
                  onClick={() => handleLike(reply.id, reply.isLikedByCurrentUser)}
                  disabled={likingReplyId === reply.id}
                  className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                    reply.isLikedByCurrentUser ? "text-[#FF4444]" : "text-[#686868] hover:text-[#FF4444]"
                  }`}
                >
                  <ThumbsUp size={14} fill={reply.isLikedByCurrentUser ? "#FF4444" : "none"} />
                  <span className="noto-sans-arabic-medium text-xs">{reply.likesCount}</span>
                </button>
              )}

              {reply.user.id === currentUserId && (
                <button
                  onClick={() => handleDelete(reply.id)}
                  disabled={deleteCommentMutation.isPending}
                  className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={14} />
                  <span className="noto-sans-arabic-medium text-xs">حذف</span>
                </button>
              )}

              <button className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors">
                <Flag size={14} />
                <span className="noto-sans-arabic-medium text-xs">إبلاغ</span>
              </button>
            </div>
          </div>
        ))}

        {/* Loading More */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#0077FF]" />
          </div>
        )}

        <div ref={repliesEndRef} />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="حذف الرد"
        message="هل أنت متأكد من حذف هذا الرد؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
};

export default CommentReplies;
