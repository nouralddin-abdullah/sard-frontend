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
import Header from "../../components/common/Header";
import Button from "../../components/ui/button";
import Select from "../../components/ui/select";
import { Modal } from "../../components/ui/modal";
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
  <li className="noto-sans-arabic-medium flex items-start gap-3 text-sm">
    <span
      className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold"
      style={complete ? {
        borderColor: '#0077FF',
        backgroundColor: 'rgba(0, 119, 255, 0.1)',
        color: '#0077FF'
      } : {
        borderColor: '#5A5A5A',
        backgroundColor: '#2C2C2C',
        color: '#797979'
      }}
    >
      {complete ? "✓" : ""}
    </span>
    <span className="leading-relaxed" style={{ color: '#B8B8B8' }}>{label}</span>
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
      toast.error("أضف عنواناً واضحاً ومميزاً.");
      return;
    }
    if (!detailsState.summary.trim()) {
      toast.error("اكتب وصف القصة قبل الحفظ.");
      return;
    }
    if (detailsState.genreIds.length === 0) {
      toast.error("اختر نوعاً واحداً على الأقل.");
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
      toast.success("تم تحديث تفاصيل القصة");
      refetchWork();
    } catch (error) {
      toast.error(error?.message || "فشل حفظ التفاصيل");
    }
  };

  const handleCoverChange = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("ارفع صورة (PNG، JPG، GIF)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("يجب أن يكون حجم الصورة أقل من 10 ميجابايت");
      return;
    }
    setCoverFile(file);
  };

  const handleCoverSubmit = async (event) => {
    event.preventDefault();
    if (!workId || !coverFile) {
      toast.error("اختر صورة غلاف قبل الحفظ");
      return;
    }

    try {
      await updateCover({ workId, coverFile });
      toast.success("تم تحديث الغلاف");
      setCoverFile(null);
      refetchWork();
    } catch (error) {
      toast.error(error?.message || "فشل تحديث الغلاف");
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
      toast.success("تم تحديث ترتيب الفصول");
      refetchChapters();
    } catch (error) {
      toast.error(error?.message || "فشل إعادة ترتيب الفصول");
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
      <div dir="rtl" className="flex min-h-screen items-center justify-center px-4" style={{ backgroundColor: '#2C2C2C' }}>
        <div className="max-w-md space-y-4 text-center">
          <h1 className="noto-sans-arabic-extrabold text-2xl text-white">لم نتمكن من العثور على هذا العمل</h1>
          <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>تحقق من الرابط أو ارجع إلى لوحة الأعمال الخاصة بك.</p>
          <Button onClick={() => navigate("/dashboard/works")}>العودة إلى لوحة التحكم</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div dir="rtl" className="min-h-screen px-4 py-12" style={{ backgroundColor: '#2C2C2C' }}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-2xl border px-8 py-10" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
          <div className="flex items-center gap-4 text-sm">
            <button
              type="button"
              onClick={() => navigate("/dashboard/works")}
              className="noto-sans-arabic-bold flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition"
              style={{ 
                borderColor: '#5A5A5A', 
                backgroundColor: '#2C2C2C',
                color: '#B8B8B8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#0077FF';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#5A5A5A';
                e.currentTarget.style.color = '#B8B8B8';
              }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              رجوع
            </button>
            <span className="noto-sans-arabic-bold inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px]" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}>
              <Sparkles className="h-3 w-3" />
              مساحة التحرير
            </span>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h1 className="noto-sans-arabic-extrabold text-4xl leading-tight text-white">
                {detailsState.title || "عمل بدون عنوان"}
              </h1>
              <p className="noto-sans-arabic-medium max-w-2xl text-base" style={{ color: '#B8B8B8' }}>
                حسّن أساسيات القصة، حدّث الغلاف، ونظّم إيقاع الفصول في مكان واحد. التغييرات تُزامن فوراً مع تجربة القارئ.
              </p>
            </div>

            <div className="flex gap-4 text-sm">
              <div className="rounded-xl border px-5 py-3" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                <p className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الحالة</p>
                <p className="noto-sans-arabic-medium text-sm text-white">{detailsState.status === 'Ongoing' ? 'جاري' : detailsState.status === 'Completed' ? 'مكتمل' : detailsState.status}</p>
              </div>
              <div className="rounded-xl border px-5 py-3" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                <p className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الأنواع</p>
                <p className="noto-sans-arabic-medium text-sm text-white">
                  {selectedGenres.length > 0 ? selectedGenres.map((genre) => genre.name).join("، ") : "غير محدد"}
                </p>
              </div>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center rounded-xl border" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#797979' }} />
          </div>
        ) : (
          <section className="rounded-2xl border px-8 py-9" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
            <div className="flex flex-wrap items-center gap-3">
              {TAB_OPTIONS.map((tab) => {
                const isActive = activeTab === tab.id;
                const label = tab.id === 'story' ? 'استوديو القصة' : 'الفصول والإيقاع';
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className="noto-sans-arabic-bold flex items-center gap-2 rounded-full border px-5 py-2 text-sm transition"
                    style={isActive ? {
                      borderColor: '#0077FF',
                      backgroundColor: 'rgba(0, 119, 255, 0.2)',
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

            <div className="mt-10 space-y-10">
              {activeTab === "story" ? (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                  <form onSubmit={handleDetailsSubmit} className="space-y-6 rounded-xl border px-8 py-9" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                    <div className="space-y-2">
                      <h2 className="noto-sans-arabic-extrabold text-lg text-white">تفاصيل القصة</h2>
                      <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                        حافظ على العنوان والملخص والحالة متوافقة قبل مشاركة الفصول مع القراء.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block space-y-2">
                        <span className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>العنوان</span>
                        <input
                          type="text"
                          value={detailsState.title}
                          onChange={(event) =>
                            setDetailsState((prev) => ({ ...prev, title: event.target.value }))
                          }
                          className="noto-sans-arabic-medium w-full rounded-xl border px-4 py-3 text-sm text-white transition focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#5A5A5A', 
                            backgroundColor: '#5A5A5A',
                            caretColor: '#0077FF'
                          }}
                          placeholder="عنوان روايتك"
                          onFocus={(e) => e.currentTarget.style.borderColor = '#0077FF'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#5A5A5A'}
                        />
                      </label>

                      <label className="block space-y-2">
                        <span className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الملخص</span>
                        <textarea
                          value={detailsState.summary}
                          onChange={(event) =>
                            setDetailsState((prev) => ({ ...prev, summary: event.target.value }))
                          }
                          rows={6}
                          className="noto-sans-arabic-medium w-full resize-none rounded-xl border px-4 py-3 text-sm text-white transition focus:outline-none focus:ring-2"
                          style={{ 
                            borderColor: '#5A5A5A', 
                            backgroundColor: '#5A5A5A',
                            caretColor: '#0077FF'
                          }}
                          placeholder="صف الفكرة الرئيسية، الأبطال، والرهانات."
                          onFocus={(e) => e.currentTarget.style.borderColor = '#0077FF'}
                          onBlur={(e) => e.currentTarget.style.borderColor = '#5A5A5A'}
                        />
                      </label>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block space-y-2">
                          <span className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الحالة</span>
                          <Select
                            value={detailsState.status}
                            onChange={(event) =>
                              setDetailsState((prev) => ({ ...prev, status: event.target.value }))
                            }
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.value === 'Ongoing' ? 'جاري' : option.value === 'Completed' ? 'مكتمل' : option.label}
                              </option>
                            ))}
                          </Select>
                        </label>

                        <label className="block space-y-2">
                          <span className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>إضافة نوع</span>
                          <Select value="" onChange={handleGenreSelect} placeholder="اختر النوع">
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
                              className="noto-sans-arabic-medium inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                              style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}
                            >
                              {genre.name}
                              <button
                                type="button"
                                onClick={() => removeGenre(genre.id)}
                                className="rounded-full border p-1 transition"
                                style={{ borderColor: '#0077FF', color: '#0077FF' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 119, 255, 0.2)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="noto-sans-arabic-medium text-xs" style={{ color: '#797979' }}>اختر نوعاً واحداً على الأقل لمواءمة التوصيات.</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Button type="submit" isLoading={isSavingDetails}>
                        حفظ تفاصيل القصة
                      </Button>
                      <span className="noto-sans-arabic-medium text-xs" style={{ color: '#797979' }}>التغييرات تُزامن فوراً مع ملفك الشخصي.</span>
                    </div>
                  </form>

                  <div className="space-y-6 rounded-xl border px-8 py-9" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                    <section className="space-y-4">
                      <div className="space-y-1">
                        <h2 className="noto-sans-arabic-extrabold text-lg text-white">غلاف العمل</h2>
                        <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>ارفع صورة غلاف تناسب نبرة قصتك.</p>
                      </div>

                      <form onSubmit={handleCoverSubmit} className="space-y-4">
                        <div
                          className="relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed px-6 py-10 text-center transition"
                          style={dragActive ? {
                            borderColor: '#0077FF',
                            backgroundColor: 'rgba(0, 119, 255, 0.1)',
                            color: '#FFFFFF'
                          } : {
                            borderColor: '#5A5A5A',
                            backgroundColor: '#2C2C2C',
                            color: '#B8B8B8'
                          }}
                          onDragEnter={handleDrag}
                          onDragOver={handleDrag}
                          onDragLeave={handleDrag}
                          onDrop={handleDrop}
                        >
                          <UploadCloud className="h-10 w-10" />
                          <div className="space-y-2">
                            <p className="noto-sans-arabic-bold text-white">اسحب الصورة هنا أو اضغط للرفع</p>
                            <p className="noto-sans-arabic-medium text-xs" style={{ color: '#797979' }}>PNG / JPG / GIF · 1600px كحد أدنى · أقصى حجم 10 ميجابايت</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(event) => handleCoverChange(event.target.files?.[0] ?? null)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </div>

                        <div className="grid gap-4 text-right lg:grid-cols-2">
                          <div className="rounded-xl border p-4" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                            <p className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>الغلاف الحالي</p>
                            <div className="mt-3 h-48 overflow-hidden rounded-xl border" style={{ borderColor: '#5A5A5A' }}>
                              <img src={coverSource} alt={detailsState.title} className="h-full w-full object-cover" />
                            </div>
                          </div>
                          {coverFile ? (
                            <div className="rounded-xl border p-4" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)' }}>
                              <p className="noto-sans-arabic-bold text-xs" style={{ color: '#0077FF' }}>رفع جديد</p>
                              <div className="mt-3 h-48 overflow-hidden rounded-xl border" style={{ borderColor: '#0077FF' }}>
                                <img src={coverPreview} alt="New cover preview" className="h-full w-full object-cover" />
                              </div>
                              <button
                                type="button"
                                onClick={() => setCoverFile(null)}
                                className="noto-sans-arabic-medium mt-3 text-xs underline-offset-4 transition hover:underline"
                                style={{ color: '#0077FF' }}
                              >
                                إزالة الاختيار
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
                              <p className="noto-sans-arabic-bold flex items-center gap-2 text-xs" style={{ color: '#797979' }}>
                                <ImageIcon className="h-4 w-4" /> معاينة مؤقتة
                              </p>
                              <p className="noto-sans-arabic-medium mt-2 text-xs">
                                ارفع غلافاً لرؤية معاينة مباشرة بجانب الصورة الحالية.
                              </p>
                            </div>
                          )}
                        </div>

                        <Button type="submit" isLoading={isSavingCover} disabled={!coverFile}>
                          حفظ تحديث الغلاف
                        </Button>
                      </form>
                    </section>

                    <section className="rounded-xl border px-8 py-9" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.05)' }}>
                      <div className="space-y-4">
                        <h2 className="noto-sans-arabic-extrabold text-lg" style={{ color: '#0077FF' }}>قائمة الإطلاق</h2>
                        <ul className="space-y-3">
                          {LAUNCH_CHECKLIST.map((item) => {
                            const arabicLabels = {
                              'Set a catchy title': 'ضع عنواناً جذاباً',
                              'Add at least one genre': 'أضف نوعاً واحداً على الأقل',
                              'Upload a polished cover': 'ارفع غلافاً احترافياً',
                              'Write at least one chapter': 'اكتب فصلاً واحداً على الأقل'
                            };
                            return (
                              <ChecklistItem
                                key={item.label}
                                label={arabicLabels[item.label] || item.label}
                                complete={item.isComplete(
                                  detailsState,
                                  { hasCover: Boolean(work?.coverImageUrl) || Boolean(coverFile) },
                                  chapterOrder
                                )}
                              />
                            );
                          })}
                        </ul>
                      </div>
                    </section>
                  </div>
                </div>
              ) : (
                <section className="flex flex-col gap-8 rounded-xl border px-8 py-9" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <h2 className="noto-sans-arabic-extrabold text-lg text-white">إيقاع الفصول</h2>
                        <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                          تصفح كل فصل بالتسلسل. صفّ، ابحث، وأعد ترتيب الفصول بدون أي أعمدة إضافية.
                        </p>
                      </div>
                      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-56">
                          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: '#797979' }} />
                          <input
                            data-testid="chapter-search"
                            type="search"
                            value={chapterSearch}
                            onChange={(event) => setChapterSearch(event.target.value)}
                            placeholder="ابحث عن فصل"
                            className="noto-sans-arabic-medium w-full rounded-full border py-2 pr-10 pl-4 text-sm text-white transition focus:outline-none focus:ring-2"
                            style={{ 
                              borderColor: '#5A5A5A', 
                              backgroundColor: '#5A5A5A',
                              caretColor: '#0077FF'
                            }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#0077FF'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#5A5A5A'}
                          />
                        </div>
                        <Button
                          data-testid="start-new-chapter"
                          variant="primary"
                          onClick={() => openAdvancedComposer()}
                          className="noto-sans-arabic-bold w-full sm:w-auto gap-2"
                        >
                          <PenSquare className="h-4 w-4" />
                          إضافة فصل
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border px-4 py-3 text-center" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
                        <p className="noto-sans-arabic-bold text-xs" style={{ color: '#797979' }}>في المكتبة</p>
                        <p className="noto-sans-arabic-extrabold mt-1 text-2xl text-white">{chapterOrder.length}</p>
                        <p className="noto-sans-arabic-medium text-[11px]" style={{ color: '#797979' }}>فصول جاهزة للقراء</p>
                      </div>
                      <div className="rounded-xl border px-4 py-3 text-center" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)' }}>
                        <p className="noto-sans-arabic-bold text-xs" style={{ color: '#0077FF' }}>منشور</p>
                        <div className="mt-1">
                          <p className="noto-sans-arabic-extrabold text-2xl text-white">{publishedChapterCount}</p>
                        </div>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0, 119, 255, 0.2)' }}>
                          <div
                            className="h-full rounded-full transition-[width]"
                            style={{ width: `${Math.min(100, Math.max(0, publicationProgress))}%`, backgroundColor: '#0077FF' }}
                          />
                        </div>
                      </div>
                      <div className="rounded-xl border px-4 py-3 text-center" style={{ borderColor: 'rgb(251 191 36)', backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
                        <p className="noto-sans-arabic-bold text-xs text-amber-400">مسودة</p>
                        <p className="noto-sans-arabic-extrabold mt-1 text-2xl text-amber-300">{draftChapterCount}</p>
                        <p className="noto-sans-arabic-medium text-[11px] text-amber-400">في انتظار النشر</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
                      <div className="flex flex-wrap items-center gap-2">
                        {STATUS_FILTERS.map((option) => {
                          const isActive = chapterFilter === option.id;
                          const arabicLabels = {
                            'all': 'الكل',
                            'published': 'منشور',
                            'draft': 'مسودة'
                          };
                          return (
                            <button
                              key={option.id}
                              type="button"
                              data-testid={`chapter-filter-${option.id}`}
                              onClick={() => setChapterFilter(option.id)}
                              className="noto-sans-arabic-bold flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition"
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
                              {option.id === "published" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : option.id === "draft" ? (
                                <PenSquare className="h-3.5 w-3.5" />
                              ) : (
                                <Filter className="h-3.5 w-3.5" />
                              )}
                              {arabicLabels[option.id] || option.label}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-1 rounded-full border p-1" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                          {SORT_OPTIONS.map((option) => {
                            const isActive = chapterSort === option.id;
                            const arabicLabels = {
                              'sequence': 'التسلسل',
                              'recent': 'الأحدث'
                            };
                            return (
                              <button
                                key={option.id}
                                type="button"
                                data-testid={`chapter-sort-${option.id}`}
                                onClick={() => setChapterSort(option.id)}
                                className="noto-sans-arabic-bold rounded-full px-3 py-1.5 text-xs transition"
                                style={isActive ? {
                                  backgroundColor: 'rgba(0, 119, 255, 0.2)',
                                  color: '#FFFFFF'
                                } : {
                                  color: '#B8B8B8'
                                }}
                                onMouseEnter={(e) => {
                                  if (!isActive) e.currentTarget.style.color = '#FFFFFF';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isActive) e.currentTarget.style.color = '#B8B8B8';
                                }}
                              >
                                {arabicLabels[option.id] || option.label}
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
                            className="noto-sans-arabic-bold text-xs transition"
                            style={{ color: '#B8B8B8' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#B8B8B8'}
                          >
                            إعادة تعيين
                          </button>
                        ) : null}
                      </div>
                    </div>

                    <div>
                      {isChaptersLoading ? (
                        <div className="flex h-48 items-center justify-center rounded-xl border" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}>
                          <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#797979' }} />
                        </div>
                      ) : chapterOrder.length === 0 ? (
                        <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C', color: '#797979' }}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <h3 className="noto-sans-arabic-extrabold mt-4 text-base text-white">لا توجد فصول بعد</h3>
                          <p className="noto-sans-arabic-medium mt-2 text-sm" style={{ color: '#B8B8B8' }}>
                            ابدأ بكتابة المشهد الافتتاحي لملء هذه القائمة. يمكنك دائماً إعادة ترتيب الأحداث لاحقاً.
                          </p>
                          <Button className="noto-sans-arabic-bold mt-5 gap-2" onClick={() => openAdvancedComposer()} variant="primary">
                            <PenSquare className="h-4 w-4" />
                            اكتب الفصل الأول
                          </Button>
                        </div>
                      ) : visibleChapters.length === 0 ? (
                        <div className="rounded-xl border p-8 text-center" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}>
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border" style={{ borderColor: '#0077FF', backgroundColor: 'rgba(0, 119, 255, 0.1)', color: '#0077FF' }}>
                            <Filter className="h-5 w-5" />
                          </div>
                          <h3 className="noto-sans-arabic-extrabold mt-4 text-base text-white">لا توجد فصول تطابق الفلاتر</h3>
                          <p className="noto-sans-arabic-medium mt-2 text-sm" style={{ color: '#B8B8B8' }}>
                            حاول تعديل فلتر الحالة، أو إعادة تعيين الترتيب، أو مسح البحث لإظهار المزيد من الفصول.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setChapterFilter("all");
                              setChapterSort("sequence");
                              setChapterSearch("");
                            }}
                            className="noto-sans-arabic-bold mt-4 text-sm transition"
                            style={{ color: '#0077FF' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#0066DD'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#0077FF'}
                          >
                            مسح الفلاتر
                          </button>
                        </div>
                      ) : (
                        <>
                          <ul className="chapter-scroll max-h-[28rem] space-y-3 overflow-y-auto pl-2">
                            {visibleChapters.map(({ chapter, orderIndex }) => {
                              const chapterKey = resolveChapterKey(chapter, orderIndex);
                              const timelineLabel = chapter.updatedAt || chapter.createdAt;
                              const previewText =
                                chapter.synopsis?.trim()?.slice(0, 140) ||
                                chapter.content?.trim()?.slice(0, 140) ||
                                "لا يوجد ملخص بعد. افتح الفصل لإضافة سياق.";
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
                                    className="group flex flex-col gap-4 rounded-xl border px-4 py-4 transition cursor-pointer"
                                    style={{ borderColor: '#5A5A5A', backgroundColor: '#3C3C3C' }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.borderColor = '#0077FF';
                                      e.currentTarget.style.backgroundColor = '#2C2C2C';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.borderColor = '#5A5A5A';
                                      e.currentTarget.style.backgroundColor = '#3C3C3C';
                                    }}
                                  >
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-3">
                                        <span className="noto-sans-arabic-bold mt-1 flex h-8 w-8 items-center justify-center rounded-xl border text-xs" style={{ borderColor: '#5A5A5A', color: '#797979' }}>
                                          {String(sequenceNumber).padStart(2, "0")}
                                        </span>
                                        <div className="space-y-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <p className="noto-sans-arabic-extrabold text-sm text-white">
                                              {chapter.title || `فصل بدون عنوان ${sequenceNumber}`}
                                            </p>
                                            <span className={`noto-sans-arabic-bold inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] ${getStatusTone(chapter.status)}`}>
                                              {chapter.status === 'Published' ? 'منشور' : chapter.status === 'Draft' ? 'مسودة' : chapter.status || "مسودة"}
                                            </span>
                                          </div>
                                          <p className="noto-sans-arabic-medium text-xs line-clamp-2" style={{ color: '#B8B8B8' }}>{previewText}</p>
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
                                            aria-label="تحريك الفصل لأعلى"
                                            style={{ color: '#B8B8B8' }}
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
                                            aria-label="تحريك الفصل لأسفل"
                                            style={{ color: '#B8B8B8' }}
                                          >
                                            <ArrowDown className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        <div className="relative" data-chapter-menu-root>
                                          <Button
                                            variant="ghost"
                                            size="xs"
                                            aria-haspopup="menu"
                                            aria-label="فتح إجراءات الفصل"
                                            aria-expanded={openChapterMenuId === chapterKey}
                                            data-testid={`chapter-card-${chapterKey}-menu-trigger`}
                                            onClick={(event) => handleChapterMenuToggle(event, chapter, orderIndex)}
                                            className="rounded-full border px-2"
                                            style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C' }}
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="noto-sans-arabic-medium flex flex-wrap items-center justify-between gap-2 text-xs" style={{ color: '#797979' }}>
                                      <span className="flex items-center gap-1">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {timelineLabel ? formatSmart(timelineLabel) : "لا يوجد تاريخ"}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="noto-sans-arabic-bold rounded-full border px-2 py-0.5 text-[10px]" style={{ borderColor: '#5A5A5A', color: '#797979' }}>
                                          تسلسل {sequenceNumber}
                                        </span>
                                        {chapter.wordCount ? (
                                          <span>{chapter.wordCount.toLocaleString()} كلمة</span>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                          <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: '#5A5A5A' }}>
                            <p className="noto-sans-arabic-medium text-xs" style={{ color: '#797979' }}>
                              {isReorderEnabled
                                ? "استخدم أزرار الأسهم لضبط الإيقاع. احفظ لدفع الترتيب الجديد للعمل."
                                : "إعادة الترتيب معطلة أثناء تفعيل الفلاتر أو الترتيب البديل."}
                            </p>
                            <Button
                              onClick={handleChapterOrderSave}
                              isLoading={isSavingChapters}
                              disabled={!isReorderEnabled || chapterOrder.length === 0}
                              className="noto-sans-arabic-bold sm:w-auto"
                            >
                              حفظ ترتيب الفصول
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
          className="fixed z-[70] w-48 overflow-hidden rounded-xl border"
          style={{ 
            top: chapterMenuPosition.top, 
            left: chapterMenuPosition.left,
            borderColor: '#5A5A5A',
            backgroundColor: '#3C3C3C'
          }}
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
            className="noto-sans-arabic-bold flex w-full items-center gap-2 px-3.5 py-2 text-sm text-white transition"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 119, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <PenSquare className="h-3.5 w-3.5" />
            تعديل الفصل
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
            className="noto-sans-arabic-bold flex w-full items-center gap-2 px-3.5 py-2 text-sm text-rose-400 transition"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف الفصل
          </button>
        </div>
      ) : null}
      <Modal isOpen={Boolean(pendingChapterDelete)} onClose={() => setPendingChapterDelete(null)}>
        <div dir="rtl" className="space-y-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border text-rose-400" style={{ borderColor: 'rgb(244 63 94)', backgroundColor: 'rgba(244, 63, 94, 0.1)' }}>
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="noto-sans-arabic-extrabold text-lg">حذف {pendingChapterDelete?.title || "هذا الفصل"}؟</h3>
              <p className="noto-sans-arabic-medium text-sm" style={{ color: '#B8B8B8' }}>
                سيتم إزالة الفصل من قائمة الإيقاع فوراً. لا يمكنك التراجع عن هذا الإجراء دون إعادة إنشاء الفصل.
              </p>
            </div>
          </div>
          <div className="rounded-xl border p-4 text-sm" style={{ borderColor: '#5A5A5A', backgroundColor: '#2C2C2C', color: '#B8B8B8' }}>
            <p className="noto-sans-arabic-bold text-white">تنبيه</p>
            <p className="noto-sans-arabic-medium mt-1">
              الحذف لن يؤثر على الفصول المنشورة، لكن القراء الذين يتصفحون المسودات لن يروا هذا الإدخال بعد الآن.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setPendingChapterDelete(null)} disabled={isDeletingChapter} className="noto-sans-arabic-bold">
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={handleChapterDelete}
              isLoading={isDeletingChapter}
              className="noto-sans-arabic-bold"
            >
              حذف الفصل
            </Button>
          </div>
        </div>
      </Modal>
    </div>
    </>
  );
};

export default EditWorkPage;
