import React, { useState } from "react";
import mainPicture from "../../assets/mainPicture.jpg";
import { Heart, MessageSquareText } from "lucide-react";
import PostCommentPanel from "./PostCommentPanel";

const AboutMePost = ({ content, postId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(3);
  const [showComments, setShowComments] = useState(false);
  const commentsCount = 6; // This should come from API

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="bg-neutral-700 rounded-2xl mb-6 overflow-hidden noto-sans-arabic-medium">
      {/* Post Content */}
      <div className="p-6">
        <div className="flex gap-4 items-start">
          <img src={mainPicture} alt="Profile" className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1">
            <p className="text-white text-base md:text-lg leading-relaxed">{content}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center border-t border-neutral-600">
        <button
          onClick={handleLike}
          className={`flex-1 flex justify-center items-center gap-2 py-3.5 transition-colors hover:bg-neutral-600 ${
            isLiked ? "text-red-400" : "text-gray-300"
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? "fill-red-400" : ""}`} />
          <span className="text-sm md:text-base">إعجاب</span>
          {likesCount > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${isLiked ? "bg-red-400/20 text-red-400" : "bg-neutral-600 text-gray-400"}`}>
              {likesCount}
            </span>
          )}
        </button>

        <div className="w-px h-8 bg-neutral-600"></div>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex justify-center items-center gap-2 py-3.5 text-gray-300 transition-colors hover:bg-neutral-600"
        >
          <MessageSquareText className="w-5 h-5" />
          <span className="text-sm md:text-base">تعليق</span>
          {commentsCount > 0 && (
            <span className="text-xs bg-neutral-600 px-2 py-0.5 rounded-full text-gray-400">{commentsCount}</span>
          )}
        </button>
      </div>

      {/* Comment Panel - Inline */}
      <PostCommentPanel
        isOpen={showComments}
        postId={postId}
      />
    </div>
  );
};

export default AboutMePost;
