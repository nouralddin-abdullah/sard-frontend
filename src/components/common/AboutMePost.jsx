import React, { useState } from "react";
import mainPicture from "../../assets/mainPicture.jpg";
import { Heart, MessageSquareText, ChevronLeft, ChevronRight } from "lucide-react";

const AboutMePost = ({ content }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(3);
  const [showComments, setShowComments] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newComment, setNewComment] = useState("");

  // Mock comments data - replace with actual API data
  const allComments = [
    { id: 1, user: "أحمد محمد", content: "تعليق رائع جداً! استمر في الكتابة", time: "منذ ساعتين", avatar: mainPicture },
    { id: 2, user: "سارة علي", content: "محتوى ممتاز ومفيد للغاية", time: "منذ 5 ساعات", avatar: mainPicture },
    { id: 3, user: "محمود حسن", content: "شكراً على المشاركة", time: "منذ يوم", avatar: mainPicture },
    { id: 4, user: "فاطمة خالد", content: "معلومات قيمة جداً", time: "منذ يومين", avatar: mainPicture },
    { id: 5, user: "يوسف عمر", content: "أتمنى المزيد من هذا المحتوى", time: "منذ 3 أيام", avatar: mainPicture },
    { id: 6, user: "نور الدين", content: "عمل رائع! واصل", time: "منذ أسبوع", avatar: mainPicture },
  ];

  const commentsPerPage = 3;
  const totalPages = Math.ceil(allComments.length / commentsPerPage);
  const startIndex = (currentPage - 1) * commentsPerPage;
  const displayedComments = allComments.slice(startIndex, startIndex + commentsPerPage);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // TODO: Add API call to submit comment
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  // Get top 3 likers avatars
  const topLikers = [mainPicture, mainPicture, mainPicture];

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
          {allComments.length > 0 && (
            <span className="text-xs bg-neutral-600 px-2 py-0.5 rounded-full text-gray-400">{allComments.length}</span>
          )}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-neutral-600 bg-neutral-750">
          {/* Comment Input */}
          <form onSubmit={handleCommentSubmit} className="p-4 border-b border-neutral-600">
            <div className="flex gap-3 items-start">
              <img src={mainPicture} alt="Your profile" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="اكتب تعليقاً..."
                  className="w-full bg-neutral-600 text-white rounded-lg px-4 py-2.5 text-sm md:text-base resize-none focus:outline-none focus:ring-2 focus:ring-[#4A9EFF] noto-sans-arabic-medium"
                  rows="2"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-[#4A9EFF] text-white px-6 py-2 rounded-lg text-sm md:text-base hover:bg-[#3A8EEF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    نشر
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="p-4 space-y-4">
            {displayedComments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-neutral-600 rounded-2xl px-4 py-3">
                    <h4 className="font-semibold text-white text-sm md:text-base mb-1">{comment.user}</h4>
                    <p className="text-gray-200 text-sm md:text-base">{comment.content}</p>
                  </div>
                  <span className="text-xs text-gray-500 mr-2 mt-1 inline-block">{comment.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4 border-t border-neutral-600">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-[#4A9EFF] text-white"
                        : "bg-neutral-600 text-gray-300 hover:bg-neutral-500"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutMePost;
