import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  Type,
  Loader2,
  Pencil,
  PenSquare,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Header from "../../components/common/Header";
import Button from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import RichTextEditor from "../../components/common/RichTextEditor";
import { useGetWorkById } from "../../hooks/work/useGetWorkById";
import { useGetChapterById } from "../../hooks/work/useGetChapterById";
import { useCreateChapter } from "../../hooks/work/useCreateChapter";
import { useUpdateChapter } from "../../hooks/work/useUpdateChapter";
import { useDeleteChapter } from "../../hooks/work/useDeleteChapter";
import mainPicture from "../../assets/mainPicture.jpg";
import { formatSmart } from "../../utils/date";

const AUTOSAVE_DELAY = 2000;
const MAX_CONTENT_LENGTH = 20000;
const STATUS_OPTIONS = [
  { label: "Draft", value: "Draft" },
  { label: "Published", value: "Published" },
];

const ChapterEditorPage = () => {
  const navigate = useNavigate();
  const { workId, chapterId: chapterIdParam } = useParams();

  const normalizedChapterId = chapterIdParam && chapterIdParam !== "new" ? chapterIdParam : null;

  const [chapterId, setChapterId] = useState(normalizedChapterId);
  const [editorState, setEditorState] = useState({ title: "", status: STATUS_OPTIONS[1].value, content: "" });
  const [saveState, setSaveState] = useState({ status: "idle", lastSavedAt: null, error: null });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const lastSavedSnapshotRef = useRef(editorState);
  const isUnmountedRef = useRef(false);
  const location = useLocation();
  const navigationInterceptedRef = useRef(false);

  const {
    data: work,
    isPending: isWorkLoading,
  } = useGetWorkById(workId, { enabled: Boolean(workId) });

  const {
    data: chapterData,
    isFetching: isChapterFetching,
  } = useGetChapterById(workId, chapterId, {
    enabled: Boolean(workId) && Boolean(chapterId),
  });

  const { mutateAsync: createChapter, isPending: isCreatingChapter } = useCreateChapter();
  const { mutateAsync: updateChapter, isPending: isUpdatingChapter } = useUpdateChapter();
  const { mutateAsync: deleteChapter, isPending: isDeletingChapter } = useDeleteChapter();

  const isSaving = isCreatingChapter || isUpdatingChapter;
  const isNewChapter = !chapterId;
  const shouldShowBlockingLoader =
    isWorkLoading || (isChapterFetching && !chapterData && !isNewChapter);

  // Custom navigate wrapper that checks for unsaved changes
  const navigateWithCheck = useCallback(
    (to, options = {}) => {
      if (hasUnsavedChanges && !navigationInterceptedRef.current) {
        navigationInterceptedRef.current = true;
        setPendingNavigation(() => () => {
          navigationInterceptedRef.current = false;
          navigate(to, options);
        });
        setShowUnsavedChangesModal(true);
        return;
      }
      navigationInterceptedRef.current = false;
      navigate(to, options);
    },
    [navigate, hasUnsavedChanges]
  );

  const goToChaptersView = useCallback(
    (options = {}) => {
      if (!workId) return;
      
      const { state: extraState, ...rest } = options;
      navigateWithCheck(`/dashboard/works/${workId}/edit`, {
        state: { focusTab: "chapters", ...(extraState || {}) },
        ...rest,
      });
    },
    [navigateWithCheck, workId]
  );

  useEffect(() => {
    isUnmountedRef.current = false;
    return () => {
      isUnmountedRef.current = true;
    };
  }, []);

  // Intercept browser back/forward navigation and link clicks
  useEffect(() => {
    const handlePopState = (event) => {
      if (hasUnsavedChanges && !navigationInterceptedRef.current) {
        // Prevent the navigation
        event.preventDefault();
        window.history.pushState(null, '', window.location.href);
        
        // Show modal with navigation to previous location
        navigationInterceptedRef.current = true;
        setPendingNavigation(() => () => {
          navigationInterceptedRef.current = false;
          window.history.back();
        });
        setShowUnsavedChangesModal(true);
      }
    };

    // Intercept link clicks
    const handleLinkClick = (event) => {
      const target = event.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || href.startsWith('#') || target.getAttribute('target') === '_blank') return;
      
      // Check if it's an internal link (React Router)
      if (href.startsWith('/') && hasUnsavedChanges && !navigationInterceptedRef.current) {
        event.preventDefault();
        navigationInterceptedRef.current = true;
        setPendingNavigation(() => () => {
          navigationInterceptedRef.current = false;
          navigate(href);
        });
        setShowUnsavedChangesModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [hasUnsavedChanges, navigate]);

  useEffect(() => {
    if (!chapterData) return;
    
    // ✅ Reconstruct content from paragraphs array (backend returns paragraphs now)
    let reconstructedContent = "";
    if (chapterData.paragraphs && chapterData.paragraphs.length > 0) {
      reconstructedContent = chapterData.paragraphs
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((p) => p.content)
        .join("\n\n"); // Join with double newline for paragraph separation
    } else if (chapterData.content) {
      // Fallback for old chapters (backward compatibility)
      reconstructedContent = chapterData.content;
    }
    
    const nextState = {
      title: chapterData.title ?? "",
      status: STATUS_OPTIONS.some((option) => option.value === chapterData.status)
        ? chapterData.status
        : STATUS_OPTIONS[0].value,
      content: reconstructedContent,
    };
    lastSavedSnapshotRef.current = nextState;
    setEditorState(nextState);
    setHasUnsavedChanges(false);
    setSaveState((prev) => ({
      ...prev,
      status: "idle",
      error: null,
      lastSavedAt: chapterData.updatedAt ? new Date(chapterData.updatedAt) : prev.lastSavedAt,
    }));
  }, [chapterData]);

  useEffect(() => {
    if (normalizedChapterId || chapterData) return;
    const defaultState = { title: "", status: STATUS_OPTIONS[1].value, content: "" };
    lastSavedSnapshotRef.current = defaultState;
    setEditorState(defaultState);
  }, [normalizedChapterId, chapterData]);

  const wordCount = useMemo(() => {
    // Strip HTML tags and get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorState.content || '';
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    return plainText.trim().length
      ? plainText
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      : 0;
  }, [editorState.content]);

  const characterCount = useMemo(() => {
    // Strip HTML tags and get plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = editorState.content || '';
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    return plainText.trim().length;
  }, [editorState.content]);

  const visibilityMeta = useMemo(() => {
    const isPublished = editorState.status === "Published";
    return {
      isPublished,
      statusLabel: isPublished ? "Published" : "Draft",
      helperText: isPublished
        ? "Readers can see this chapter once sync completes."
        : "Only you can view this chapter until you publish it.",
      badgeTone: isPublished
        ? "border-emerald-400/50 bg-emerald-500/10"
        : "border-amber-400/50 bg-amber-500/10",
      badgeText: isPublished ? "text-emerald-200" : "text-amber-200",
    };
  }, [editorState.status]);

  // Track unsaved changes
  useEffect(() => {
    const snapshot = lastSavedSnapshotRef.current;
    const hasChanges =
      editorState.title !== snapshot.title ||
      editorState.status !== snapshot.status ||
      editorState.content !== snapshot.content;

    setHasUnsavedChanges(hasChanges);
  }, [editorState]);

  const syncSnapshotWithState = useCallback((state) => {
    lastSavedSnapshotRef.current = {
      title: state.title,
      status: state.status,
      content: state.content,
    };
    setHasUnsavedChanges(false);
  }, []);

  const handleSave = useCallback(
    async () => {
      if (!workId) return;
      if (!hasUnsavedChanges) {
        toast.info("لا توجد تغييرات للحفظ");
        return;
      }

      const trimmedTitle = editorState.title.trim();
      const trimmedContent = editorState.content.trim();
      
      if (!trimmedTitle && !trimmedContent) {
        toast.error("يجب إدخال عنوان أو محتوى على الأقل");
        return;
      }

      setSaveState((prev) => ({ ...prev, status: "saving", error: null }));

      try {
        if (!chapterId) {
          // Create new chapter
          const response = await createChapter({
            workId,
            payload: {
              title: trimmedTitle || "فصل بدون عنوان",
              status: editorState.status,
              content: trimmedContent,
            },
          });

          if (!response?.id) {
            throw new Error("Chapter ID missing in response");
          }

          if (isUnmountedRef.current) return;

          setChapterId(response.id);
          syncSnapshotWithState({ ...editorState, title: trimmedTitle || "فصل بدون عنوان", content: trimmedContent });
          setSaveState({ status: "saved", lastSavedAt: new Date(), error: null });
          navigate(`/dashboard/works/${workId}/chapters/${response.id}/edit`, { replace: true });
          
          // Toast message based on status
          if (editorState.status === "Published") {
            toast.success("تم نشر الفصل بنجاح");
          } else {
            toast.success("تم حفظ المسودة بنجاح");
          }
        } else {
          // Track if status changed
          const previousStatus = lastSavedSnapshotRef.current.status;
          const statusChanged = previousStatus !== editorState.status;
          
          // Update existing chapter
          await updateChapter({
            workId,
            chapterId,
            payload: {
              title: trimmedTitle || "فصل بدون عنوان",
              status: editorState.status,
              content: trimmedContent,
            },
          });
          
          if (isUnmountedRef.current) return;
          
          syncSnapshotWithState({ ...editorState, title: trimmedTitle || "فصل بدون عنوان", content: trimmedContent });
          setSaveState({ status: "saved", lastSavedAt: new Date(), error: null });
          
          // Toast message based on status change
          if (statusChanged) {
            if (editorState.status === "Published") {
              toast.success("تم نشر الفصل بنجاح");
            } else {
              toast.success("تم تحويل الفصل إلى مسودة");
            }
          } else {
            toast.success("تم حفظ التغييرات بنجاح");
          }
        }
      } catch (error) {
        if (isUnmountedRef.current) return;
        const message = error?.message || "فشل الحفظ";
        setSaveState((prev) => ({ ...prev, status: "error", error: message }));
        toast.error(message);
      }
    },
    [chapterId, createChapter, editorState, navigate, syncSnapshotWithState, updateChapter, workId, hasUnsavedChanges]
  );

  const handleFieldChange = (field, value) => {
    setEditorState((prev) => ({ ...prev, [field]: value }));
  };

  // Warn before closing tab/window with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleDelete = async () => {
    if (!workId || !chapterId) {
      setShowDeleteModal(false);
      return;
    }

    try {
      await deleteChapter({ workId, chapterId });
      toast.success("Chapter removed");
  goToChaptersView({ replace: true });
    } catch (error) {
      toast.error(error?.message || "Unable to delete chapter");
    } finally {
      setShowDeleteModal(false);
    }
  };

  const coverSource = useMemo(() => {
    if (work?.coverImageUrl) return work.coverImageUrl;
    return mainPicture;
  }, [work?.coverImageUrl]);

  return (
    <>
      <Header />
      <div dir="rtl" className="min-h-screen text-white" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        
        <main className="mx-auto w-full max-w-5xl">
          {/* Header with Return and Save buttons - directly above the editor container */}
          <header className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <Button
              variant="ghost"
              className="noto-sans-arabic-bold border px-4 py-2"
              style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#FFFFFF' }}
              onClick={() => goToChaptersView()}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لمساحة العمل
            </Button>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div
                className="noto-sans-arabic-bold inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs"
                style={
                  hasUnsavedChanges
                    ? { borderColor: '#FF4444', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#FF4444' }
                    : saveState.lastSavedAt
                    ? { borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }
                    : { borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#B8B8B8' }
                }
                data-testid="save-status"
              >
                {hasUnsavedChanges ? (
                  <AlertCircle className="h-3.5 w-3.5" />
                ) : saveState.lastSavedAt ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <PenSquare className="h-3.5 w-3.5" />
                )}
                <span>
                  {hasUnsavedChanges 
                    ? "تغييرات غير محفوظة" 
                    : saveState.lastSavedAt 
                      ? `آخر حفظ ${formatSmart(saveState.lastSavedAt)}` 
                      : "لا توجد تغييرات"
                  }
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="noto-sans-arabic-bold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    {isNewChapter ? "جاري النشر..." : "جاري الحفظ..."}
                  </>
                ) : (
                  <>
                    {isNewChapter ? (
                      <>
                        <BookOpen className="ml-2 h-4 w-4" />
                        {editorState.status === "Published" ? "نشر الفصل" : "حفظ كمسودة"}
                      </>
                    ) : (
                      <>
                        <Pencil className="ml-2 h-4 w-4" />
                        {editorState.status === "Published" ? "حفظ ونشر" : "حفظ كمسودة"}
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </header>

          <section className="rounded-2xl border px-10 py-12" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
            {shouldShowBlockingLoader ? (
              <div className="flex h-[28rem] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#797979' }} />
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <div className="space-y-2">
                  <label htmlFor="chapter-title" className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>
                    عنوان الفصل
                  </label>
                  <input
                    id="chapter-title"
                    value={editorState.title}
                    onChange={(event) => handleFieldChange("title", event.target.value.slice(0, 180))}
                    placeholder="مثال: بداية الرحلة"
                    className="noto-sans-arabic-extrabold w-full rounded-2xl border px-6 py-4 text-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition"
                    style={{ 
                      borderColor: '#5A5A5A', 
                      backgroundColor: '#2C2C2C',
                      caretColor: '#0077FF'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#0077FF';
                      e.currentTarget.style.ringColor = 'rgba(0, 119, 255, 0.4)';
                    }}
                    onBlur={(e) => e.currentTarget.style.borderColor = '#5A5A5A'}
                  />
                </div>

                <div className="space-y-3">
                  <div className="noto-sans-arabic-medium flex items-center justify-between text-xs" style={{ color: '#797979' }}>
                    <span>مخطوطة الفصل</span>
                    <span>
                      {characterCount}/{MAX_CONTENT_LENGTH} حرف
                    </span>
                  </div>
                  <RichTextEditor
                    content={editorState.content}
                    onChange={(html) => handleFieldChange("content", html)}
                    placeholder="اكتب الفصل كاملاً هنا. يمكنك تنسيق النص بالخط العريض، المائل، أو التسطير."
                    maxLength={MAX_CONTENT_LENGTH}
                    dir="rtl"
                    status={editorState.status}
                    onStatusChange={(newStatus) => handleFieldChange("status", newStatus)}
                    wordCount={wordCount}
                    characterCount={characterCount}
                  />
                </div>

                <div className="noto-sans-arabic-medium flex flex-col gap-3 rounded-xl border p-6 text-sm md:flex-row md:items-center md:justify-between" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
                  <div className="flex items-center gap-3 text-white">
                    {hasUnsavedChanges ? (
                      <AlertCircle className="h-5 w-5" style={{ color: '#FF4444' }} />
                    ) : saveState.lastSavedAt ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: '#0077FF' }} />
                    ) : (
                      <PenSquare className="h-5 w-5" style={{ color: '#0077FF' }} />
                    )}
                    <span>
                      {hasUnsavedChanges
                        ? "لديك تغييرات غير محفوظة. تذكر أن تضغط زر الحفظ قبل المغادرة."
                        : saveState.lastSavedAt
                        ? "تمت مزامنة المسودة. يمكنك إغلاق التبويب بثقة."
                        : "اضغط زر الحفظ بعد إجراء التغييرات للاحتفاظ بعملك."}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={!chapterId || isDeletingChapter}
                      className="noto-sans-arabic-bold flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف الفصل
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Delete Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div dir="rtl" className="space-y-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border text-red-400" style={{ borderColor: 'rgb(244 63 94)', backgroundColor: 'rgba(244, 63, 94, 0.1)' }}>
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="noto-sans-arabic-extrabold text-lg">حذف هذا الفصل؟</h3>
              <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                هذا الإجراء يزيل الفصل فوراً. القراء لن يروه بعد الآن في تدفق الرواية.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
            <p className="noto-sans-arabic-bold text-white">ماذا سيحدث بعد ذلك</p>
            <p className="noto-sans-arabic-medium">
              سيبقى سجل الحفظ التلقائي للاسترداد من قبل فريق الدعم، لكنه لن يظهر في لوحة التحكم الخاصة بك.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeletingChapter} className="noto-sans-arabic-bold">
              حذف الفصل
            </Button>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeletingChapter} className="noto-sans-arabic-bold">
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>

      {/* Unsaved Changes Modal */}
      <Modal isOpen={showUnsavedChangesModal} onClose={() => setShowUnsavedChangesModal(false)}>
        <div dir="rtl" className="space-y-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border" style={{ borderColor: '#FF4444', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#FF4444' }}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="noto-sans-arabic-extrabold text-lg">تغييرات غير محفوظة</h3>
              <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                لديك تغييرات لم يتم حفظها. ماذا تريد أن تفعل؟
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
            <p className="noto-sans-arabic-medium">
              إذا غادرت الآن، ستفقد جميع التغييرات التي لم يتم حفظها منذ آخر عملية حفظ.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row-reverse">
              <Button 
                variant="primary" 
                onClick={async () => {
                  await handleSave();
                  if (pendingNavigation) {
                    pendingNavigation();
                  }
                  setShowUnsavedChangesModal(false);
                  setPendingNavigation(null);
                }}
                isLoading={isSaving}
                className="noto-sans-arabic-bold"
              >
                احفظ ثم غادر
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (pendingNavigation) {
                    pendingNavigation();
                  }
                  setShowUnsavedChangesModal(false);
                  setPendingNavigation(null);
                }}
                disabled={isSaving}
                className="noto-sans-arabic-bold"
              >
                غادر بدون حفظ
              </Button>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowUnsavedChangesModal(false);
                setPendingNavigation(null);
              }}
              disabled={isSaving}
              className="noto-sans-arabic-bold"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default ChapterEditorPage;
