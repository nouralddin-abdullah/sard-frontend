import { useEffect, useState } from "react";
import { toast } from "sonner";
import Button from "../ui/button";
import { Modal } from "../ui/modal";
import { useUpdateWorkCover } from "../../hooks/work/useUpdateWorkCover";

const UpdateCoverModal = ({ work, isOpen, onClose }) => {
  if (!work) return null;

  const { mutateAsync: updateCover, isPending } = useUpdateWorkCover();
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setPreview(null);
      setFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      toast.error("يرجى رفع ملف صورة");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("يجب أن يكون حجم الصورة أقل من 10 ميجابايت");
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("اختر صورة أولاً");
      return;
    }

    try {
      await updateCover({ workId: work.id, coverFile: file });
      toast.success("تم تحديث الغلاف بنجاح");
      onClose();
    } catch (error) {
      toast.error(error?.message || "فشل تحديث الغلاف");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-zinc-100">Update cover</h2>
          <p className="text-sm text-zinc-400">
            Upload a striking new cover to match the tone of your story. High-contrast imagery works best.
          </p>
        </div>

        <div className="space-y-3">
          <label
            htmlFor="work-cover"
            className="relative block bg-zinc-900 border border-dashed border-zinc-700 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500/60 transition"
          >
            <input
              id="work-cover"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {preview ? (
              <img
                src={preview}
                alt="Cover preview"
                className="w-40 h-56 mx-auto object-cover rounded-xl shadow-lg"
              />
            ) : (
              <div className="space-y-3">
                <div className="text-sm font-medium text-zinc-200">
                  Click to upload an image
                </div>
                <p className="text-xs text-zinc-500">
                  PNG, JPG, or GIF up to 10MB
                </p>
              </div>
            )}
          </label>

          {work?.coverImageUrl && !preview && (
            <div className="text-sm text-zinc-400">
              Current cover:
              <img
                src={work.coverImageUrl}
                alt={work.title}
                className="mt-3 w-24 h-32 object-cover rounded-lg border border-zinc-700"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!file}>
            Save cover
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UpdateCoverModal;
