import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquareText, Share2, MoreHorizontal, LibraryBig, Star } from "lucide-react";
import PostCommentPanel from "./PostCommentPanel";
import { useLikePost, useUnlikePost } from "../../hooks/post/useLikePost";
import { usePostComments } from "../../hooks/comment/usePostComments";
import AddNovelToReadingListModal from "../novel/AddNovelToReadingListModal";

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
  const [showComments, setShowComments] = useState(false);
  const [isAddToListModalOpen, setIsAddToListModalOpen] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  
  // Fetch real-time comment count
  const { data: commentsData } = usePostComments(postId, "recent", { enabled: true });
  const actualCommentsCount = commentsData?.pages[0]?.totalItemsCount ?? initialCommentsCount;

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

  const formatTime = (dateString) => {
    // This should be replaced with proper date formatting
    return "منذ 5 ساعات";
  };

  return (
    <div className="bg-[#3C3C3C] rounded-lg shadow-sm mb-6 overflow-hidden" dir="rtl">
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
                  {formatTime(createdAt)}
                </p>
              </div>
              <button className="text-[#B0B0B0] hover:text-white transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-lg leading-relaxed text-white noto-sans-arabic-medium">
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
          <div className="border-t border-[#4A4A4A] pt-4">
            <h4 className="text-sm font-bold text-[#B0B0B0] noto-sans-arabic-extrabold mb-3">
              رواية مرفقة
            </h4>
            <Link
              to={`/novel/${attachedNovel.slug}`}
              className="flex items-center gap-4 bg-[#2C2C2C] p-4 rounded-lg hover:bg-[#333333] transition-colors"
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
      <div className="border-t border-[#4A4A4A] px-6 py-3">
        <div className="flex justify-around items-center text-[#B0B0B0]">
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

          <div className="h-6 w-px bg-[#4A4A4A]"></div>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:text-white transition-colors duration-200 noto-sans-arabic-extrabold"
          >
            <MessageSquareText className="w-5 h-5" />
            <span className="font-medium">تعليق</span>
            {actualCommentsCount > 0 && (
              <span className="text-sm">{actualCommentsCount.toLocaleString("ar-SA")}</span>
            )}
          </button>

          <div className="h-6 w-px bg-[#4A4A4A]"></div>

          <button className="flex items-center gap-2 hover:text-white transition-colors duration-200 noto-sans-arabic-extrabold">
            <Share2 className="w-5 h-5" />
            <span className="font-medium">مشاركة</span>
          </button>
        </div>
      </div>

      {/* Comment Panel - Inline */}
      <PostCommentPanel isOpen={showComments} postId={postId} />

      {/* Add to Reading List Modal */}
      {attachedNovel && (
        <AddNovelToReadingListModal
          isOpen={isAddToListModalOpen}
          onClose={() => setIsAddToListModalOpen(false)}
          novelId={attachedNovel.id}
          novelTitle={attachedNovel.title}
        />
      )}
    </div>
  );
};

export default AboutMePost;
