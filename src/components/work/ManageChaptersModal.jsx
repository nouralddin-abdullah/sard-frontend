import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import Button from "../ui/button";
import { Modal } from "../ui/modal";
import { useGetWorkChapters } from "../../hooks/work/useGetWorkChapters";
import { useReorderWorkChapters } from "../../hooks/work/useReorderWorkChapters";

const normalizeChapters = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.items && Array.isArray(data.items)) return data.items;
  return [];
};

const ManageChaptersModal = ({ work, isOpen, onClose }) => {
  if (!work) return null;

  const [chapterOrder, setChapterOrder] = useState([]);
  const { data, isPending, isRefetching } = useGetWorkChapters(work?.id, {
    enabled: Boolean(work?.id) && isOpen,
  });
  const { mutateAsync: reorderChapters, isPending: isSaving } = useReorderWorkChapters();

  const chapters = useMemo(() => normalizeChapters(data), [data]);

  useEffect(() => {
    if (isOpen) {
      setChapterOrder(chapters);
    }
  }, [chapters, isOpen]);

  const moveChapter = (index, direction) => {
    setChapterOrder((prev) => {
      const updated = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= updated.length) return prev;
      const [moved] = updated.splice(index, 1);
      updated.splice(newIndex, 0, moved);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!work?.id) return;
    try {
      await reorderChapters({
        workId: work.id,
        orderedChapterIds: chapterOrder.map((chapter) => chapter.id),
      });
      toast.success("تم تحديث ترتيب الفصول");
      onClose();
    } catch (error) {
      toast.error(error?.message || "فشل إعادة ترتيب الفصول");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">Manage chapters</h2>
          <p className="text-sm text-zinc-400">
            Reorder chapters to adjust pacing or restructure your story arc. Drag handles or arrow buttons to rearrange.
          </p>
        </div>

        {isPending || isRefetching ? (
          <p className="text-sm text-zinc-500">Loading chapters…</p>
        ) : chapterOrder.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-sm text-zinc-400">
            No chapters found. Chapters will appear here once you start writing.
          </div>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {chapterOrder.map((chapter, index) => (
              <li
                key={chapter.id || index}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3"
              >
                <div className="text-zinc-500">
                  <GripVertical className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    {chapter.title || `Chapter ${index + 1}`}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {chapter.synopsis?.slice(0, 80) || "No synopsis provided"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => moveChapter(index, -1)}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => moveChapter(index, 1)}
                    disabled={index === chapterOrder.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={isSaving}
            disabled={chapterOrder.length === 0}
          >
            Save order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ManageChaptersModal;
