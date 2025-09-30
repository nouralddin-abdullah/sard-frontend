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

    const snapshot = lastSavedSnapshotRef.current;
    const hasChanges =
      editorState.title !== snapshot.title ||
      editorState.status !== snapshot.status ||
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
  }, [editorState, hasInteracted, workId, chapterId]);

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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-indigo-950/70 to-zinc-900 text-zinc-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="ghost"
              className="border border-zinc-700/60 bg-zinc-900/70 px-4 py-2"
              onClick={() => goToChaptersView()}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Back to workspace
            </Button>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
              <Sparkles className="h-3.5 w-3.5" /> Advanced chapter composer
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
            <div
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] ${
                autosaveState.status === "saved"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200"
                  : autosaveState.status === "saving"
                  ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                  : autosaveState.status === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-200"
                  : "border-zinc-700/70 bg-zinc-900/70 text-zinc-400"
              }`}
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
              <span>{autosaveDescription}</span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleManualSave}
              disabled={isSavingRemotely}
              className="shadow-[0_12px_32px_-14px_rgba(59,130,246,0.65)]"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Save now
            </Button>
          </div>
        </header>

        <main className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <section className="rounded-[32px] border border-zinc-800/70 bg-zinc-950/70 px-10 py-12 shadow-[0_50px_140px_-100px_rgba(59,130,246,0.65)]">
            {shouldShowBlockingLoader ? (
              <div className="flex h-[28rem] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : (
              <div className="flex flex-col gap-10">
                <div className="space-y-2">
                  <label htmlFor="chapter-title" className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                    Chapter title
                  </label>
                  <input
                    id="chapter-title"
                    value={editorState.title}
                    onChange={(event) => handleFieldChange("title", event.target.value.slice(0, 180))}
                    placeholder="E.g. Singularity at Halcyon Reef"
                    className="w-full rounded-[24px] border border-zinc-700/60 bg-zinc-950/80 px-6 py-4 text-2xl font-semibold text-zinc-50 placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="rounded-[28px] border border-zinc-800/70 bg-zinc-950/80 p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex w-full max-w-md flex-col gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Visibility</p>
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                          {STATUS_OPTIONS.map((option) => {
                            const isActive = editorState.status === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleFieldChange("status", option.value)}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                  isActive
                                    ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-200 shadow-[0_18px_50px_-32px_rgba(16,185,129,0.8)]"
                                    : "border-zinc-700/70 bg-zinc-950/70 text-zinc-400 hover:border-zinc-600/70 hover:text-zinc-200"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-4 text-sm text-blue-100/80">
                        <div className="flex items-center gap-2 text-blue-100">
                          <Eye className="h-4 w-4" />
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em]">Status insight</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-blue-100/70">{visibilityMeta.helperText}</p>
                      </div>
                    </div>

                    <dl className="grid w-full gap-3 sm:grid-cols-2" data-testid="chapter-metrics">
                      <div
                        className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-5"
                        data-testid="chapter-metric-word-count"
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <dt className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-200/80">
                            <BookOpen className="h-4 w-4" /> Word count
                          </dt>
                          <dd className="whitespace-nowrap text-3xl font-semibold text-blue-100">{wordCount.toLocaleString()}</dd>
                        </div>
                      </div>
                      <div
                        className="rounded-2xl border border-zinc-700/60 bg-zinc-900/60 px-5 py-5"
                        data-testid="chapter-metric-characters"
                      >
                        <div className="flex flex-col items-center gap-2 text-center">
                          <dt className="flex items-center gap-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-zinc-400">
                            <Type className="h-4 w-4" /> Characters
                          </dt>
                          <dd className="whitespace-nowrap text-3xl font-semibold text-zinc-100">{characterCount.toLocaleString()}</dd>
                        </div>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Chapter manuscript</span>
                    <span>
                      {characterCount}/{MAX_CONTENT_LENGTH} characters
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
                    placeholder="Craft the full chapter here. Markdown shortcuts, live preview, and inline comments land later this year."
                    className="h-[36rem] w-full rounded-[28px] border border-zinc-800/70 bg-zinc-950/80 px-6 py-5 text-base leading-relaxed text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </div>

                <div className="flex flex-col gap-3 rounded-[24px] border border-zinc-800/70 bg-zinc-950/70 p-6 text-sm text-zinc-400 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3 text-zinc-300">
                    {autosaveState.status === "saved" ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : autosaveState.status === "error" ? (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <PenSquare className="h-5 w-5 text-blue-400" />
                    )}
                    <span>
                      {autosaveState.status === "saved"
                        ? "Draft synced. You can close the tab with confidence."
                        : autosaveState.status === "error"
                        ? "Autosave is paused. Manually save or retry in a few moments."
                        : "Your writing autosaves every couple of seconds while you type."}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={!chapterId || isDeletingChapter}
                      className="flex items-center gap-2 shadow-[0_14px_36px_-16px_rgba(244,63,94,0.55)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete chapter
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </section>

          <aside className="flex flex-col gap-6">
            <section className="rounded-[32px] border border-zinc-800/70 bg-zinc-950/70 p-8">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-3xl border border-zinc-800/70">
                  <img src={coverSource} alt={work?.title || "Work cover"} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Project</p>
                  <h2 className="text-lg font-semibold text-zinc-50">{work?.title || "Untitled work"}</h2>
                  <p className="text-xs text-zinc-400">{work?.summary?.slice(0, 96) || "Shape the narrative arc and keep chapters flowing."}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm text-zinc-400">
                <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Launch signal</p>
                  <p className="mt-2 text-sm text-zinc-300">
                    {editorState.status === "Published"
                      ? "Readers see this chapter instantly. Double-check continuity and cliffhangers before shipping."
                      : "Keep polishing. Publish when the beats are tight and pacing aligns with the release cadence."}
                  </p>
                </div>
                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-blue-200/70">Craft cues</p>
                  <ul className="mt-3 space-y-2 text-sm text-blue-100/80">
                    <li>• Re-read the previous chapter to sustain emotional pacing.</li>
                    <li>• Highlight new lore drops for quick reference later.</li>
                    <li>• Flag spots needing art or soundtrack briefs.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-zinc-800/70 bg-zinc-950/70 p-8 text-sm text-zinc-400">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-zinc-500">Version timeline</h3>
              <ul className="mt-4 space-y-3">
                {autosaveState.lastSavedAt ? (
                  <li className="flex items-start gap-3">
                    <BadgeCheck className="mt-1 h-4 w-4 text-emerald-400" />
                    <span>
                      Last saved {formatSmart(autosaveState.lastSavedAt)}
                      <br />
                      Autosave keeps a rolling history on the server, so you can recover from browser crashes.
                    </span>
                  </li>
                ) : (
                  <li className="flex items-start gap-3">
                    <Sparkles className="mt-1 h-4 w-4 text-blue-300" />
                    <span>
                      Start writing to activate autosave.
                      <br />We create a draft record as soon as there's substance in the title or manuscript.
                    </span>
                  </li>
                )}
                {autosaveState.status === "error" ? (
                  <li className="flex items-start gap-3 text-red-300">
                    <AlertCircle className="mt-1 h-4 w-4" />
                    <span>Autosave couldn't reach the server. Check your connection and use “Save now”.</span>
                  </li>
                ) : null}
              </ul>

              <div className="mt-6 space-y-2 rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-4 text-xs text-zinc-500">
                <p className="font-semibold text-zinc-400">Pro tip</p>
                <p>
                  Write in focused bursts. The composer keeps everything synced in the background, and you can jump back to the pacing dashboard anytime without losing momentum.
                </p>
              </div>
            </section>
          </aside>
        </main>
      </div>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="space-y-6 text-zinc-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Delete this chapter?</h3>
              <p className="text-sm text-zinc-400">
                This action removes the chapter immediately. Readers will no longer see it in the novel flow.
              </p>
            </div>
          </div>
          <div className="space-y-2 rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-4 text-sm text-zinc-400">
            <p className="font-medium text-zinc-300">What happens next</p>
            <p>
              The autosave history will remain for restoration by our support team, but it won\'t show in your dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} disabled={isDeletingChapter}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} isLoading={isDeletingChapter}>
              Delete chapter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChapterEditorPage;
