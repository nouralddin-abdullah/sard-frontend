import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Crop, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import NovelCover from "../common/NovelCover";
import CoverCropModal from "./CoverCropModal";
import { COVER_IMAGE_ACCEPT, getCoverImageError } from "../../utils/cover-image";

/**
 * Cover field for the create and edit forms: pick (or drop) an image, frame it in the crop step, and see the result.
 * `value` is `{ file, previewUrl, source }` once a cover is chosen (`file` is the JPEG to upload, `source` the picked
 * image, kept so the crop can be adjusted again), or null. With `currentUrl` the saved cover is shown beside it.
 */
const CoverPicker = ({ value, onChange, title = "", currentUrl = null, disabled = false }) => {
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const [cropSource, setCropSource] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // The preview URL belongs to this field; free it when it is replaced or the field goes away.
  useEffect(() => () => value?.previewUrl && URL.revokeObjectURL(value.previewUrl), [value?.previewUrl]);

  const pick = (file) => {
    if (!file || disabled) return;
    const error = getCoverImageError(file);
    if (error) {
      toast.error(t(error));
      return;
    }
    setCropSource(file);
  };

  const openPicker = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  };

  const onDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === "dragenter" || event.type === "dragover");
  };

  const onDrop = (event) => {
    onDrag(event);
    setDragActive(false);
    pick(event.dataTransfer?.files?.[0]);
  };

  const dropzone = (
    <button
      type="button"
      onClick={openPicker}
      onDragEnter={onDrag}
      onDragOver={onDrag}
      onDragLeave={onDrag}
      onDrop={onDrop}
      disabled={disabled}
      className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
        dragActive ? "border-[#0077FF] bg-[#0077FF]/10" : "border-zinc-600 hover:border-zinc-400 hover:bg-white/5"
      }`}
    >
      <ImagePlus className="h-9 w-9 text-zinc-400" aria-hidden="true" />
      <span className="noto-sans-arabic-bold text-zinc-200">{t("cover.upload.title")}</span>
      <span className="noto-sans-arabic-medium text-sm text-zinc-400">{t("cover.upload.subtitle")}</span>
      <span className="noto-sans-arabic-medium text-xs text-zinc-500">{t("cover.upload.help")}</span>
    </button>
  );

  const chosen = value && (
    <div className="flex flex-col items-center gap-3">
      <NovelCover src={value.previewUrl} title={title} className="w-36 shadow-xl sm:w-40" sizes="160px" />
      <div className="flex flex-wrap justify-center gap-2">
        <SmallButton onClick={() => setCropSource(value.source)} icon={Crop} label={t("cover.upload.adjust")} disabled={disabled || !value.source} />
        <SmallButton onClick={openPicker} icon={RefreshCw} label={t("cover.upload.change")} disabled={disabled} />
        <SmallButton onClick={() => onChange(null)} icon={Trash2} label={t("cover.upload.remove")} disabled={disabled} />
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={COVER_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => pick(event.target.files?.[0])}
      />

      {currentUrl ? (
        <div className="grid grid-cols-2 gap-3">
          <figure className="flex flex-col items-center gap-2 rounded-xl border border-zinc-700 p-3">
            <figcaption className="noto-sans-arabic-bold text-xs text-zinc-400">{t("cover.upload.current")}</figcaption>
            <NovelCover src={currentUrl} title={title} className="w-full max-w-40" sizes="160px" />
          </figure>
          <div className={`flex flex-col items-center gap-2 rounded-xl border p-3 ${value ? "border-[#0077FF] bg-[#0077FF]/5" : "border-zinc-700"}`}>
            <p className={`noto-sans-arabic-bold text-xs ${value ? "text-[#4A9EFF]" : "text-zinc-400"}`}>{t("cover.upload.new")}</p>
            {chosen || (
              <button
                type="button"
                onClick={openPicker}
                onDragEnter={onDrag}
                onDragOver={onDrag}
                onDragLeave={onDrag}
                onDrop={onDrop}
                disabled={disabled}
                className={`flex aspect-[2/3] w-full max-w-40 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-3 text-center transition-colors ${
                  dragActive ? "border-[#0077FF] bg-[#0077FF]/10" : "border-zinc-600 hover:border-zinc-400 hover:bg-white/5"
                }`}
              >
                <ImagePlus className="h-7 w-7 text-zinc-400" aria-hidden="true" />
                <span className="noto-sans-arabic-bold text-xs text-zinc-300">{t("cover.upload.title")}</span>
                <span className="noto-sans-arabic-medium text-[11px] text-zinc-500">{t("cover.upload.helpShort")}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        chosen || dropzone
      )}

      {cropSource && (
        <CoverCropModal
          isOpen
          file={cropSource}
          title={title}
          onCancel={() => setCropSource(null)}
          onConfirm={(result) => {
            onChange({ ...result, source: cropSource });
            setCropSource(null);
          }}
        />
      )}
    </div>
  );
};

const SmallButton = ({ onClick, icon, label, disabled }) => {
  const Icon = icon;
  return (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 noto-sans-arabic-medium transition-colors hover:border-zinc-400 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    {label}
  </button>
  );
};

export default CoverPicker;
