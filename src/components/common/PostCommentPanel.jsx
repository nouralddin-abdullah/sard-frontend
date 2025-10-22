import { useState, useRef, useEffect } from "react";
import { X, ThumbsUp, MessageCircle, Flag, ChevronDown, Image as ImageIcon } from "lucide-react";

const PostCommentPanel = ({ isOpen, postId }) => {
  const [comments, setComments] = useState([
    {
      id: 1,
      userId: "user1",
      username: "محارب_الأشرار",
      displayName: "محارب الأشرار",
      avatar: "/profilePicture.jpg",
      content: "منشور رائع! معلومات قيمة ومفيدة جداً. شكراً على المشاركة",
      likes: 12,
      isLiked: false,
      timestamp: "منذ ساعتين",
      replies: [
        {
          id: 11,
          userId: "user2",
          username: "قارئ_نهم",
          displayName: "قارئ نهم",
          avatar: "/badge-2.png",
          content: "أوافقك الرأي تماماً!",
          likes: 5,
          isLiked: true,
          timestamp: "منذ ساعة"
        }
      ]
    },
    {
      id: 2,
      userId: "user3",
      username: "عاشق_الروايات",
      displayName: "عاشق الروايات",
      avatar: "/badge-3.png",
      content: "محتوى ممتاز! أتمنى المزيد من هذه المنشورات",
      likes: 8,
      isLiked: true,
      timestamp: "منذ 3 ساعات",
      replies: []
    }
  ]);

  const [sortBy, setSortBy] = useState("newest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const panelRef = useRef(null);
  const sortDropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleLike = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
    }
  };

  const handleSubmit = () => {
    if (!newComment.trim() && !selectedImage) return;

    if (replyingTo) {
      const newReply = {
        id: Date.now(),
        userId: "currentUser",
        username: "أنت",
        displayName: "أنت",
        avatar: "/profilePicture.jpg",
        content: newComment,
        image: imagePreview,
        likes: 0,
        isLiked: false,
        timestamp: "الآن"
      };

      setComments(comments.map(comment => {
        if (comment.id === replyingTo) {
          return {
            ...comment,
            replies: [...comment.replies, newReply]
          };
        }
        return comment;
      }));
    } else {
      const newCommentObj = {
        id: Date.now(),
        userId: "currentUser",
        username: "أنت",
        displayName: "أنت",
        avatar: "/profilePicture.jpg",
        content: newComment,
        image: imagePreview,
        likes: 0,
        isLiked: false,
        timestamp: "الآن",
        replies: []
      };

      setComments([newCommentObj, ...comments]);
    }

    setNewComment("");
    setReplyingTo(null);
    handleRemoveImage();
  };

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === "popular") {
      return b.likes - a.likes;
    } else if (sortBy === "oldest") {
      return a.id - b.id;
    }
    return b.id - a.id;
  });

  if (!isOpen) return null;

  return (
    <div className="border-t border-neutral-600 bg-[#3C3C3C]">
      <div ref={panelRef} className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#5A5A5A]">
          <div className="flex items-center gap-3">
            <h2 className="text-white text-xl noto-sans-arabic-bold">
              التعليقات ({comments.length})
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
                  {sortBy === "newest" ? "الأحدث" : sortBy === "oldest" ? "الأقدم" : "الأكثر إعجاباً"}
                </span>
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <div className="absolute left-0 top-full mt-2 w-40 bg-[#2C2C2C] rounded-lg shadow-lg overflow-hidden z-10">
                  <button
                    onClick={() => {
                      setSortBy("newest");
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
                    الأكثر إعجاباً
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[600px]">
          {sortedComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="hover:bg-[#2C2C2C] rounded-lg p-3 transition-colors">
                {/* User Info */}
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={comment.avatar}
                    alt={comment.displayName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white noto-sans-arabic-medium text-sm">
                        {comment.displayName}
                      </span>
                      <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                        @{comment.username}
                      </span>
                    </div>
                    <span className="text-[#686868] noto-sans-arabic-medium text-xs">
                      {comment.timestamp}
                    </span>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-white noto-sans-arabic-medium text-sm leading-relaxed mb-3 pr-13">
                  {comment.content}
                </p>

                {/* Comment Image */}
                {comment.image && (
                  <div className="pr-13 mb-3">
                    <img 
                      src={comment.image} 
                      alt="Comment attachment" 
                      className="max-w-full h-auto rounded-lg max-h-80 object-cover"
                    />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 pr-13">
                  <button
                    onClick={() => handleLike(comment.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      comment.isLiked ? "text-[#FF4444]" : "text-[#686868] hover:text-[#FF4444]"
                    }`}
                  >
                    <ThumbsUp size={16} fill={comment.isLiked ? "#FF4444" : "none"} />
                    <span className="noto-sans-arabic-medium text-xs">{comment.likes}</span>
                  </button>

                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="flex items-center gap-1 text-[#686868] hover:text-[#0077FF] transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="noto-sans-arabic-medium text-xs">رد</span>
                  </button>

                  <button className="flex items-center gap-1 text-[#686868] hover:text-red-500 transition-colors">
                    <Flag size={16} />
                    <span className="noto-sans-arabic-medium text-xs">إبلاغ</span>
                  </button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
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
        </div>

        {/* Comment Input - Sticky at Bottom */}
        <div className="border-t border-[#5A5A5A] p-4 bg-[#3C3C3C]">
          {replyingTo && (
            <div className="flex items-center justify-between mb-2 px-3 py-2 bg-[#2C2C2C] rounded-lg">
              <span className="text-[#686868] noto-sans-arabic-medium text-sm">
                الرد على {comments.find(c => c.id === replyingTo)?.displayName}
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
              src="/profilePicture.jpg"
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
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="اكتب تعليقاً..."
                className="w-full bg-[#5A5A5A] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#0077FF] placeholder-[#797979]"
                rows="2"
                style={{ maxHeight: "120px" }}
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
    </div>
  );
};

export default PostCommentPanel;
