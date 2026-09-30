import React, { useState } from "react";
import { X, Image as ImageIcon, Book, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreatePost } from "../../hooks/post/useCreatePost";
import { usePostLimits } from "../../hooks/app/useAppConfig";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";
import { useGetMyReadingLists } from "../../hooks/reading-list/useGetMyReadingLists";
import { useGetMyWorks } from "../../hooks/work/useGetMyWorks";
import { useGetReadingHistory } from "../../hooks/novel/useGetReadingHistory";
import { countCharacters } from "../../utils/text-length";
import NovelCover from "../common/NovelCover";

// A size in megabytes as the API writes it: 5 (5,242,880 bytes), or 1.5.
const megabytes = (bytes) => Math.round((bytes / (1024 * 1024)) * 10) / 10;

// The picture refusals, in the API's words (PostImageType, PostImageTooLarge), checked before uploading.
const IMAGE_TYPE_MESSAGE = "صيغة الصورة غير مدعومة: اختر صورة JPEG أو PNG أو WebP.";
const imageTooLargeMessage = (maxBytes) => `الصورة كبيرة: الحد الأقصى ${megabytes(maxBytes)} ميغابايت.`;

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [attachedNovelId, setAttachedNovelId] = useState(null);
  const [showNovelSelector, setShowNovelSelector] = useState(false);
  const [novelSource, setNovelSource] = useState(null); // 'library', 'reading-lists', 'my-novels'
  // A refused picture, or the API's refusal of the post: shown under the toolbar until the post changes.
  const [error, setError] = useState(null);

  const { data: currentUser } = useGetLoggedInUser();
  const { mutate: createPost, isPending: isSubmitting } = useCreatePost();
  // The limits the API checks posts against (#43), from /api/app/config.
  const limits = usePostLimits(isOpen);

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

  // Counted as the API counts it: trimmed, in user-perceived characters (an emoji or a letter with its tashkeel is one).
  const trimmedContent = content.trim();
  const contentLength = countCharacters(trimmedContent);
  const contentTooLong = contentLength > limits.contentMaxLength;
  // A post needs text, a picture or a novel (the API answers PostContentRequired otherwise).
  const hasSomething = trimmedContent.length > 0 || !!imageFile || !!attachedNovelId;
  const canSubmit = hasSomething && !contentTooLong && !isSubmitting;

  // The API's refusal: a toast, as the site shows errors, and under the toolbar while the post stays as it was.
  const showRefusal = (message) => {
    setError(message);
    toast.error(message);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    // Cleared, so that the same file can be picked again after a refusal or a removal.
    e.target.value = "";
    if (!file) return;

    // Said next to the picker only: toasts would pile up over the buttons on a phone. An empty file is no picture.
    if (!limits.imageTypes.includes(file.type) || file.size === 0) {
      setError(IMAGE_TYPE_MESSAGE);
      return;
    }
    if (file.size > limits.imageMaxBytes) {
      setError(imageTooLargeMessage(limits.imageMaxBytes));
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setError(null);
  };

  const handleNovelSelect = (novelId) => {
    setAttachedNovelId(novelId);
    setShowNovelSelector(false);
    setError(null);
  };

  const handleRemoveNovel = () => {
    setAttachedNovelId(null);
    setError(null);
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
    if (!canSubmit) return;

    createPost(
      {
        content: trimmedContent,
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
          setError(null);
          onClose();
        },
        // The API's Arabic message (PostContentTooLong, PostImageTooLarge, UploadFailed...), and the post stays as it was.
        onError: (submitError) => showRefusal(submitError.message),
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
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        className="w-full max-w-2xl rounded-xl bg-[#1A1A1A] border border-[#3C3C3C] shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3C3C3C] p-4 sm:p-6">
          <div>
            <h3 id="create-post-title" className="text-white text-xl font-bold noto-sans-arabic-extrabold">
              ماذا يدور في ذهنك؟
            </h3>
            <p className="text-[#B0B0B0] text-sm noto-sans-arabic-medium mt-1">
              شارك أفكارك مع المتابعين
            </p>
          </div>
          <button aria-label="إغلاق"
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
              onChange={handleContentChange}
              placeholder="ابدأ الكتابة هنا..."
              aria-label="نص المنشور"
              aria-invalid={contentTooLong}
              aria-describedby="post-content-count"
              className="w-full min-h-[200px] resize-none bg-transparent text-[#E0E0E0] focus:outline-none border-none p-0 text-lg leading-relaxed placeholder:text-[#556077] noto-sans-arabic-medium"
            />

            {/* Image Preview */}
            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="الصورة المرفقة"
                  className="w-full max-h-[300px] object-cover rounded-lg"
                />
                <button aria-label="إزالة الصورة"
                  onClick={handleRemoveImage}
                  className="absolute top-2 end-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
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
                  <button aria-label="إزالة الرواية"
                    onClick={handleRemoveNovel}
                    className="text-[#B0B0B0] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <NovelCover
                    src={selectedNovel.coverImageUrl}
                    title={selectedNovel.title}
                    rounded="rounded"
                    className="w-12 flex-shrink-0"
                    sizes="48px"
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
                            <NovelCover
                              src={novel.coverImageUrl}
                              title={novel.title}
                              rounded="rounded"
                              className="w-10 flex-shrink-0"
                              sizes="40px"
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
              {/* The types the API takes (JPEG, PNG, WebP); a picture over the size limit is refused before uploading. */}
              <label
                title={`صورة JPEG أو PNG أو WebP، حتى ${megabytes(limits.imageMaxBytes)} ميغابايت`}
                className="relative flex items-center justify-center p-2 rounded-full hover:bg-white/10 text-[#B0B0B0] hover:text-white transition-colors cursor-pointer focus-within:ring-2 focus-within:ring-[#4A9EFF]"
              >
                <ImageIcon className="w-5 h-5" />
                <input
                  type="file"
                  accept={limits.imageTypes.join(",")}
                  aria-label="إرفاق صورة"
                  onChange={handleImageUpload}
                  className="sr-only"
                />
              </label>
              <button aria-label="إرفاق رواية"
                onClick={() => setShowNovelSelector(!showNovelSelector)}
                className="flex items-center justify-center p-2 rounded-full hover:bg-white/10 text-[#B0B0B0] hover:text-white transition-colors"
              >
                <Book className="w-5 h-5" />
              </button>
            </div>
            <span
              id="post-content-count"
              dir="ltr"
              aria-label={`${contentLength} من ${limits.contentMaxLength} حرف`}
              className={`shrink-0 text-sm tabular-nums noto-sans-arabic-medium ${contentTooLong ? "text-red-400" : "text-[#B0B0B0]"}`}
            >
              {contentLength}/{limits.contentMaxLength}
            </span>
          </div>

          {(contentTooLong || error) && (
            <div role="alert" className="space-y-1 px-6 pb-1 text-sm text-red-400 noto-sans-arabic-medium">
              {contentTooLong && <p>المنشور أطول من {limits.contentMaxLength} حرف، اختصره لتتمكن من النشر.</p>}
              {error && <p>{error}</p>}
            </div>
          )}

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
              disabled={!canSubmit}
              className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#4A9EFF] text-white text-sm font-bold noto-sans-arabic-extrabold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
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
