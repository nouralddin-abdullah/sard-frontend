import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { previewChapterUpdate, useUpdateChapter } from "../../hooks/work/useUpdateChapter";
import { uploadChapterImage } from "../../hooks/work/useUploadChapterImage";
import { useDeleteChapter } from "../../hooks/work/useDeleteChapter";
import { formatSmart } from "../../utils/date";
import { paragraphsToEditorHtml } from "../../utils/chapter-paragraphs";
import { parseHtml } from "../../utils/safe-html";

// Removes paragraphs a reader wouldn't see (no words), as the server does, keeping pictures and scene breaks, which
// have no words but are the author's.
const cleanEmptyParagraphs = (html) => {
  if (!html) return html;

  const tempDiv = parseHtml(html);
  tempDiv.querySelectorAll('p').forEach(p => {
    const isPicture = p.querySelector('img') !== null;
    const isBreak = (p.getAttribute('data-kind') || '').toLowerCase() === 'break';
    if (!isPicture && !isBreak && !p.textContent.trim()) {
      p.remove();
    }
  });

  return tempDiv.innerHTML;
};

// The API's limits (backend ChapterTextRules): a title of at most 50 characters, and at most 100,000 characters of text
// a reader sees (formatting doesn't count).
const TITLE_MAX_LENGTH = 50;
const MAX_CONTENT_LENGTH = 100000;

// «سيُحذف 3 تعليقات»: the count with its noun in the right form.
const commentsPhrase = (count) => {
  if (count === 1) return "تعليق واحد";
  if (count === 2) return "تعليقان";
  const mod100 = count % 100;
  if (mod100 >= 3 && mod100 <= 10) return `${count} تعليقات`;
  if (mod100 >= 11 && mod100 <= 99) return `${count} تعليقًا`;
  return `${count} تعليق`;
};

const AUTOSAVE_DELAY = 2000;
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
  // A save that would delete readers' comments waits for the author's OK: { commentsDeleted, paragraphsRemoved }.
  const [commentLoss, setCommentLoss] = useState(null);
  // The chapter was saved from somewhere else since it was loaded here (409 ChapterChanged).
  const [showConflictModal, setShowConflictModal] = useState(false);

  const lastSavedSnapshotRef = useRef(editorState);
  // The state as last rendered, for callbacks that must decide outside a state updater.
  const editorStateRef = useRef(editorState);
  editorStateRef.current = editorState;
  // The revision the editor's copy was loaded at (backend #75), sent as baseRevision so an older copy never overwrites
  // newer text.
  const revisionRef = useRef(null);
  const hasUnsavedChangesRef = useRef(false);
  const forceReloadRef = useRef(false);
  const isUnmountedRef = useRef(false);
  const navigationInterceptedRef = useRef(false);

  const {
    isPending: isWorkLoading,
  } = useGetWorkById(workId, { enabled: Boolean(workId) });

  const {
    data: chapterData,
    isFetching: isChapterFetching,
    refetch: refetchChapter,
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
    // A refetch while the author has unsaved edits (the one after a save, a window refocus) must not replace them;
    // only a reload she asked for does.
    if (hasUnsavedChangesRef.current && !forceReloadRef.current) {
      if (typeof chapterData.revision === "number" && revisionRef.current === null) {
        revisionRef.current = chapterData.revision;
      }
      return;
    }
    forceReloadRef.current = false;
    revisionRef.current = typeof chapterData.revision === "number" ? chapterData.revision : null;

    // The paragraphs with their kinds (chapter format v1): pictures, centered and quoted paragraphs, scene breaks.
    let reconstructedContent = "";
    if (chapterData.paragraphs && chapterData.paragraphs.length > 0) {
      reconstructedContent = paragraphsToEditorHtml(chapterData.paragraphs);
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
      lastSavedAt: chapterData.updatedAt 
        ? new Date(chapterData.updatedAt.endsWith('Z') ? chapterData.updatedAt : chapterData.updatedAt + 'Z') 
        : prev.lastSavedAt,
    }));
  }, [chapterData]);

  useEffect(() => {
    if (normalizedChapterId || chapterData) return;
    const defaultState = { title: "", status: STATUS_OPTIONS[1].value, content: "" };
    lastSavedSnapshotRef.current = defaultState;
    setEditorState(defaultState);
  }, [normalizedChapterId, chapterData]);

  // The text a reader sees, one block per paragraph (a picture's caption included, a scene break none), so words of two
  // paragraphs are never counted as one.
  const visibleBlocks = useMemo(() => {
    const body = parseHtml(editorState.content);
    body.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    return Array.from(body.querySelectorAll("p"))
      .map((p) => (p.textContent || "").replace(/[ \t\u00a0]+/g, " ").trim())
      .filter(Boolean);
  }, [editorState.content]);

  const wordCount = useMemo(
    () => visibleBlocks.reduce((sum, block) => sum + block.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length, 0),
    [visibleBlocks]
  );

  const characterCount = useMemo(
    () => visibleBlocks.reduce((sum, block) => sum + block.replace(/\n/g, "").length, 0),
    [visibleBlocks]
  );

  const titleLength = editorState.title.trim().length;
  const isTitleTooLong = titleLength > TITLE_MAX_LENGTH;
  const isContentTooLong = characterCount > MAX_CONTENT_LENGTH;

  // The editor writes loaded text its own way (attribute order, <b> as <strong>); that is the saved state, not an edit.
  // Decided outside the state updater, which must stay pure (StrictMode runs it twice).
  const handleContentLoaded = useCallback((html) => {
    if (editorStateRef.current.content !== lastSavedSnapshotRef.current.content) return;
    lastSavedSnapshotRef.current = { ...lastSavedSnapshotRef.current, content: html };
    editorStateRef.current = { ...editorStateRef.current, content: html };
    setEditorState((prev) => ({ ...prev, content: html }));
  }, []);

  // Track unsaved changes
  useEffect(() => {
    const snapshot = lastSavedSnapshotRef.current;
    const hasChanges =
      editorState.title !== snapshot.title ||
      editorState.status !== snapshot.status ||
      editorState.content !== snapshot.content;

    setHasUnsavedChanges(hasChanges);
    hasUnsavedChangesRef.current = hasChanges;
  }, [editorState]);

  const syncSnapshotWithState = useCallback((state) => {
    lastSavedSnapshotRef.current = {
      title: state.title,
      status: state.status,
      content: state.content,
    };
    setHasUnsavedChanges(false);
    hasUnsavedChangesRef.current = false;
  }, []);

  // Saves the chapter; true when it was saved. A save that changes the text first asks the server what it would delete
  // (dry run, backend #75): a paragraph whose words change loses its readers' comments, so the author confirms first
  // (confirmCommentLoss skips the question once she has). A save from an older copy is refused (409) and nothing is lost.
  const handleSave = useCallback(
    async ({ confirmCommentLoss = false } = {}) => {
      if (!workId) return false;
      if (!hasUnsavedChanges) {
        toast.info("لا توجد تغييرات للحفظ");
        return true;
      }

      const trimmedTitle = editorState.title.trim();
      const cleanedContent = cleanEmptyParagraphs(editorState.content.trim());
      const hasWords = visibleBlocks.length > 0 || /<img\s/i.test(cleanedContent);

      if (!trimmedTitle && !hasWords) {
        toast.error("يجب إدخال عنوان أو محتوى على الأقل");
        return false;
      }
      if (isTitleTooLong) {
        toast.error(`يجب ألا يتجاوز عنوان الفصل ${TITLE_MAX_LENGTH} حرفًا`);
        return false;
      }
      if (isContentTooLong) {
        toast.error(`يجب ألا يتجاوز نص الفصل ${MAX_CONTENT_LENGTH} حرف. قسّمه إلى فصلين.`);
        return false;
      }
      if (!hasWords) {
        toast.error("اكتب نص الفصل");
        return false;
      }

      const title = trimmedTitle || "فصل بدون عنوان";
      const savedState = { ...editorState, title };

      setSaveState((prev) => ({ ...prev, status: "saving", error: null }));

      try {
        if (!chapterId) {
          const response = await createChapter({
            workId,
            payload: { title, status: editorState.status, content: cleanedContent },
          });

          if (!response?.id) {
            throw new Error("تعذّر إنشاء الفصل، حاول مرة أخرى.");
          }

          if (isUnmountedRef.current) return true;

          revisionRef.current = typeof response.revision === "number" ? response.revision : null;
          setChapterId(response.id);
          syncSnapshotWithState(savedState);
          setEditorState(savedState);
          setSaveState({ status: "saved", lastSavedAt: new Date(), error: null });
          navigate(`/dashboard/works/${workId}/chapters/${response.id}/edit`, { replace: true });

          toast.success(editorState.status === "Published" ? "تم نشر الفصل بنجاح" : "تم حفظ المسودة بنجاح");
          return true;
        }

        const snapshot = lastSavedSnapshotRef.current;
        const statusChanged = snapshot.status !== editorState.status;
        const textChanged = editorState.title !== snapshot.title || editorState.content !== snapshot.content;

        // Only the status changed: send it alone, the text (and its comments) untouched.
        const payload = textChanged
          ? {
              title,
              content: cleanedContent,
              status: editorState.status,
              ...(revisionRef.current !== null ? { baseRevision: revisionRef.current } : {}),
            }
          : { status: editorState.status };

        if (textChanged && !confirmCommentLoss) {
          const preview = await previewChapterUpdate({ workId, chapterId, payload });
          if (isUnmountedRef.current) return false;
          if ((preview?.commentsDeleted ?? 0) > 0) {
            setCommentLoss({
              commentsDeleted: preview.commentsDeleted,
              paragraphsRemoved: (preview.removed ?? []).filter((p) => p.commentsCount > 0).length,
            });
            setSaveState((prev) => ({ ...prev, status: "idle" }));
            return false;
          }
        }

        const response = await updateChapter({ workId, chapterId, payload });

        if (isUnmountedRef.current) return true;

        if (typeof response?.revision === "number") {
          revisionRef.current = response.revision;
        }
        syncSnapshotWithState(savedState);
        setEditorState(savedState);
        setSaveState({ status: "saved", lastSavedAt: new Date(), error: null });

        if (statusChanged) {
          toast.success(editorState.status === "Published" ? "تم نشر الفصل بنجاح" : "تم تحويل الفصل إلى مسودة");
        } else {
          toast.success("تم حفظ التغييرات بنجاح");
        }
        return true;
      } catch (error) {
        if (isUnmountedRef.current) return false;
        if (error?.status === 409 && error?.code === "ChapterChanged") {
          setSaveState((prev) => ({ ...prev, status: "error", error: error.message }));
          setShowConflictModal(true);
          return false;
        }
        const message = error?.message || "تعذّر حفظ الفصل، حاول مرة أخرى.";
        setSaveState((prev) => ({ ...prev, status: "error", error: message }));
        toast.error(message);
        return false;
      }
    },
    [chapterId, createChapter, editorState, navigate, syncSnapshotWithState, updateChapter, workId, hasUnsavedChanges, visibleBlocks, isTitleTooLong, isContentTooLong]
  );

  // After a conflict: load the chapter as it is now saved, replacing this copy (she can copy her text first).
  const reloadLatestChapter = useCallback(async () => {
    forceReloadRef.current = true;
    setShowConflictModal(false);
    const result = await refetchChapter();
    if (result?.error) {
      forceReloadRef.current = false;
      toast.error("تعذّر تحميل آخر نسخة من الفصل، حاول مرة أخرى.");
    }
  }, [refetchChapter]);

  const copyMyText = useCallback(async () => {
    const text = parseHtml(editorState.content);
    text.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    const plain = Array.from(text.children)
      .map((block) => (block.tagName === "HR" ? "* * *" : block.textContent || ""))
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(`${editorState.title}\n\n${plain}`);
      toast.success("نُسخ نصك. يمكنك لصقه بعد تحميل آخر نسخة.");
    } catch {
      toast.error("تعذّر النسخ. انسخ النص يدويًا من المحرر.");
    }
  }, [editorState.content, editorState.title]);

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
      toast.success("حُذف الفصل");
      goToChaptersView({ replace: true });
    } catch (error) {
      toast.error(error?.message || "تعذّر حذف الفصل، حاول مرة أخرى.");
    } finally {
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Header />
      <div dir="rtl" className="min-h-screen text-white" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 md:gap-8 px-3 md:px-6 py-6 md:py-10">
        
        <main className="mx-auto w-full max-w-5xl">
          {/* Header with Return and Save buttons - directly above the editor container */}
          <header className="flex flex-wrap items-center justify-between gap-3 md:gap-4 mb-4 md:mb-8">
            <Button
              variant="ghost"
              className="noto-sans-arabic-bold border px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm"
              style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#FFFFFF' }}
              onClick={() => goToChaptersView()}
            >
              <ArrowRight className="ml-1.5 md:ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
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
                onClick={() => handleSave()}
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

          <section className="rounded-2xl border px-3 md:px-10 py-6 md:py-12" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
            {shouldShowBlockingLoader ? (
              <div className="flex h-[28rem] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#797979' }} />
              </div>
            ) : (
              <div className="flex flex-col gap-6 md:gap-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="chapter-title" className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>
                      عنوان الفصل
                    </label>
                    <span
                      className="noto-sans-arabic-medium text-xs"
                      style={{ color: isTitleTooLong ? '#F87171' : '#797979' }}
                      aria-live="polite"
                    >
                      {titleLength}/{TITLE_MAX_LENGTH}
                    </span>
                  </div>
                  <input
                    id="chapter-title"
                    value={editorState.title}
                    onChange={(event) => handleFieldChange("title", event.target.value.slice(0, 120))}
                    placeholder="مثال: الفصل 1: بداية الرحلة"
                    aria-invalid={isTitleTooLong}
                    className="noto-sans-arabic-extrabold w-full rounded-xl md:rounded-2xl border px-4 md:px-6 py-3 md:py-4 text-lg md:text-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition"
                    style={{ 
                      borderColor: isTitleTooLong ? '#F87171' : '#5A5A5A', 
                      backgroundColor: '#2C2C2C',
                      caretColor: '#0077FF'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = isTitleTooLong ? '#F87171' : '#0077FF';
                    }}
                    onBlur={(e) => e.currentTarget.style.borderColor = isTitleTooLong ? '#F87171' : '#5A5A5A'}
                  />
                  {isTitleTooLong && (
                    <p className="noto-sans-arabic-medium text-xs text-red-400">
                      يجب ألا يتجاوز عنوان الفصل {TITLE_MAX_LENGTH} حرفًا
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="noto-sans-arabic-medium flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: '#797979' }}>
                    <span>مخطوطة الفصل</span>
                    <span>Enter لفقرة جديدة · Shift+Enter لسطر جديد داخل الفقرة</span>
                  </div>
                  <RichTextEditor
                    content={editorState.content}
                    onChange={(html) => handleFieldChange("content", html)}
                    onContentLoaded={handleContentLoaded}
                    onUploadImage={workId ? (file) => uploadChapterImage({ novelId: workId, file }) : undefined}
                    placeholder="اكتب الفصل هنا. يمكنك تنسيق النص، وتوسيط الأبيات، ووضع الرسائل في اقتباس، وإضافة فواصل المشاهد والصور."
                    maxLength={MAX_CONTENT_LENGTH}
                    dir="rtl"
                    status={editorState.status}
                    onStatusChange={(newStatus) => handleFieldChange("status", newStatus)}
                    wordCount={wordCount}
                    characterCount={characterCount}
                  />
                  {isContentTooLong && (
                    <p className="noto-sans-arabic-medium text-xs text-red-400">
                      تجاوز النص {MAX_CONTENT_LENGTH} حرف، وهو الحد الأقصى للفصل. قسّمه إلى فصلين قبل الحفظ.
                    </p>
                  )}
                </div>

                <div className="noto-sans-arabic-medium flex flex-col gap-3 rounded-xl border p-4 md:p-6 text-xs md:text-sm md:flex-row md:items-center md:justify-between" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
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
                  const saved = await handleSave();
                  setShowUnsavedChangesModal(false);
                  if (saved && pendingNavigation) {
                    pendingNavigation();
                  } else {
                    // Not saved (refused, a comment warning, a conflict): stay, with her text.
                    navigationInterceptedRef.current = false;
                  }
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

      {/* A save that would delete readers' comments: the author decides */}
      <Modal isOpen={Boolean(commentLoss)} onClose={() => setCommentLoss(null)}>
        <div dir="rtl" className="space-y-6 text-white" data-testid="comment-loss-modal">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-amber-400" style={{ borderColor: 'rgb(251 191 36)', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="noto-sans-arabic-extrabold text-lg">
                سيُحذف {commentLoss ? commentsPhrase(commentLoss.commentsDeleted) : ""}
              </h3>
              <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                غيّرت كلمات {commentLoss?.paragraphsRemoved === 1 ? "فقرة عليها" : "فقرات عليها"} تعليقات القراء، أو حذفتها.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
            <p className="noto-sans-arabic-medium">
              تبقى تعليقات الفقرة ما بقيت كلماتها كما هي، حتى لو نقلتها أو غيّرت تنسيقها. أما تغيير كلمة واحدة فيها فيجعلها فقرة جديدة، وتُحذف تعليقاتها نهائيًا.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            <Button
              variant="destructive"
              onClick={async () => {
                setCommentLoss(null);
                await handleSave({ confirmCommentLoss: true });
              }}
              isLoading={isSaving}
              className="noto-sans-arabic-bold"
            >
              احفظ واحذف التعليقات
            </Button>
            <Button variant="ghost" onClick={() => setCommentLoss(null)} disabled={isSaving} className="noto-sans-arabic-bold">
              عُد إلى التحرير
            </Button>
          </div>
        </div>
      </Modal>

      {/* The chapter was saved from somewhere else (the app, another tab) since it was opened here */}
      <Modal isOpen={showConflictModal} onClose={() => setShowConflictModal(false)}>
        <div dir="rtl" className="space-y-6 text-white" data-testid="chapter-conflict-modal">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: '#FF4444', backgroundColor: 'rgba(255, 68, 68, 0.1)', color: '#FF4444' }}>
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="noto-sans-arabic-extrabold text-lg">حُفظ هذا الفصل من مكان آخر</h3>
              <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                عُدّل الفصل من التطبيق أو من نافذة أخرى بعد أن فتحته هنا، فلم يُحفظ شيء حتى لا تضيع تلك التعديلات.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
            <p className="noto-sans-arabic-medium">
              انسخ نصك أولًا إن أردت، ثم حمّل آخر نسخة وأضف إليها تعديلاتك واحفظ.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row-reverse sm:justify-end">
            <Button variant="primary" onClick={reloadLatestChapter} className="noto-sans-arabic-bold">
              حمّل آخر نسخة
            </Button>
            <Button variant="ghost" onClick={copyMyText} className="noto-sans-arabic-bold">
              انسخ نصي
            </Button>
            <Button variant="ghost" onClick={() => setShowConflictModal(false)} className="noto-sans-arabic-bold">
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
