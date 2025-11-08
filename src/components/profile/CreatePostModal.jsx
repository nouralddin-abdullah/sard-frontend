import React, { useState } from "react";
import { X, Image as ImageIcon, Book, Upload, Loader2 } from "lucide-react";
import { useCreatePost } from "../../hooks/post/useCreatePost";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { useGetMyReadingLists } from "../../hooks/reading-list/useGetMyReadingLists";
import { useGetMyWorks } from "../../hooks/work/useGetMyWorks";
import { useGetReadingHistory } from "../../hooks/novel/useGetReadingHistory";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [attachedNovelId, setAttachedNovelId] = useState(null);
  const [showNovelSelector, setShowNovelSelector] = useState(false);
  const [novelSource, setNovelSource] = useState(null); // 'library', 'reading-lists', 'my-novels'

  const { data: currentUser } = useGetLoggedInUser();
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();

  // Fetch novels based on selected source
  const { data: readingListsData, isLoading: loadingReadingLists } =
    useGetMyReadingLists(1, 100, { enabled: isOpen && novelSource === "reading-lists" });
  
  const { data: myWorksData, isPending: loadingMyWorks } = useGetMyWorks({
    pageSize: 100,
    enabled: isOpen && novelSource === "my-novels",
  });

  // Library query always fetches if authenticated (can't disable dynamically)
  const { data: libraryData, isLoading: loadingLibrary } = useGetReadingHistory(1, 100);
  
  // Only show loading when actually using library data
  const isLibraryLoading = novelSource === "library" && loadingLibrary;

  const maxWords = 1500;
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleNovelSelect = (novelId) => {
    setAttachedNovelId(novelId);
    setShowNovelSelector(false);
  };

  const handleRemoveNovel = () => {
    setAttachedNovelId(null);
  };

  const getSelectedNovel = () => {
    if (!attachedNovelId) return null;

    // Check reading lists - API returns 'previewNovels', not 'novels'
    if (novelSource === "reading-lists" && readingListsData?.items) {
      for (const list of readingListsData.items) {
        const novel = list.previewNovels?.find((n) => n.novelId === attachedNovelId);
        if (novel) {
          return {
            id: novel.novelId,
            title: novel.title,
            coverImageUrl: novel.coverImageUrl,
            author: novel.author || { displayName: "Unknown" },
            slug: novel.slug
          };
        }
      }
    }

    // Check my works
    if (novelSource === "my-novels" && myWorksData?.pages) {
      for (const page of myWorksData.pages) {
        const work = page.items?.find((w) => w.id === attachedNovelId);
        if (work) {
          return {
            id: work.id,
            title: work.title,
            coverImageUrl: work.coverImage || work.coverImageUrl,
            author: { displayName: currentUser?.displayName || "You" },
          };
        }
      }
    }

    // Check library
    if (novelSource === "library" && libraryData?.items) {
      const item = libraryData.items.find((i) => i.novelId === attachedNovelId);
      if (item) {
        return {
          id: item.novelId,
          title: item.title,
          coverImageUrl: item.coverImageUrl,
          author: item.author || { displayName: "Unknown" },
        };
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    createPost(
      {
        content: content.trim(),
        image: imageFile,
        novelId: attachedNovelId,
      },
      {
        onSuccess: () => {
          // Reset form
          setContent("");
          setImageFile(null);
          setImagePreview(null);
          setAttachedNovelId(null);
          setNovelSource(null);
          onClose();
        },
        onError: (error) => {
          console.error("Error creating post:", error);
        },
      }
    );
  };

  const handleSaveDraft = () => {
    // Save draft to localStorage
    const draft = {
      content,
      imagePreview,
      attachedNovelId,
      novelSource,
      timestamp: Date.now(),
    };
    localStorage.setItem("postDraft", JSON.stringify(draft));
  };

  const getNovelsToDisplay = () => {
    if (novelSource === "reading-lists" && readingListsData?.items) {
      // Flatten all novels from all reading lists
      // API returns 'previewNovels' array, not 'novels'
      return readingListsData.items.flatMap((list) =>
        (list.previewNovels || []).map((novel) => ({ 
          id: novel.novelId, // API uses novelId
          title: novel.title,
          coverImageUrl: novel.coverImageUrl,
          author: novel.author || { displayName: "Unknown" },
          slug: novel.slug,
          listName: list.name
        }))
      );
    }
    
    if (novelSource === "my-novels" && myWorksData?.pages) {
      // Flatten all works from infinite query pages
      return myWorksData.pages.flatMap((page) =>
        (page.items || []).map((work) => ({
          id: work.id,
          title: work.title,
          coverImageUrl: work.coverImage || work.coverImageUrl,
          author: { displayName: currentUser?.displayName || "You" },
          slug: work.slug,
        }))
      );
    }
    
    if (novelSource === "library" && libraryData?.items) {
      // Map library items to expected format
      return libraryData.items.map((item) => ({
        id: item.novelId,
        title: item.title,
        coverImageUrl: item.coverImageUrl,
        author: item.author || { displayName: "Unknown" },
        slug: item.slug,
      }));
    }
    
    return [];
  };

  const isLoadingNovels =
    (novelSource === "reading-lists" && loadingReadingLists) ||
    (novelSource === "my-novels" && loadingMyWorks) ||
    (novelSource === "library" && isLibraryLoading);

  if (!isOpen) return null;

  const selectedNovel = getSelectedNovel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-2xl rounded-xl bg-[#1A1A1A] border border-[#3C3C3C] shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3C3C3C] p-4 sm:p-6">
          <div>
            <h3 className="text-white text-xl font-bold noto-sans-arabic-extrabold">
              ماذا يدور في ذهنك؟
            </h3>
            <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium mt-1">
              شارك أفكارك مع المتابعين
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2C2C2C] text-[#B0B0B0] hover:bg-[#3C3C3C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {/* Textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ابدأ الكتابة هنا..."
              className="w-full min-h-[200px] resize-none bg-transparent text-[#E0E0E0] focus:outline-none border-none p-0 text-lg leading-relaxed placeholder:text-[#556077] noto-sans-arabic-medium"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-[300px] object-cover rounded-lg"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 left-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Attached Novel Preview */}
            {selectedNovel && (
              <div className="border border-[#3C3C3C] rounded-lg p-4 bg-[#2C2C2C]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-[#B0B0B0] noto-sans-arabic-extrabold">
                    رواية مرفقة
                  </h4>
                  <button
                    onClick={handleRemoveNovel}
                    className="text-[#B0B0B0] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedNovel.coverImageUrl}
                    alt={selectedNovel.title}
                    className="w-12 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm noto-sans-arabic-extrabold">
                      {selectedNovel.title}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Novel Selector */}
            {showNovelSelector && !attachedNovelId && (
              <div className="border border-[#3C3C3C] rounded-lg p-4 bg-[#2C2C2C]">
                <h4 className="text-white font-bold mb-3 noto-sans-arabic-extrabold">
                  اختر مصدر الرواية
                </h4>
                
                {!novelSource ? (
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setNovelSource("my-novels")}
                      className="p-3 bg-[#1A1A1A] hover:bg-[#3C3C3C] rounded-lg text-right text-white noto-sans-arabic-medium transition-colors"
                    >
                      رواياتي
                    </button>
                    <button
                      onClick={() => setNovelSource("library")}
                      className="p-3 bg-[#1A1A1A] hover:bg-[#3C3C3C] rounded-lg text-right text-white noto-sans-arabic-medium transition-colors"
                    >
                      مكتبتي
                    </button>
                    <button
                      onClick={() => setNovelSource("reading-lists")}
                      className="p-3 bg-[#1A1A1A] hover:bg-[#3C3C3C] rounded-lg text-right text-white noto-sans-arabic-medium transition-colors"
                    >
                      قوائم القراءة
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">
                        {novelSource === "my-novels" && "رواياتي"}
                        {novelSource === "library" && "مكتبتي"}
                        {novelSource === "reading-lists" && "قوائم القراءة"}
                      </p>
                      <button
                        onClick={() => setNovelSource(null)}
                        className="text-[#4A9EFF] text-sm noto-sans-arabic-medium hover:underline"
                      >
                        رجوع
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto space-y-2">
                      {isLoadingNovels ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-[#4A9EFF]" />
                        </div>
                      ) : getNovelsToDisplay().length === 0 ? (
                        <div className="text-center py-8 text-[#B0B0B0] noto-sans-arabic-medium">
                          لا توجد روايات متاحة
                        </div>
                      ) : (
                        getNovelsToDisplay().map((novel) => (
                          <button
                            key={novel.id}
                            onClick={() => handleNovelSelect(novel.id)}
                            className="w-full flex items-center gap-3 p-2 bg-[#1A1A1A] hover:bg-[#3C3C3C] rounded-lg transition-colors"
                          >
                            <img
                              src={novel.coverImageUrl}
                              alt={novel.title}
                              className="w-10 h-14 object-cover rounded"
                            />
                            <div className="flex-1 text-right">
                              <p className="text-white text-sm font-bold noto-sans-arabic-extrabold truncate">
                                {novel.title}
                              </p>
                              {novel.listName && (
                                <p className="text-[#4A9EFF] text-xs noto-sans-arabic-medium">
                                  {novel.listName}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#3C3C3C]">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between gap-4 px-6 py-3">
            <div className="flex items-center gap-2">
              <label className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 text-[#B0B0B0] hover:text-white transition-colors cursor-pointer">
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => setShowNovelSelector(!showNovelSelector)}
                className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 text-[#B0B0B0] hover:text-white transition-colors"
              >
                <Book className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium">
              {wordCount.toLocaleString("ar-SA")}/{maxWords.toLocaleString("ar-SA")} كلمة
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 px-6 py-4">
            <button
              onClick={handleSaveDraft}
              disabled={!content.trim()}
              className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#2C2C2C] text-white text-sm font-bold noto-sans-arabic-extrabold hover:bg-[#3C3C3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              حفظ مسودة
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting || wordCount > maxWords}
              className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#4A9EFF] text-white text-sm font-bold noto-sans-arabic-extrabold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <span>نشر</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
