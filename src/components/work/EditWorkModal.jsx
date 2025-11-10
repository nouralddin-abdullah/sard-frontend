import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Button from "../ui/button";
import { Modal } from "../ui/modal";
import Select from "../ui/select";
import { useUpdateWork } from "../../hooks/work/useUpdateWork";
import { useGetGenresList } from "../../hooks/genre/useGetGenreList";

const STATUS_OPTIONS = [
  { value: "Ongoing", label: "جاري" },
  { value: "Completed", label: "مكتمل" },
];

const EditWorkModal = ({ work, isOpen, onClose }) => {
  if (!work) return null;

  const { mutateAsync: updateWork, isPending } = useUpdateWork();
  const { data: genres = [], isPending: isGenresLoading } = useGetGenresList();

  const allowedStatusValues = useMemo(() => STATUS_OPTIONS.map((option) => option.value), []);

  const initialState = useMemo(
    () => ({
      title: work?.title ?? "",
      summary: work?.summary ?? "",
      status: allowedStatusValues.includes(work?.status) ? work?.status : STATUS_OPTIONS[0].value,
      genreIds: work?.genresList?.map((genre) => genre.id) ?? [],
    }),
    [work, allowedStatusValues]
  );

  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
    }
  }, [isOpen, initialState]);

  const toggleGenre = (genreId) => {
    setFormState((prev) => {
      if (prev.genreIds.includes(genreId)) {
        return {
          ...prev,
          genreIds: prev.genreIds.filter((id) => id !== genreId),
        };
      }
      return {
        ...prev,
        genreIds: [...prev.genreIds, genreId],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formState.title.trim()) {
      toast.error("العنوان مطلوب");
      return;
    }

    if (!formState.summary.trim()) {
      toast.error("الملخص مطلوب");
      return;
    }

    try {
      await updateWork({
        workId: work.id,
        payload: {
          title: formState.title.trim(),
          summary: formState.summary.trim(),
          status: formState.status,
          genreIds: formState.genreIds,
        },
      });
      toast.success("تم تحديث العمل بنجاح");
      onClose();
    } catch (error) {
      toast.error(error?.message || "فشل تحديث العمل");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">Edit work</h2>
          <p className="text-sm text-zinc-400">
            Update the title, summary, status, and genres for this work. Changes are saved immediately after submission.
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="work-title" className="text-sm font-medium text-zinc-300">
            Title
          </label>
          <input
            id="work-title"
            value={formState.title}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, title: event.target.value }))
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            placeholder="Write a compelling title"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="work-summary" className="text-sm font-medium text-zinc-300">
            Summary
          </label>
          <textarea
            id="work-summary"
            rows={4}
            value={formState.summary}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, summary: event.target.value }))
            }
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 resize-none"
            placeholder="Describe the premise and hook for your story"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            id="edit-work-status"
            label="Status"
            value={formState.status}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, status: event.target.value }))
            }
            helperText="Choose how readers will see this work in the library."
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-300">
              Genres
            </label>
            <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 max-h-40 overflow-y-auto space-y-2">
              {isGenresLoading ? (
                <p className="text-sm text-zinc-500">Loading genres…</p>
              ) : (
                genres.map((genre) => {
                  const isSelected = formState.genreIds.includes(genre.id);
                  return (
                    <label
                      key={genre.id}
                      className="flex items-center gap-3 text-sm text-zinc-200 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleGenre(genre.id)}
                        className="accent-blue-500"
                      />
                      <span>{translateGenre(genre.name)}</span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditWorkModal;
