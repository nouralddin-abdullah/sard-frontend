import { useState, useRef, useEffect, useCallback } from "react";
import { X, ThumbsUp, MessageCircle, Flag, ChevronDown, Image as ImageIcon, Loader2, Trash2 } from "lucide-react";
import { usePostComments } from "../../hooks/comment/usePostComments";
import { useCreatePostComment } from "../../hooks/comment/useCreatePostComment";
import { useLikeComment } from "../../hooks/comment/useLikeComment";
import { useUnlikeComment } from "../../hooks/comment/useUnlikeComment";
import { useDeleteComment } from "../../hooks/comment/useDeleteComment";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { getTimeAgo } from "../../utils/date";
import { toast } from "sonner";
import CommentReplies from "../novel/CommentReplies";
import ConfirmModal from "./ConfirmModal";

const PostCommentPanel = ({ isOpen, postId }) => {
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

  const panelRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Get current logged-in user
  const { data: currentUser } = useGetLoggedInUser();
  const currentUserId = currentUser?.id;

  // API Hooks
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingComments,
    refetch: refetchComments,
  } = usePostComments(postId, sortBy, { enabled: isOpen });

  const createCommentMutation = useCreatePostComment();
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
      toast.error("يجب تسجيل الدخول للإعجاب بالتعليقات");
      return;
    }

    if (likingCommentId === commentId) return; // Prevent double-click

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
      toast.error(error.message || "فشل تحديث الإعجاب");
    } finally {
      setLikingCommentId(null);
    }
  };

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

  const handleSubmit = async () => {
    if (!newComment.trim() && !selectedImage) return;
    
    if (!currentUser) {
      toast.error("يجب تسجيل الدخول للتعليق");
      return;
    }

    if (newComment.length > 2000) {
      toast.error("التعليق يجب أن لا يتجاوز 2000 حرف");
      return;
    }

    const parentCommentIdToExpand = replyingTo;

    try {
      await createCommentMutation.mutateAsync({
        postId,
        content: newComment,
        attachedImage: selectedImage,
        parentCommentId: replyingTo,
        currentUser, // For optimistic update
      });

      toast.success(replyingTo ? "تمت إضافة الرد بنجاح" : "تم إضافة التعليق بنجاح");
      
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

  const handleDeleteComment = (commentId) => {
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

  if (!isOpen) return null;

  return (
    <div className="border-t border-neutral-600 bg-[#3C3C3C]">
      <div ref={panelRef} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5A5A5A]">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl noto-sans-arabic-bold">
              التعليقات ({commentsData?.pages[0]?.totalItemsCount || 0})
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
                  {sortBy === "recent" ? "الأحدث" : sortBy === "oldest" ? "الأقدم" : "الأكثر شعبية"}
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
                      setSortBy("popular");
                      setShowSortDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-right text-white noto-sans-arabic-medium text-sm hover:bg-[#3C3C3C] transition-colors"
                  >
                    الأكثر شعبية
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div 
          className="overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[600px]"
          onScroll={handleScroll}
        >
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-[#4A9EFF]" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-[#B0B0B0] noto-sans-arabic-medium">
              لا توجد تعليقات بعد. كن أول من يعلق!
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  {/* Main Comment */}
                  <div className="hover:bg-[#2C2C2C] rounded-lg p-3 transition-colors">
                    {/* User Info */}
                    <div className="flex items-start gap-3 mb-2">
                      <img
                        src={comment.user?.profilePhoto || "/default-avatar.png"}
                        alt={comment.user?.displayName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white noto-sans-arabic-medium text-sm">
                            {comment.user?.displayName || "مستخدم"}
                          </span>
                          <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                            @{comment.user?.userName || "user"}
                          </span>
                        </div>
                        <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                          {getTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <p className="text-white noto-sans-arabic-medium text-sm leading-relaxed mb-3 pr-13">
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
                      {/* Only show like button if not own comment */}
                      {comment.user?.id !== currentUserId && (
                        <button
                          onClick={() => handleLike(comment.id, comment.isLikedByCurrentUser)}
                          disabled={likingCommentId === comment.id}
                          className={`flex items-center gap-1 transition-colors disabled:opacity-50 ${
                            comment.isLikedByCurrentUser ? "text-[#FF4444]" : "text-[#686868] hover:text-[#FF4444]"
                          }`}
                        >
                          <ThumbsUp size={16} fill={comment.isLikedByCurrentUser ? "#FF4444" : "none"} />
                          <span className="noto-sans-arabic-medium text-xs">{comment.likesCount || 0}</span>
                        </button>
                      )}

                      <button
                        onClick={() => setReplyingTo(comment.id)}
                        className="flex items-center gap-1 text-[#686868] hover:text-[#0077FF] transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span className="noto-sans-arabic-medium text-xs">رد</span>
                      </button>

                      {comment.user?.id === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
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

                  {/* Replies */}
                  {comment.totalRepliesCount > 0 && (
                    <div className="pr-10">
                      {!expandedReplies[comment.id] ? (
                        <button
                          onClick={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: true }))}
                          className="text-[#4A9EFF] text-sm noto-sans-arabic-medium hover:underline"
                        >
                          عرض {comment.totalRepliesCount} {comment.totalRepliesCount === 1 ? "رد" : "ردود"}
                        </button>
                      ) : (
                        <>
                          <CommentReplies
                            parentCommentId={comment.id}
                            currentUserId={currentUserId}
                            onClose={() => setExpandedReplies(prev => ({ ...prev, [comment.id]: false }))}
                            onLike={handleLike}
                            onDelete={async (replyId) => {
                              try {
                                await deleteCommentMutation.mutateAsync(replyId);
                                toast.success("تم حذف الرد بنجاح");
                              } catch (error) {
                                toast.error("فشل حذف الرد");
                              }
                            }}
                            likeCommentMutation={likeCommentMutation}
                            unlikeCommentMutation={unlikeCommentMutation}
                            deleteCommentMutation={deleteCommentMutation}
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isFetchingNextPage && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-[#4A9EFF]" />
                </div>
              )}
            </>
          )}
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
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
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
                  disabled={!newComment.trim() && !selectedImage}
                  className={`px-6 py-2 rounded-lg noto-sans-arabic-medium text-sm transition-colors ${
                    newComment.trim() || selectedImage
                      ? "bg-[#0077FF] text-white hover:bg-[#0066DD]"
                      : "bg-[#5A5A5A] text-[#797979] cursor-not-allowed"
                  }`}
                >
                  نشر
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
};

export default PostCommentPanel;
