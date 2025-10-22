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
  const [editorState, setEditorState] = useState({ title: "", status: STATUS_OPTIONS[0].value, content: "" });
  const [autosaveState, setAutosaveState] = useState({ status: "idle", lastSavedAt: null, error: null });
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const autosaveTimerRef = useRef(null);
  const lastSavedSnapshotRef = useRef(editorState);
  const isUnmountedRef = useRef(false);

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

  const isSavingRemotely = autosaveState.status === "saving" || isCreatingChapter || isUpdatingChapter;
  const isNewChapter = !chapterId;
  const shouldShowBlockingLoader =
    isWorkLoading || (isChapterFetching && !chapterData && !isNewChapter && !hasInteracted);

  const goToChaptersView = useCallback(
    (options = {}) => {
      if (!workId) return;
      const { state: extraState, ...rest } = options;
      navigate(`/dashboard/works/${workId}/edit`, {
        state: { focusTab: "chapters", ...(extraState || {}) },
        ...rest,
      });
    },
    [navigate, workId]
  );

  useEffect(() => {
    isUnmountedRef.current = false;

    return () => {
      isUnmountedRef.current = true;
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!chapterData) return;
    const nextState = {
      title: chapterData.title ?? "",
      status: STATUS_OPTIONS.some((option) => option.value === chapterData.status)
        ? chapterData.status
        : STATUS_OPTIONS[0].value,
      content: chapterData.content ?? "",
    };
    lastSavedSnapshotRef.current = nextState;
    setEditorState(nextState);
    setAutosaveState((prev) => ({
      ...prev,
      status: "idle",
      error: null,
      lastSavedAt: chapterData.updatedAt ? new Date(chapterData.updatedAt) : prev.lastSavedAt,
    }));
  }, [chapterData]);

  useEffect(() => {
    if (normalizedChapterId || chapterData) return;
    const defaultState = { title: "", status: STATUS_OPTIONS[0].value, content: "" };
    lastSavedSnapshotRef.current = defaultState;
    setEditorState(defaultState);
  }, [normalizedChapterId, chapterData]);

  const wordCount = useMemo(() => {
    return editorState.content.trim().length
      ? editorState.content
          .trim()
          .split(/\s+/)
          .filter(Boolean).length
      : 0;
  }, [editorState.content]);

  const characterCount = editorState.content.length;

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

  const autosaveDescription = useMemo(() => {
    switch (autosaveState.status) {
      case "saving":
        return "Saving changes";
      case "saved":
        return autosaveState.lastSavedAt
          ? `Saved ${formatSmart(autosaveState.lastSavedAt)}`
          : "All changes saved";
      case "error":
        return autosaveState.error || "Autosave paused";
      case "queued":
        return "Pending changes";
      default:
        return "Autosave ready";
    }
  }, [autosaveState]);

  const syncSnapshotWithState = useCallback((state) => {
    lastSavedSnapshotRef.current = {
      title: state.title,
      status: state.status,
      content: state.content,
    };
  }, []);

  useEffect(() => {
    if (!hasInteracted) return;
    if (!workId) return;
    if (!isAutosaveEnabled) return;

    const snapshot = lastSavedSnapshotRef.current;
    const hasChanges =
      editorState.title !== snapshot.title ||
      editorState.content !== snapshot.content;

    if (!hasChanges) return;

    const payloadHasSignal = editorState.title.trim().length > 0 || editorState.content.trim().length > 0;
    if (!payloadHasSignal && isNewChapter) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    setAutosaveState((prev) => ({ ...prev, status: "queued", error: null }));

    autosaveTimerRef.current = setTimeout(() => {
      runAutosave("auto");
    }, AUTOSAVE_DELAY);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorState.title, editorState.content, hasInteracted, workId, chapterId, isAutosaveEnabled]);

  const runAutosave = useCallback(
    async (source) => {
    if (!workId) return;
    const trimmedTitle = editorState.title.trim();
    const trimmedContent = editorState.content.trim();
    if (!trimmedTitle && !trimmedContent) return;

    setAutosaveState((prev) => ({ status: "saving", lastSavedAt: prev.lastSavedAt, error: null }));

      try {
        if (!chapterId) {
          const response = await createChapter({
            workId,
            payload: {
              title: trimmedTitle || "Untitled chapter",
              status: editorState.status,
              content: trimmedContent,
            },
          });

          if (!response?.id) {
            throw new Error("Chapter ID missing in response");
          }

          if (isUnmountedRef.current) return;

          setChapterId(response.id);
          syncSnapshotWithState({ ...editorState, title: trimmedTitle || "Untitled chapter", content: trimmedContent });
          setAutosaveState({ status: "saved", lastSavedAt: new Date(), error: null });
          navigate(`/dashboard/works/${workId}/chapters/${response.id}/edit`, { replace: true, state: { focusTab: "chapters" } });
          toast.success("Draft saved");
        } else {
          await updateChapter({
            workId,
            chapterId,
            payload: {
              title: trimmedTitle || "Untitled chapter",
              status: editorState.status,
              content: trimmedContent,
            },
          });
          if (isUnmountedRef.current) return;
          syncSnapshotWithState({ ...editorState, title: trimmedTitle || "Untitled chapter", content: trimmedContent });
          setAutosaveState({ status: "saved", lastSavedAt: new Date(), error: null });
        }
      } catch (error) {
        if (isUnmountedRef.current) return;
        const message = error?.message || "Unable to save";
        setAutosaveState((prev) => ({ ...prev, status: "error", error: message }));
        if (source === "manual") {
          toast.error(message);
        }
      }
    },
    [chapterId, createChapter, editorState, navigate, syncSnapshotWithState, updateChapter, workId]
  );

  const handleManualSave = async () => {
    await runAutosave("manual");
  };

  const handleFieldChange = (field, value) => {
    setHasInteracted(true);
    setEditorState((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasInteracted) return;
      if (autosaveState.status === "saving" || autosaveState.status === "queued" || autosaveState.status === "error") {
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [autosaveState.status, hasInteracted]);

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
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              className="noto-sans-arabic-bold border px-4 py-2"
              style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#FFFFFF' }}
              onClick={() => goToChaptersView()}
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة لمساحة العمل
            </Button>
            <span className="noto-sans-arabic-bold inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}>
              <Sparkles className="h-3.5 w-3.5" /> محرر الفصل المتقدم
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-3">
              <label className="text-white noto-sans-arabic-bold text-sm">
                الحفظ التلقائي
              </label>
              <button
                onClick={() => setIsAutosaveEnabled(!isAutosaveEnabled)}
                className={`cursor-pointer relative w-14 h-7 rounded-full transition-colors duration-300 ease-in-out ${
                  isAutosaveEnabled ? "bg-[#0077FF]" : "bg-[#797979]"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ease-in-out ${
                    isAutosaveEnabled ? "right-1" : "right-8"
                  }`}
                />
              </button>
            </div>
            <div
              className={`noto-sans-arabic-bold inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                autosaveState.status === "saved"
                  ? ""
                  : autosaveState.status === "saving"
                  ? ""
                  : autosaveState.status === "error"
                  ? ""
                  : ""
              }`}
              style={
                autosaveState.status === "saved"
                  ? { borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }
                  : autosaveState.status === "saving"
                  ? { borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }
                  : autosaveState.status === "error"
                  ? { borderColor: 'rgb(244 63 94)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: 'rgb(248 113 113)' }
                  : { borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#B8B8B8' }
              }
              data-testid="autosave-status"
            >
              {autosaveState.status === "saving" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : autosaveState.status === "saved" ? (
                <BadgeCheck className="h-3.5 w-3.5" />
              ) : autosaveState.status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}
              <span>{autosaveState.status === "saving" ? "جاري الحفظ" : autosaveState.status === "saved" ? (autosaveState.lastSavedAt ? `تم الحفظ ${formatSmart(autosaveState.lastSavedAt)}` : "تم حفظ جميع التغييرات") : autosaveState.status === "error" ? (autosaveState.error || "الحفظ التلقائي متوقف") : "الحفظ التلقائي جاهز"}</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              disabled={isSavingRemotely}
              className="noto-sans-arabic-bold"
            >
              <Pencil className="ml-2 h-4 w-4" />
              احفظ الآن
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl">
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

                <div className="rounded-xl border p-6" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                  <div className="flex flex-col gap-6">
                    <div className="flex w-full max-w-md flex-col gap-4">
                      <div className="space-y-2">
                        <p className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الظهور</p>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          {STATUS_OPTIONS.map((option) => {
                            const isActive = editorState.status === option.value;
                            const label = option.value === 'Draft' ? 'مسودة' : option.value === 'Published' ? 'منشور' : option.label;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleFieldChange("status", option.value)}
                                className="noto-sans-arabic-bold rounded-full border px-4 py-2 text-sm transition"
                                style={isActive ? {
                                  borderColor: '#0077FF',
                                  backgroundColor: 'rgba(0, 119, 255, 0.15)',
                                  color: '#FFFFFF'
                                } : {
                                  borderColor: '#5A5A5A',
                                  backgroundColor: '#2C2C2C',
                                  color: '#B8B8B8'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.borderColor = '#797979';
                                    e.currentTarget.style.color = '#FFFFFF';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) {
                                    e.currentTarget.style.borderColor = '#5A5A5A';
                                    e.currentTarget.style.color = '#B8B8B8';
                                  }
                                }}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="rounded-xl border px-4 py-4 text-sm" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span className="noto-sans-arabic-bold text-[11px]">نظرة على الحالة</span>
                        </div>
                        <p className="noto-sans-arabic-medium mt-2 text-xs leading-relaxed" style={{ color: 'rgba(0, 119, 255, 0.9)' }}>
                          {editorState.status === "Published" 
                            ? "القراء يمكنهم رؤية هذا الفصل بمجرد اكتمال المزامنة."
                            : "فقط أنت يمكنك رؤية هذا الفصل حتى تقوم بنشره."}
                        </p>
                      </div>
                    </div>

                    <dl className="grid w-full gap-3 sm:grid-cols-2" data-testid="chapter-metrics">
                      <div
                        className="rounded-xl border px-5 py-5"
                        style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)' }}
                        data-testid="chapter-metric-word-count"
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <dt className="noto-sans-arabic-bold flex items-center gap-2 whitespace-nowrap text-[11px]" style={{ color: '#0077FF' }}>
                            <BookOpen className="h-4 w-4" /> عدد الكلمات
                          </dt>
                          <dd className="noto-sans-arabic-extrabold whitespace-nowrap text-3xl text-white">{wordCount.toLocaleString()}</dd>
                        </div>
                      </div>
                      <div
                        className="rounded-xl border px-5 py-5"
                        style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}
                        data-testid="chapter-metric-characters"
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <dt className="noto-sans-arabic-bold flex items-center gap-2 whitespace-nowrap text-[11px]" style={{ color: '#B8B8B8' }}>
                            <Type className="h-4 w-4" /> الأحرف
                          </dt>
                          <dd className="noto-sans-arabic-extrabold whitespace-nowrap text-3xl text-white">{characterCount.toLocaleString()}</dd>
                        </div>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="noto-sans-arabic-medium flex items-center justify-between text-xs" style={{ color: '#797979' }}>
                    <span>مخطوطة الفصل</span>
                    <span>
                      {characterCount}/{MAX_CONTENT_LENGTH} حرف
                    </span>
                  </div>
                  <textarea
                    id="chapter-content"
                    rows={24}
                    value={editorState.content}
                    onChange={(event) => {
                      if (event.target.value.length <= MAX_CONTENT_LENGTH) {
                        handleFieldChange("content", event.target.value);
                      }
                    }}
                    placeholder="اكتب الفصل كاملاً هنا. اختصارات الماركداون، المعاينة المباشرة، والتعليقات المضمنة ستأتي لاحقاً هذا العام."
                    className="noto-sans-arabic-medium h-[36rem] w-full rounded-xl border px-6 py-5 text-base leading-relaxed text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 transition"
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

                <div className="noto-sans-arabic-medium flex flex-col gap-3 rounded-xl border p-6 text-sm md:flex-row md:items-center md:justify-between" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
                  <div className="flex items-center gap-3 text-white">
                    {autosaveState.status === "saved" ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: '#0077FF' }} />
                    ) : autosaveState.status === "error" ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <PenSquare className="h-5 w-5" style={{ color: '#0077FF' }} />
                    )}
                    <span>
                      {autosaveState.status === "saved"
                        ? "تمت مزامنة المسودة. يمكنك إغلاق التبويب بثقة."
                        : autosaveState.status === "error"
                        ? "الحفظ التلقائي متوقف. احفظ يدوياً أو أعد المحاولة بعد لحظات."
                        : "تتم كتابتك بالحفظ التلقائي كل ثانيتين أثناء الكتابة."}
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
    </div>
    </>
  );
};

export default ChapterEditorPage;
