import { useEffect, useMemo, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  Clock3,
  Filter,
  FileText,
  Image as ImageIcon,
  Loader2,
  MoreVertical,
  PenSquare,
  Search,
  Sparkles,
  UploadCloud,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import Button from "../../components/ui/button";
import Select from "../../components/ui/select";
import ChapterDeleteModal from "../../components/work/ChapterDeleteModal";
import mainPicture from "../../assets/mainPicture.jpg";
import { formatSmart } from "../../utils/date";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";
import { useGetWorkById } from "../../hooks/work/useGetWorkById";
import { useGetWorkChapters } from "../../hooks/work/useGetWorkChapters";
import { useReorderWorkChapters } from "../../hooks/work/useReorderWorkChapters";
import { useUpdateWork } from "../../hooks/work/useUpdateWork";
import { useUpdateWorkCover } from "../../hooks/work/useUpdateWorkCover";
import { useDeleteChapter } from "../../hooks/work/useDeleteChapter";

const STATUS_OPTIONS = [
  { value: "Ongoing", label: "Ongoing" },
  { value: "Completed", label: "Completed" },
];

const STATUS_FILTERS = [
  { id: "all", label: "All statuses" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Draft" },
];

const SORT_OPTIONS = [
  { id: "sequence", label: "Story order" },
  { id: "recent", label: "Recently updated" },
];

const LAUNCH_CHECKLIST = [
  {
    label: "Title and summary polished",
    isComplete: (state) => Boolean(state.title.trim() && state.summary.trim()),
  },
  {
    label: "Primary genres locked",
    isComplete: (state) => state.genreIds.length > 0,
  },
  {
    label: "Cover matches tone",
    isComplete: (state, coverStatus) => Boolean(coverStatus.hasCover),
  },
  {
    label: "Chapter order intentional",
    isComplete: (_, __, chapters) => chapters.length > 0,
  },
];

const TAB_OPTIONS = [
  {
    id: "story",
    label: "Story studio",
  },
  {
    id: "chapters",
    label: "Chapters & pacing",
  },
];

const normalizeChapters = (payload) => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (payload.items && Array.isArray(payload.items)) return payload.items;
  return [];
};

const getStatusTone = (status) => {
  switch ((status ?? "").toLowerCase()) {
    case "published":
      return "bg-emerald-500/15 text-emerald-200 border border-emerald-400/30";
    case "draft":
    default:
      return "bg-amber-500/15 text-amber-200 border border-amber-400/30";
  }
};

const getSafeStatus = (rawStatus) => {
  const allowed = STATUS_OPTIONS.map((option) => option.value);
  return allowed.includes(rawStatus) ? rawStatus : STATUS_OPTIONS[0].value;
};

const ChecklistItem = ({ label, complete }) => (
  <li className="flex items-start gap-3 text-sm text-zinc-300">
    <span
      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold ${
        complete
          ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300"
          : "border-zinc-700 bg-zinc-900 text-zinc-500"
      }`}
    >
      {complete ? "✓" : ""}
    </span>
    <span className="leading-relaxed text-zinc-400">{label}</span>
  </li>
);

const MENU_WIDTH = 192;
const MENU_HEIGHT = 112;
const VIEWPORT_MARGIN = 12;

const EditWorkPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workId } = useParams();

  const {
    data: work,
    isPending: isWorkLoading,
    isError,
    refetch: refetchWork,
  } = useGetWorkById(workId);
  const { data: genres = [] } = useGetGenresList();
  const { mutateAsync: updateWork, isPending: isSavingDetails } = useUpdateWork();
  const { mutateAsync: updateCover, isPending: isSavingCover } = useUpdateWorkCover();
  const {
    data: rawChapters,
    isPending: isChaptersLoading,
    refetch: refetchChapters,
  } = useGetWorkChapters(workId, { enabled: Boolean(workId) });
  const { mutateAsync: reorderChapters, isPending: isSavingChapters } = useReorderWorkChapters();
  const { mutateAsync: deleteChapter, isPending: isDeletingChapter } = useDeleteChapter();

  const [detailsState, setDetailsState] = useState({
    title: "",
    summary: "",
    status: STATUS_OPTIONS[0].value,
    genreIds: [],
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [chapterOrder, setChapterOrder] = useState([]);
  const getInitialTab = () => {
    if (location.state?.focusTab && TAB_OPTIONS.some((tab) => tab.id === location.state.focusTab)) {
      return location.state.focusTab;
    }
    if (typeof window !== "undefined") {
      const stored = window.sessionStorage.getItem("work-editor-active-tab");
      if (stored && TAB_OPTIONS.some((tab) => tab.id === stored)) {
        return stored;
      }
    }
    return "story";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [chapterFilter, setChapterFilter] = useState("all");
  const [chapterSearch, setChapterSearch] = useState("");
  const [chapterSort, setChapterSort] = useState("sequence");
  const [openChapterMenuId, setOpenChapterMenuId] = useState(null);
  const [chapterMenuPosition, setChapterMenuPosition] = useState(null);
  const [pendingChapterDelete, setPendingChapterDelete] = useState(null);
  useEffect(() => {
    if (!location.state?.focusTab) return;
    if (!TAB_OPTIONS.some((tab) => tab.id === location.state.focusTab)) return;
    setActiveTab(location.state.focusTab);
  }, [location.state?.focusTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem("work-editor-active-tab", activeTab);
  }, [activeTab]);


  useEffect(() => {
    if (!work) return;
    const mappedGenres = work.genresList ?? [];

    setDetailsState({
      title: work.title ?? "",
      summary: work.summary ?? "",
      status: getSafeStatus(work.status),
      genreIds: mappedGenres.map((genre) => genre.id),
    });
    setSelectedGenres(mappedGenres);
  }, [work]);

  useEffect(() => {
    if (!rawChapters) return;
    setChapterOrder(normalizeChapters(rawChapters));
  }, [rawChapters]);

  const coverPreview = useMemo(() => {
    if (coverFile) return URL.createObjectURL(coverFile);
    if (work?.coverImageUrl) return work.coverImageUrl;
    return null;
  }, [coverFile, work]);

  useEffect(() => () => {
    if (coverFile) URL.revokeObjectURL(coverPreview);
  }, [coverFile, coverPreview]);

  const handleGenreSelect = (event) => {
    const genreId = Number(event.target.value);
    if (!genreId) return;
    const genre = genres.find((item) => item.id === genreId);
    if (!genre || detailsState.genreIds.includes(genreId)) return;

    setDetailsState((prev) => ({
      ...prev,
      genreIds: [...prev.genreIds, genreId],
    }));
    setSelectedGenres((prev) => [...prev, genre]);
    event.target.value = "";
  };

  const removeGenre = (genreId) => {
    setDetailsState((prev) => ({
      ...prev,
      genreIds: prev.genreIds.filter((id) => id !== genreId),
    }));
    setSelectedGenres((prev) => prev.filter((genre) => genre.id !== genreId));
  };

  const handleDetailsSubmit = async (event) => {
    event.preventDefault();
    if (!workId) return;

    if (!detailsState.title.trim()) {
      toast.error("Add a clear, energetic title.");
      return;
    }
    if (!detailsState.summary.trim()) {
      toast.error("Describe the arc before saving.");
      return;
    }
    if (detailsState.genreIds.length === 0) {
      toast.error("Select at least one genre.");
      return;
    }

    try {
      await updateWork({
        workId,
        payload: {
          title: detailsState.title.trim(),
          summary: detailsState.summary.trim(),
          status: detailsState.status,
          genreIds: detailsState.genreIds,
        },
      });
      toast.success("Story details updated");
      refetchWork();
    } catch (error) {
      toast.error(error?.message || "Unable to save details");
    }
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Upload an image (PNG, JPG, GIF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }
    setCoverFile(file);
  };

  const handleCoverSubmit = async (event) => {
    event.preventDefault();
    if (!workId || !coverFile) {
      toast.error("Select a cover image before saving");
      return;
    }

    try {
      await updateCover({ workId, coverFile });
      toast.success("Cover refreshed");
      setCoverFile(null);
      refetchWork();
    } catch (error) {
      toast.error(error?.message || "Unable to update cover");
    }
  };

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === "dragenter" || event.type === "dragover") {
      setDragActive(true);
    } else if (event.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) handleCoverChange(file);
  };

  useEffect(() => {
    if (!openChapterMenuId) return;

    const handleDocumentClick = (event) => {
      const target = event.target;
      if (target?.closest?.("[data-chapter-menu-root]")) return;
      if (target?.closest?.("[data-chapter-menu]")) return;
      setOpenChapterMenuId(null);
      setChapterMenuPosition(null);
    };

    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [openChapterMenuId]);

  const moveChapter = (index, direction) => {
    setChapterOrder((prev) => {
      const updated = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= updated.length) return prev;
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const handleChapterOrderSave = async () => {
    if (!workId || chapterOrder.length === 0) return;
    try {
      await reorderChapters({
        workId,
        orderedChapterIds: chapterOrder.map((chapter) => chapter.id),
      });
      toast.success("Chapter order updated");
      refetchChapters();
    } catch (error) {
      toast.error(error?.message || "Unable to reorder chapters");
    }
  };

  const closeChapterMenu = useCallback(() => {
    setOpenChapterMenuId(null);
    setChapterMenuPosition(null);
  }, []);

  const openChapterDeleteModal = useCallback((chapter) => {
    if (!chapter) return;
    setPendingChapterDelete(chapter);
  }, []);

  const resolveChapterKey = useCallback((chapter, index) => {
    if (!chapter) return `sequence-${index}`;
    return chapter.id || `sequence-${index}`;
  }, []);

  const handleChapterMenuToggle = useCallback(
    (event, chapter, fallbackIndex) => {
      event.stopPropagation();
      const key = resolveChapterKey(chapter, fallbackIndex);
      if (!key) return;

      if (openChapterMenuId === key) {
        closeChapterMenu();
        return;
      }

      if (typeof window === "undefined") {
        setOpenChapterMenuId((current) => (current === key ? null : key));
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      
      // Position the menu directly below the trigger, aligned to the right edge
      // Using viewport coordinates since the menu is fixed position
      const left = rect.right - MENU_WIDTH;
      const top = rect.bottom + 4;

      setChapterMenuPosition({ top, left });
      setOpenChapterMenuId(key);
    },
    [closeChapterMenu, openChapterMenuId, resolveChapterKey]
  );

  useEffect(() => {
    if (!openChapterMenuId) return;

    const handleViewportChange = () => {
      closeChapterMenu();
    };

    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [closeChapterMenu, openChapterMenuId]);

  const handleChapterDelete = useCallback(async () => {
    if (!workId || !pendingChapterDelete?.id) {
      setPendingChapterDelete(null);
      return;
    }

    try {
      await deleteChapter({ workId, chapterId: pendingChapterDelete.id });
      setChapterOrder((prev) => prev.filter((item) => item.id !== pendingChapterDelete.id));
      toast.success("Chapter deleted");
      setPendingChapterDelete(null);
      refetchChapters();
    } catch (error) {
      toast.error(error?.message || "Unable to delete chapter");
    }
  }, [deleteChapter, pendingChapterDelete, refetchChapters, workId]);

  const publishedChapterCount = useMemo(
    () => chapterOrder.filter((chapter) => (chapter.status ?? "").toLowerCase() === "published").length,
    [chapterOrder]
  );
  const draftChapterCount = Math.max(chapterOrder.length - publishedChapterCount, 0);

  const visibleChapters = useMemo(() => {
    const term = chapterSearch.trim().toLowerCase();
    let entries = chapterOrder.map((chapter, index) => ({ chapter, orderIndex: index }));

    if (chapterFilter !== "all") {
      entries = entries.filter(({ chapter }) => (chapter.status ?? "").toLowerCase() === chapterFilter);
    }

    if (term) {
      entries = entries.filter(({ chapter }) => {
        const fields = [chapter.title, chapter.synopsis, chapter.content];
        return fields.some((field) => field?.toLowerCase().includes(term));
      });
    }

    if (chapterSort === "recent") {
      entries = [...entries].sort((a, b) => {
        const toTime = (entry) => new Date(entry.chapter.updatedAt || entry.chapter.createdAt || 0).getTime();
        return toTime(b) - toTime(a);
      });
    }

    if (chapterSort === "alpha") {
      entries = [...entries].sort((a, b) => {
        const titleA = (a.chapter.title || "").toLowerCase();
        const titleB = (b.chapter.title || "").toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    if (chapterSort === "status") {
      const statusWeight = (status) => {
        const normalized = (status || "").toLowerCase();
        if (normalized === "published") return 1;
        if (normalized === "draft") return 2;
        return 3;
      };

      entries = [...entries].sort((a, b) => {
        const statusDiff = statusWeight(a.chapter.status) - statusWeight(b.chapter.status);
        if (statusDiff !== 0) return statusDiff;
        return (a.chapter.title || "").localeCompare(b.chapter.title || "");
      });
    }

    return entries;
  }, [chapterOrder, chapterFilter, chapterSearch, chapterSort]);

  const isReorderEnabled = chapterSort === "sequence" && chapterFilter === "all" && !chapterSearch.trim();
  const publicationProgress = useMemo(() => {
    if (chapterOrder.length === 0) return 0;
    return Math.round((publishedChapterCount / chapterOrder.length) * 100);
  }, [chapterOrder.length, publishedChapterCount]);

  const activeChapterForMenu = useMemo(() => {
    if (!openChapterMenuId) return null;
    const entryIndex = chapterOrder.findIndex(
      (chapter, index) => resolveChapterKey(chapter, index) === openChapterMenuId
    );
    if (entryIndex === -1) return null;
    const chapter = chapterOrder[entryIndex];
    return {
      chapter,
      key: resolveChapterKey(chapter, entryIndex),
    };
  }, [chapterOrder, openChapterMenuId, resolveChapterKey]);

  const hasChapterFiltersApplied =
    chapterFilter !== "all" || chapterSort !== "sequence" || Boolean(chapterSearch.trim());

  const openAdvancedComposer = useCallback(
    (targetChapterId = null) => {
      if (!workId) return;
      if (targetChapterId) {
        console.info("openAdvancedComposer:edit", targetChapterId);
        navigate(`/dashboard/works/${workId}/chapters/${targetChapterId}/edit`);
        return;
      }
      console.info("openAdvancedComposer:new");
      navigate(`/dashboard/works/${workId}/chapters/new`);
    },
    [navigate, workId]
  );

  const isLoading = isWorkLoading;
  const coverSource = coverPreview || work?.coverImageUrl || mainPicture;

  if (isError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-zinc-100">We couldn&apos;t find that work</h1>
          <p className="text-sm text-zinc-400">Check the link or return to your works dashboard.</p>
          <Button onClick={() => navigate("/dashboard/works")}>Back to dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950/40 px-4 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-[32px] border border-zinc-800/70 bg-zinc-900/80 px-8 py-10 shadow-[0_40px_110px_-90px_rgba(59,130,246,0.7)]">
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <button
              type="button"
              onClick={() => navigate("/dashboard/works")}
              className="flex items-center gap-2 rounded-full border border-zinc-700/60 bg-zinc-900/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 transition hover:border-zinc-600 hover:text-zinc-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-blue-200">
              <Sparkles className="h-3 w-3" />
              Editing workspace
            </span>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight text-zinc-50">
                {detailsState.title || "Untitled work"}
              </h1>
              <p className="max-w-2xl text-base text-zinc-300">
                Refine story foundations, update your cover, and orchestrate chapter pacing in one focused surface. Changes sync instantly across the reader experience.
              </p>
            </div>

            <div className="flex gap-4 text-sm text-zinc-400">
              <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 px-5 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Status</p>
                <p className="text-sm font-medium text-zinc-100">{detailsState.status}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 px-5 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Genres</p>
                <p className="text-sm font-medium text-zinc-100">
                  {selectedGenres.length > 0 ? selectedGenres.map((genre) => genre.name).join(", ") : "Not set"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-[28px] border border-zinc-800/70 bg-zinc-900/70">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
          </div>
        ) : (
          <section className="rounded-[32px] border border-zinc-800/70 bg-zinc-900/70 px-8 py-9 shadow-[0_40px_110px_-90px_rgba(59,130,246,0.4)]">
            <div className="flex flex-wrap items-center gap-3">
              {TAB_OPTIONS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 rounded-full border px-5 py-2 text-sm font-medium tracking-wide transition ${
                      isActive
                        ? "border-blue-500/60 bg-blue-500/20 text-blue-100 shadow-[0_12px_30px_-18px_rgba(59,130,246,0.8)]"
                        : "border-zinc-700/70 bg-zinc-950/70 text-zinc-400 hover:border-zinc-600/80 hover:text-zinc-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-10 space-y-10">
              {activeTab === "story" ? (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <form onSubmit={handleDetailsSubmit} className="space-y-6 rounded-[28px] border border-zinc-800/70 bg-zinc-950/60 px-8 py-9 backdrop-blur">
                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-zinc-100">Story details</h2>
                      <p className="text-sm text-zinc-400">
                        Keep title, summary, and status aligned before you share chapters with beta readers.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Title</span>
                        <input
                          type="text"
                          value={detailsState.title}
                          onChange={(event) =>
                            setDetailsState((prev) => ({ ...prev, title: event.target.value }))
                          }
                          className="w-full rounded-2xl border border-zinc-800/70 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          placeholder="Title of your novel"
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Summary</span>
                        <textarea
                          value={detailsState.summary}
                          onChange={(event) =>
                            setDetailsState((prev) => ({ ...prev, summary: event.target.value }))
                          }
                          rows={6}
                          className="w-full resize-none rounded-2xl border border-zinc-800/70 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          placeholder="Describe your core hook, protagonists, and stakes."
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Status</span>
                          <Select
                            value={detailsState.status}
                            onChange={(event) =>
                              setDetailsState((prev) => ({ ...prev, status: event.target.value }))
                            }
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        </label>

                        <label className="block space-y-2">
                          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Add genre</span>
                          <Select value="" onChange={handleGenreSelect} placeholder="Select genre">
                            {genres.map((genre) => (
                              <option key={genre.id} value={genre.id}>
                                {genre.name}
                              </option>
                            ))}
                          </Select>
                        </label>
                      </div>

                      {selectedGenres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedGenres.map((genre) => (
                            <span
                              key={genre.id}
                              className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs text-blue-200"
                            >
                              {genre.name}
                              <button
                                type="button"
                                onClick={() => removeGenre(genre.id)}
                                className="rounded-full border border-blue-400/40 p-1 text-blue-200 transition hover:bg-blue-500/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500">Select at least one genre to align recommendations.</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button type="submit" isLoading={isSavingDetails}>
                        Save story details
                      </Button>
                      <span className="text-xs text-zinc-500">Changes sync instantly to your reader profile.</span>
                    </div>
                  </form>

                  <div className="space-y-6 rounded-[28px] border border-zinc-800/70 bg-zinc-950/60 px-8 py-9 backdrop-blur">
                    <section className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-zinc-100">Cover art</h2>
                        <p className="text-sm text-zinc-400">Upload key art that matches your story&apos;s tone.</p>
                      </div>

                      <form onSubmit={handleCoverSubmit} className="space-y-4">
                        <div
                          className={`relative flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-zinc-700/70 bg-zinc-950/60 px-6 py-10 text-center transition ${
                            dragActive ? "border-blue-500/60 bg-blue-500/10 text-blue-100" : "text-zinc-400"
                          }`}
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                        >
                          <UploadCloud className="h-10 w-10" />
                          <div className="space-y-2">
                            <p className="font-medium text-zinc-100">Drag imagery here or click to upload</p>
                            <p className="text-xs text-zinc-500 text-pretty">PNG / JPG / GIF · 1600px min · Max 10MB</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>

                        <div className="grid gap-4 text-left lg:grid-cols-2">
                          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">Live cover</p>
                            <div className="mt-3 h-48 overflow-hidden rounded-2xl border border-zinc-800/70">
                              <img src={coverSource} alt={detailsState.title} className="h-full w-full object-cover" />
                            </div>
                          </div>
                          {coverFile ? (
                            <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4">
                              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-200">New upload</p>
                              <div className="mt-3 h-48 overflow-hidden rounded-2xl border border-blue-500/30">
                                <img src={coverPreview} alt="New cover preview" className="h-full w-full object-cover" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setCoverFile(null)}
                                className="mt-3 text-xs text-blue-200/80 underline-offset-4 transition hover:text-blue-100 hover:underline"
                              >
                                Clear selection
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 p-4 text-sm text-zinc-400">
                              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
                                <ImageIcon className="h-4 w-4" /> Preview placeholder
                              </p>
                              <p className="mt-2 text-xs text-pretty">
                                Upload a cinematic cover to see a live preview alongside the current artwork.
                              </p>
                            </div>
                          )}
                        </div>

                        <Button type="submit" isLoading={isSavingCover} disabled={!coverFile}>
                          Save cover update
                        </Button>
                      </form>
                    </section>

                    <section className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/5 px-8 py-9">
                      <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-emerald-200">Launch checklist</h2>
                        <ul className="space-y-3">
                          {LAUNCH_CHECKLIST.map((item) => (
                            <ChecklistItem
                              key={item.label}
                              label={item.label}
                              complete={item.isComplete(
                                detailsState,
                                { hasCover: Boolean(work?.coverImageUrl) || Boolean(coverFile) },
                                chapterOrder
                              )}
                            />
                          ))}
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <section className="flex flex-col gap-8 rounded-[28px] border border-zinc-800/70 bg-zinc-950/60 px-8 py-9 backdrop-blur">
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <h2 className="text-lg font-semibold text-zinc-100">Chapter pacing</h2>
                        <p className="text-sm text-zinc-400">
                          Scan every chapter in sequence. Filter, search, and reorder without any extra columns in the way.
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-56">
                          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <input
                            data-testid="chapter-search"
                            type="search"
                            value={chapterSearch}
                            onChange={(event) => setChapterSearch(event.target.value)}
                            placeholder="Search chapters"
                            className="w-full rounded-full border border-zinc-800/70 bg-zinc-900/70 py-2 pl-10 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          />
                        </div>
                        <Button
                          data-testid="start-new-chapter"
                          variant="primary"
                          onClick={() => openAdvancedComposer()}
                          className="w-full sm:w-auto shadow-[0_12px_30px_-12px_rgba(59,130,246,0.7)] gap-2"
                        >
                          <PenSquare className="h-4 w-4" />
                          Add Chapter
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/70 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">In library</p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-100">{chapterOrder.length}</p>
                        <p className="text-[11px] text-zinc-500">Chapters staged for your readership</p>
                      </div>
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Published</p>
                        <div className="mt-1">
                          <p className="text-2xl font-semibold text-emerald-200">{publishedChapterCount}</p>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-500/20">
                          <div
                            className="h-full rounded-full bg-emerald-400/70 transition-[width]"
                            style={{ width: `${Math.min(100, Math.max(0, publicationProgress))}%` }}
                          />
                        </div>
                      </div>
                      <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-200/80">Drafting</p>
                        <p className="mt-1 text-2xl font-semibold text-amber-200">{draftChapterCount}</p>
                        <p className="text-[11px] text-amber-200/80">Waiting for their publishing glow-up</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {STATUS_FILTERS.map((option) => {
                          const isActive = chapterFilter === option.id;
                          return (
                            <button
                              key={option.id}
                              type="button"
                              data-testid={`chapter-filter-${option.id}`}
                              onClick={() => setChapterFilter(option.id)}
                              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                                isActive
                                  ? "border-blue-500/60 bg-blue-500/15 text-blue-100 shadow-[0_10px_30px_-18px_rgba(59,130,246,0.8)]"
                                  : "border-zinc-800/70 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700/60 hover:text-zinc-100"
                              }`}
                            >
                              {option.id === "published" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : option.id === "draft" ? (
                                <PenSquare className="h-3.5 w-3.5" />
                              ) : (
                                <Filter className="h-3.5 w-3.5" />
                              )}
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 p-1">
                          {SORT_OPTIONS.map((option) => {
                            const isActive = chapterSort === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                data-testid={`chapter-sort-${option.id}`}
                                onClick={() => setChapterSort(option.id)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                                  isActive
                                    ? "bg-blue-500/20 text-blue-100 shadow-[0_8px_24px_-16px_rgba(59,130,246,0.6)]"
                                    : "text-zinc-400 hover:text-zinc-100"
                                }`}
                              >
                                {option.label}
                              </button>
                            );
                          })}
                        </div>
                        {hasChapterFiltersApplied ? (
                          <button
                            type="button"
                            onClick={() => {
                              setChapterFilter("all");
                              setChapterSort("sequence");
                              setChapterSearch("");
                            }}
                            className="text-xs font-medium text-zinc-400 transition hover:text-zinc-100"
                          >
                            Reset view
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      {isChaptersLoading ? (
                        <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800/70 bg-zinc-950/60">
                          <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                        </div>
                      ) : chapterOrder.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-800/60 bg-zinc-950/60 p-8 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-800/60 bg-zinc-900/80 text-zinc-500">
                            <FileText className="h-5 w-5" />
                          </div>
                          <h3 className="mt-4 text-base font-medium text-zinc-100">No chapters yet</h3>
                          <p className="mt-2 text-sm text-zinc-400">
                            Draft your opening scene to populate this list. You can always rearrange the beats later.
                          </p>
                          <Button className="mt-5" onClick={() => openAdvancedComposer()} variant="primary">
                            <PenSquare className="mr-2 h-4 w-4" />
                            Draft the first chapter
                          </Button>
                        </div>
                      ) : visibleChapters.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-800/70 bg-zinc-950/60 p-8 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-200">
                            <Filter className="h-5 w-5" />
                          </div>
                          <h3 className="mt-4 text-base font-medium text-zinc-100">No chapters match your filters</h3>
                          <p className="mt-2 text-sm text-zinc-400">
                            Try adjusting the status filter, resetting the sort, or clearing the search query to reveal more chapters.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setChapterFilter("all");
                              setChapterSort("sequence");
                              setChapterSearch("");
                            }}
                            className="mt-4 text-sm font-medium text-blue-300 transition hover:text-blue-100"
                          >
                            Clear filters
                          </button>
                        </div>
                      ) : (
                        <>
                          <ul className="chapter-scroll max-h-[28rem] space-y-3 overflow-y-auto pr-2">
                            {visibleChapters.map(({ chapter, orderIndex }) => {
                              const chapterKey = resolveChapterKey(chapter, orderIndex);
                              const timelineLabel = chapter.updatedAt || chapter.createdAt;
                              const previewText =
                                chapter.synopsis?.trim()?.slice(0, 140) ||
                                chapter.content?.trim()?.slice(0, 140) ||
                                "No summary yet. Open to add context.";
                              const sequenceNumber = orderIndex + 1;
                              return (
                                <li key={chapterKey}>
                                  <div
                                    data-testid={`chapter-card-${chapterKey}-container`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => openAdvancedComposer(chapter.id)}
                                    onKeyDown={(event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault();
                                        openAdvancedComposer(chapter.id);
                                      }
                                    }}
                                    className="group flex flex-col gap-4 rounded-2xl border border-zinc-800/70 bg-zinc-950/70 px-4 py-4 transition hover:border-zinc-700/70 hover:bg-zinc-900/70"
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <span className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl border border-zinc-700 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                                          {String(sequenceNumber).padStart(2, "0")}
                                        </span>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-zinc-100">
                                              {chapter.title || `Untitled chapter ${sequenceNumber}`}
                                            </p>
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] ${getStatusTone(chapter.status)}`}>
                                              {chapter.status || "Draft"}
                                            </span>
                                          </div>
                                          <p className="text-xs text-zinc-400 line-clamp-2">{previewText}</p>
                                        </div>
                                      </div>
                                      <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                                        <div className="flex items-center gap-1">
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              moveChapter(orderIndex, -1);
                                            }}
                                            disabled={!isReorderEnabled || orderIndex === 0}
                                            aria-label="Move chapter up"
                                            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 disabled:text-zinc-600"
                                          >
                                            <ArrowUp className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            onClick={(event) => {
                                              event.stopPropagation();
                                              moveChapter(orderIndex, 1);
                                            }}
                                            disabled={!isReorderEnabled || orderIndex === chapterOrder.length - 1}
                                            aria-label="Move chapter down"
                                            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 disabled:text-zinc-600"
                                          >
                                            <ArrowDown className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="relative" data-chapter-menu-root>
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            aria-haspopup="menu"
                                            aria-label="Open chapter actions"
                                            aria-expanded={openChapterMenuId === chapterKey}
                                            data-testid={`chapter-card-${chapterKey}-menu-trigger`}
                                            onClick={(event) => handleChapterMenuToggle(event, chapter, orderIndex)}
                                            className="rounded-full border border-zinc-700/60 bg-zinc-900/70 px-2"
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                                      <span className="flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {timelineLabel ? formatSmart(timelineLabel) : "No timestamp"}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full border border-zinc-800/70 px-2 py-0.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                                          Seq. {sequenceNumber}
                                        </span>
                                        {chapter.wordCount ? (
                                          <span>{chapter.wordCount.toLocaleString()} words</span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-5 flex flex-col gap-3 border-t border-zinc-800/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-zinc-500">
                              {isReorderEnabled
                                ? "Use the arrow controls to dial in pacing. Save to push the new order live."
                                : "Reordering is disabled while filters or alternate sorting are active."}
                            </p>
                            <Button
                              onClick={handleChapterOrderSave}
                              isLoading={isSavingChapters}
                              disabled={!isReorderEnabled || chapterOrder.length === 0}
                              className="sm:w-auto"
                            >
                              Save chapter order
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>
              )}
            </div>
          </section>
        )}
      </div>
      {openChapterMenuId && chapterMenuPosition && activeChapterForMenu ? (
        <div
          role="menu"
          data-chapter-menu
          className="fixed z-[70] w-48 overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-950/95 shadow-[0_22px_60px_-28px_rgba(59,130,246,0.65)] backdrop-blur"
          style={{ top: chapterMenuPosition.top, left: chapterMenuPosition.left }}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            data-testid={`chapter-card-${activeChapterForMenu.key}-menu-edit`}
            onClick={() => {
              closeChapterMenu();
              if (activeChapterForMenu.chapter?.id) {
                openAdvancedComposer(activeChapterForMenu.chapter.id);
              }
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-zinc-200 transition hover:bg-blue-500/15 hover:text-blue-100"
          >
            <PenSquare className="h-3.5 w-3.5" />
            Edit chapter
          </button>
          <button
            type="button"
            role="menuitem"
            data-testid={`chapter-card-${activeChapterForMenu.key}-menu-delete`}
            onClick={() => {
              closeChapterMenu();
              if (activeChapterForMenu.chapter) {
                openChapterDeleteModal(activeChapterForMenu.chapter);
              }
            }}
            className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-rose-200 transition hover:bg-rose-500/15 hover:text-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete chapter
          </button>
        </div>
      ) : null}
      <Modal isOpen={Boolean(pendingChapterDelete)} onClose={() => setPendingChapterDelete(null)}>
        <div className="space-y-6 text-zinc-100">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/10 text-rose-200">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Delete {pendingChapterDelete?.title || "this chapter"}?</h3>
              <p className="text-sm text-zinc-400">
                This removes the chapter from your pacing view immediately. You can&apos;t undo this without re-creating the chapter.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 p-4 text-sm text-zinc-400">
            <p className="font-medium text-zinc-300">Heads up</p>
            <p className="mt-1">
              Deleting won&apos;t disturb published chapters, but any readers currently in drafts won&apos;t see this entry anymore.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPendingChapterDelete(null)} disabled={isDeletingChapter}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleChapterDelete}
              isLoading={isDeletingChapter}
              className="shadow-[0_14px_36px_-16px_rgba(244,63,94,0.6)]"
            >
              Delete chapter
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EditWorkPage;
