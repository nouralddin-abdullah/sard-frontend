import { useState, useRef, useEffect, useCallback } from "react";
import { X, ThumbsUp, MessageCircle, Flag, ChevronDown, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { useChapterComments } from "../../hooks/comment/useChapterComments";
import { useParagraphComments } from "../../hooks/comment/useParagraphComments";
import { useCreateComment } from "../../hooks/comment/useCreateComment";
import { useCreateParagraphComment } from "../../hooks/comment/useCreateParagraphComment";
import { useLikeComment } from "../../hooks/comment/useLikeComment";
import { useUnlikeComment } from "../../hooks/comment/useUnlikeComment";
import { useDeleteComment } from "../../hooks/comment/useDeleteComment";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { getTimeAgo } from "../../utils/date";
import { toast } from "sonner";
import CommentReplies from "./CommentReplies";
import ConfirmModal from "../common/ConfirmModal";
import AuthRequiredModal from "../common/AuthRequiredModal";

const CommentPanel = ({ 
  isOpen, 
  onClose, 
  chapterId, 
  novelSlug,
  commentType = "chapter", // "chapter" or "paragraph"
  targetId = null, // chapterId or paragraphId depending on commentType
  paragraphPreview = null // For paragraph comments, show preview text
}) => {
  const [expandedReplies, setExpandedReplies] = useState({});
  const [sortBy, setSortBy] = useState("recent");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [likingCommentId, setLikingCommentId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("لتنفيذ هذا الإجراء");

  const panelRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const commentsEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Get current logged-in user
  const { data: currentUser } = useGetLoggedInUser();
  const currentUserId = currentUser?.id;

  // Determine which hooks to use based on commentType
  const isChapterComment = commentType === "chapter";
  const effectiveTargetId = targetId || chapterId;

  // API Hooks - ALWAYS call both hooks (Rules of Hooks), but enable only the one we need
  const chapterCommentsQuery = useChapterComments(effectiveTargetId, sortBy, { enabled: isChapterComment && isOpen });
  const paragraphCommentsQuery = useParagraphComments(effectiveTargetId, sortBy, { enabled: !isChapterComment && isOpen });
  
  // ALWAYS call both mutation hooks
  const createChapterCommentMutation = useCreateComment();
  const createParagraphCommentMutation = useCreateParagraphComment();
  
  // Select which query/mutation to use based on type
  const commentsQuery = isChapterComment ? chapterCommentsQuery : paragraphCommentsQuery;
  const createCommentMutation = isChapterComment ? createChapterCommentMutation : createParagraphCommentMutation;
  
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = commentsQuery;

  const likeCommentMutation = useLikeComment();
  const unlikeCommentMutation = useUnlikeComment();
  const deleteCommentMutation = useDeleteComment();

  // Flatten comments from pages
  const comments = commentsData?.pages.flatMap((page) => page.items) || [];



  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle infinite scroll
  const handleScroll = useCallback((e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle like/unlike toggle
  const handleLike = async (commentId, isCurrentlyLiked) => {
    if (!currentUserId) {
      setAuthModalAction("للإعجاب بالتعليقات");
      setIsAuthModalOpen(true);
      return;
    }

    setLikingCommentId(commentId);
    try {
      if (isCurrentlyLiked) {
        await unlikeCommentMutation.mutateAsync(commentId);
        toast.success("تم إلغاء الإعجاب");
      } else {
        await likeCommentMutation.mutateAsync(commentId);
        toast.success("تم الإعجاب بالتعليق");
      }
    } catch (error) {
      toast.error(error.message || "حدث خطأ");
    } finally {
      setLikingCommentId(null);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image removal
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e) => {
    setNewComment(e.target.value);
    
    // Reset height to auto to get the correct scrollHeight
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set height based on scrollHeight, with max of 200px
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  };

  // Handle delete comment
  const handleDelete = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!commentToDelete) return;

    try {
      await deleteCommentMutation.mutateAsync(commentToDelete);
      toast.success("تم حذف التعليق بنجاح");
      setDeleteModalOpen(false);
      setCommentToDelete(null);
    } catch (error) {
      toast.error(error.message || "فشل حذف التعليق");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  // Handle comment submission
  const handleSubmit = async () => {
    if (!newComment.trim() && !selectedImage) return;

    if (!currentUserId) {
      setAuthModalAction("لإضافة تعليق");
      setIsAuthModalOpen(true);
      return;
    }

    if (newComment.length > 2000) {
      toast.error("التعليق يجب أن لا يتجاوز 2000 حرف");
      return;
    }

    const parentCommentIdToExpand = replyingTo;

    try {
      // Use different payload based on comment type
      if (isChapterComment) {
        await createCommentMutation.mutateAsync({
          chapterId: effectiveTargetId,
          content: newComment,
          attachedImage: selectedImage,
          parentCommentId: replyingTo,
          currentUser: currentUser,
        });
      } else {
        await createCommentMutation.mutateAsync({
          paragraphId: effectiveTargetId,
          content: newComment,
          attachedImage: selectedImage,
          parentCommentId: replyingTo,
          currentUser: currentUser,
        });
      }

      toast.success(replyingTo ? "تم إضافة الرد بنجاح" : "تم إضافة التعليق بنجاح");
      
      // Auto-expand replies if this was a reply
      if (parentCommentIdToExpand) {
        setExpandedReplies(prev => ({
          ...prev,
          [parentCommentIdToExpand]: true
        }));
      }

      setNewComment("");
      setReplyingTo(null);
      handleRemoveImage();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      toast.error(error.message || "فشل إضافة التعليق");
    }
  };

  // Toggle replies expansion
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#3C3C3C] z-50 shadow-2xl flex flex-col animate-slide-in"
        style={{
          animation: isOpen ? "slideIn 300ms ease-out" : "slideOut 300ms ease-in"
        }}
      >
        {/* Header */}
        <div className="border-b border-[#5A5A5A]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <h2 className="text-white text-xl noto-sans-arabic-bold">
                {commentType === "paragraph" ? "تعليقات الفقرة" : "التعليقات"} ({commentsData?.pages[0]?.totalItemsCount || 0})
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Sort Dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1 px-3 py-2 bg-[#5A5A5A] rounded-lg text-white noto-sans-arabic-medium text-sm hover:bg-[#6A6A6A] transition-colors"
                >
                  <span>
                    {sortBy === "recent" || sortBy === "newest" ? "الأحدث" : sortBy === "oldest" ? "الأقدم" : "الأكثر إعجاباً"}
                  </span>
                  <ChevronDown size={16} />
                </button>

                {showSortDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-40 bg-[#2C2C2C] rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setSortBy("recent");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-right text-white noto-sans-arabic-medium text-sm hover:bg-[#3C3C3C] transition-colors"
                    >
                      الأحدث
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-right text-white noto-sans-arabic-medium text-sm hover:bg-[#3C3C3C] transition-colors"
                    >
                      الأقدم
                    </button>
                    <button
                      onClick={() => {
                        setSortBy("mostliked");
                        setShowSortDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-right text-white noto-sans-arabic-medium text-sm hover:bg-[#3C3C3C] transition-colors"
                    >
                      الأكثر إعجاباً
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="text-white hover:text-[#0077FF] transition-colors"
                aria-label="إغلاق"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Paragraph Preview (only for paragraph comments) */}
          {commentType === "paragraph" && paragraphPreview && (
            <div className="px-4 pb-4">
              <div className="bg-[#2C2C2C] rounded-lg p-3 border-r-2 border-[#0077FF]">
                <p className="text-[#B8B8B8] text-sm noto-sans-arabic-medium line-clamp-2">
                  {paragraphPreview}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4" onScroll={handleScroll}>
          {/* Loading State */}
          {isLoadingComments && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#0077FF]" />
            </div>
          )}

          {/* Empty State */}
          {!isLoadingComments && comments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-[#797979]" />
              <p className="text-[#797979] noto-sans-arabic-medium">
                لا توجد تعليقات بعد. كن أول من يعلق!
              </p>
            </div>
          )}

          {/* Comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="hover:bg-[#2C2C2C] rounded-lg p-3 transition-colors">
                {/* User Info */}
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={comment.user.profilePhoto || "/profilePicture.jpg"}
                    alt={comment.user.displayName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white noto-sans-arabic-medium text-sm">
                        {comment.user.displayName}
                      </span>
                      <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                        @{comment.user.userName}
                      </span>
                    </div>
                    <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                      {getTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-white noto-sans-arabic-medium text-sm leading-relaxed mb-3 pr-13 whitespace-pre-wrap">
                  {comment.content}
                </p>

                {/* Comment Image */}
                {comment.attachedImageUrl && (
                  <div className="pr-13 mb-3">
                    <img 
                      src={comment.attachedImageUrl} 
                      alt="Comment attachment" 
                      className="max-w-full h-auto rounded-lg max-h-80 object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pr-13">
                  {/* Like button - show count for everyone, but only allow click if not own comment */}
                  {comment.user.id !== currentUserId ? (
                    <button
                      onClick={() => handleLike(comment.id, comment.isLikedByCurrentUser)}
                      disabled={likingCommentId === comment.id}
                      className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                        comment.isLikedByCurrentUser ? "text-[#FF4444]" : "text-[#686868] hover:text-[#FF4444]"
                      }`}
                    >
                      <ThumbsUp size={16} fill={comment.isLikedByCurrentUser ? "#FF4444" : "none"} />
                      <span className="noto-sans-arabic-medium text-xs">{comment.likesCount}</span>
                    </button>
                  ) : (
                    /* Show likes count for comment owner (non-clickable) */
                    <div className="flex items-center gap-1 text-[#686868]">
                      <ThumbsUp size={16} fill="none" />
                      <span className="noto-sans-arabic-medium text-xs">{comment.likesCount}</span>
                    </div>
                  )}

                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 text-[#686868] hover:text-[#0077FF] transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="noto-sans-arabic-medium text-xs">رد</span>
                  </button>

                  {comment.user.id === currentUserId && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={deleteCommentMutation.isPending}
                      className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      <span className="noto-sans-arabic-medium text-xs">حذف</span>
                    </button>
                  )}

                  <button className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors">
                    <Flag size={16} />
                    <span className="noto-sans-arabic-medium text-xs">إبلاغ</span>
                  </button>
                </div>
              </div>

              {/* Replies Section */}
              {comment.totalRepliesCount > 0 && (
                <div className="pr-10">
                  {!expandedReplies[comment.id] ? (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-[#0077FF] hover:text-[#0066DD] noto-sans-arabic-medium text-sm py-2 transition-colors"
                    >
                      عرض {comment.totalRepliesCount} {comment.totalRepliesCount === 1 ? 'رد' : 'ردود'}
                    </button>
                  ) : (
                    <CommentReplies
                      parentCommentId={comment.id}
                      onClose={() => toggleReplies(comment.id)}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      currentUserId={currentUserId}
                      likeCommentMutation={likeCommentMutation}
                      unlikeCommentMutation={unlikeCommentMutation}
                      deleteCommentMutation={deleteCommentMutation}
                    />
                  )}
                </div>
              )}

              {/* Old nested replies code - REMOVED */}
              {false && comment.replies && comment.replies.length > 0 && (
                <div className="pr-10 space-y-3">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="hover:bg-[#2C2C2C] rounded-lg p-3 transition-colors">
                      {/* Reply User Info */}
                      <div className="flex items-start gap-3 mb-2">
                        <img
                          src={reply.avatar}
                          alt={reply.displayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white noto-sans-arabic-medium text-sm">
                              {reply.displayName}
                            </span>
                            <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                              @{reply.username}
                            </span>
                          </div>
                          <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                            {reply.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Reply Content */}
                      <p className="text-white noto-sans-arabic-medium text-sm leading-relaxed mb-3 pr-11">
                        {reply.content}
                      </p>

                      {/* Reply Image */}
                      {reply.image && (
                        <div className="pr-11 mb-3">
                          <img 
                            src={reply.image} 
                            alt="Reply attachment" 
                            className="max-w-full h-auto rounded-lg max-h-80 object-cover"
                          />
                        </div>
                      )}

                      {/* Reply Actions */}
                      <div className="flex items-center gap-4 pr-11">
                        <button
                          onClick={() => handleLike(reply.id, true, comment.id)}
                          className={`flex items-center gap-1 transition-colors ${
                            reply.isLiked ? "text-[#FF4444]" : "text-[#686868] hover:text-[#FF4444]"
                          }`}
                        >
                          <ThumbsUp size={14} fill={reply.isLiked ? "#FF4444" : "none"} />
                          <span className="noto-sans-arabic-medium text-xs">{reply.likes}</span>
                        </button>

                        <button className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors">
                          <Flag size={14} />
                          <span className="noto-sans-arabic-medium text-xs">إبلاغ</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading More Indicator */}
          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#0077FF]" />
            </div>
          )}

          <div ref={commentsEndRef} />
        </div>

        {/* Comment Input - Sticky at Bottom */}
        <div className="border-t border-[#5A5A5A] p-4 bg-[#3C3C3C]">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-[#2C2C2C] rounded-lg">
              <span className="text-[#686868] noto-sans-arabic-medium text-sm">
                الرد على {comments.find(c => c.id === replyingTo)?.user?.displayName || "..."}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-[#686868] hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-end gap-2">
            <img
              src={currentUser?.profilePhoto || "/profilePicture.jpg"}
              alt="أنت"
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex flex-col gap-2">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-w-full h-auto rounded-lg max-h-40 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 left-2 bg-black bg-opacity-60 text-white rounded-full p-1 hover:bg-opacity-80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={handleTextareaChange}
                placeholder="اكتب تعليقاً..."
                className="w-full bg-[#5A5A5A] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0077FF] placeholder-[#797979] overflow-hidden"
                rows="2"
                style={{ minHeight: "60px", maxHeight: "200px" }}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[#686868] hover:text-white transition-colors"
                    aria-label="إضافة صورة"
                  >
                    <ImageIcon size={20} />
                  </button>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={(!newComment.trim() && !selectedImage) || createCommentMutation.isPending}
                  className={`px-6 py-2 rounded-lg noto-sans-arabic-medium text-sm transition-colors flex items-center gap-2 ${
                    (newComment.trim() || selectedImage) && !createCommentMutation.isPending
                      ? "bg-[#0077FF] text-white hover:bg-[#0066DD]"
                      : "bg-[#5A5A5A] text-[#797979] cursor-not-allowed"
                  }`}
                >
                  {createCommentMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  نشر
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        @keyframes slideOut {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(100%);
          }
        }

        .animate-slide-in {
          animation: slideIn 300ms ease-out;
        }
      `}</style>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="حذف التعليق"
        message="هل أنت متأكد من حذف هذا التعليق؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteCommentMutation.isPending}
      />

      {/* Auth Required Modal */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        action={authModalAction}
      />
    </>
  );
};

export default CommentPanel;
