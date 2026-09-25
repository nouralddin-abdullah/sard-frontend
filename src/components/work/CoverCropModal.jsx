import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Crop, Loader2, Maximize, ZoomIn, ZoomOut } from "lucide-react";
import { Modal } from "../ui/modal";
import Button from "../ui/button";
import NovelCover from "../common/NovelCover";
import { COVER_ASPECT, COVER_MIN_WIDTH, COVER_RECOMMENDED_WIDTH } from "../../utils/cover-image";
import { canvasToFile, fitWidth, isTooSmallForCover, loadImage, renderCrop, renderFit } from "../../utils/cover-render";

const PREVIEW_WIDTH = 360;

/**
 * Crop step for a picked cover image: the author frames the 2:3 cover (or keeps the whole image on a blurred backdrop)
 * and sees it as a card and on the novel page before it is used. `onConfirm` gets the JPEG to upload.
 */
const CoverCropModal = ({ file, isOpen, title = "", onCancel, onConfirm }) => {
  const { t } = useTranslation();
  const [image, setImage] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [mode, setMode] = useState("crop");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [busy, setBusy] = useState(false);
  const previewTimer = useRef(null);

  // Created and revoked by the same effect, so a remount (StrictMode, fast refresh) never leaves a revoked URL.
  const [objectUrl, setObjectUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A new file starts from a clean state.
  useEffect(() => {
    setImage(null);
    setLoadError(false);
    setMode("crop");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setArea(null);
    if (!objectUrl) return;
    let cancelled = false;
    loadImage(objectUrl)
      .then((img) => !cancelled && setImage(img))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, [objectUrl]);

  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const w = image?.naturalWidth ?? 0;
  const h = image?.naturalHeight ?? 0;
  // Too small even for the whole image, or too small to cut a 2:3 crop from (then "keep whole image" may still work).
  const fitImpossible = !!image && fitWidth(w, h) < COVER_MIN_WIDTH;
  const cropImpossible = !!image && isTooSmallForCover(w, h);
  const cropTooSmall = mode === "crop" && !cropImpossible && !!area && area.width < COVER_MIN_WIDTH;
  const blocked = !image || fitImpossible || (mode === "crop" && (cropImpossible || cropTooSmall));
  // Source pixels across the cover: what decides how sharp it can be.
  const chosenWidth = !image ? 0 : mode === "crop" ? Math.round(area?.width ?? 0) : fitWidth(w, h);
  const lowResolution = !blocked && chosenWidth > 0 && chosenWidth < COVER_RECOMMENDED_WIDTH;
  const problem = fitImpossible
    ? t("cover.errors.tooSmall")
    : mode === "crop" && cropImpossible
      ? t("cover.crop.useFit")
      : cropTooSmall
        ? t("cover.crop.zoomedTooFar")
        : null;

  // An image too small to crop but fine whole opens in "keep whole image".
  useEffect(() => {
    if (image && isTooSmallForCover(image.naturalWidth, image.naturalHeight)) setMode("fit");
  }, [image]);

  // Small live preview of the exact result, redrawn shortly after the author stops moving the crop.
  useEffect(() => {
    if (!image || fitImpossible || (mode === "crop" && (!area || cropImpossible))) return;
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      const canvas = mode === "crop" ? renderCrop(image, area, PREVIEW_WIDTH) : renderFit(image, PREVIEW_WIDTH);
      canvas.toBlob((blob) => blob && setPreviewUrl(URL.createObjectURL(blob)), "image/jpeg", 0.85);
    }, 120);
    return () => clearTimeout(previewTimer.current);
  }, [image, area, mode, fitImpossible, cropImpossible]);

  const onCropComplete = useCallback((_, pixels) => setArea(pixels), []);

  const confirm = async () => {
    if (blocked) return;
    setBusy(true);
    try {
      const canvas = mode === "crop" ? renderCrop(image, area) : renderFit(image);
      const cover = await canvasToFile(canvas);
      onConfirm({ file: cover, previewUrl: URL.createObjectURL(cover), width: canvas.width, height: canvas.height });
    } catch {
      setLoadError(true);
    } finally {
      setBusy(false);
    }
  };

  const modeButton = (value, Icon, label) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm noto-sans-arabic-bold transition-colors ${
        mode === value ? "bg-[#0077FF] text-white" : "text-zinc-300 hover:bg-white/5"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? undefined : onCancel}
      unstyled
      contentClassName="w-full max-w-3xl mx-3 sm:mx-4 max-h-[92vh] overflow-y-auto rounded-2xl bg-zinc-800 px-4 pt-4 sm:px-6 sm:pt-6 shadow-2xl transition-all duration-200"
    >
      <div className="space-y-4 text-start">
        <div className="space-y-1">
          <h2 className="noto-sans-arabic-extrabold text-lg text-white sm:text-xl">{t("cover.crop.title")}</h2>
          <p className="noto-sans-arabic-medium text-sm text-zinc-400">{t("cover.crop.subtitle")}</p>
        </div>

        {loadError ? (
          <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 noto-sans-arabic-medium">
            {t("cover.errors.unreadable")}
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_13rem]">
            <div className="space-y-3">
              <div className="flex gap-1 rounded-xl bg-zinc-900 p-1" role="group" aria-label={t("cover.crop.modeLabel")}>
                {modeButton("crop", Crop, t("cover.crop.modeCrop"))}
                {modeButton("fit", Maximize, t("cover.crop.modeFit"))}
              </div>

              <div className="relative h-[42vh] max-h-[440px] min-h-[240px] overflow-hidden rounded-xl bg-zinc-950 md:h-[52vh]">
                {!image && (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-400">
                    <Loader2 className="h-6 w-6 animate-spin" aria-label={t("cover.crop.loading")} />
                  </div>
                )}
                {image && mode === "crop" && !cropImpossible && (
                  <Cropper
                    image={objectUrl}
                    crop={crop}
                    zoom={zoom}
                    aspect={COVER_ASPECT}
                    minZoom={1}
                    maxZoom={5}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                    objectFit="contain"
                    showGrid
                    mediaProps={{ alt: "" }}
                  />
                )}
                {image && mode === "fit" && previewUrl && (
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img src={previewUrl} alt="" className="h-full w-auto rounded-md object-contain shadow-2xl" />
                  </div>
                )}
              </div>

              {mode === "crop" && image && (
                <label className="flex items-center gap-3 text-zinc-300">
                  <ZoomOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="sr-only">{t("cover.crop.zoom")}</span>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#0077FF]"
                  />
                  <ZoomIn className="h-4 w-4 shrink-0" aria-hidden="true" />
                </label>
              )}
              <p className="noto-sans-arabic-medium text-xs text-zinc-500">
                {mode === "crop" ? t("cover.crop.hintCrop") : t("cover.crop.hintFit")}
              </p>
            </div>

            <div className="space-y-2">
              <p className="noto-sans-arabic-bold text-xs text-zinc-400">{t("cover.crop.previewTitle")}</p>
              <div className="flex items-end gap-3 md:flex-col md:items-stretch">
                <div className="flex-1 rounded-xl bg-[#2C2C2C] p-3">
                  <p className="mb-2 noto-sans-arabic-medium text-[11px] text-zinc-500">{t("cover.crop.previewPage")}</p>
                  <NovelCover src={previewUrl} title={title} className="mx-auto w-28 shadow-xl" sizes="112px" />
                </div>
                <div className="flex-1 rounded-xl bg-[#2C2C2C] p-3">
                  <p className="mb-2 noto-sans-arabic-medium text-[11px] text-zinc-500">{t("cover.crop.previewCard")}</p>
                  <div className="flex items-center gap-2">
                    <NovelCover src={previewUrl} title={title} className="w-12 shrink-0" rounded="rounded" sizes="48px" />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p dir="auto" className="truncate noto-sans-arabic-bold text-xs text-white">{title || t("cover.crop.previewUntitled")}</p>
                      <div className="h-1.5 w-3/4 rounded bg-zinc-600" />
                      <div className="h-1.5 w-1/2 rounded bg-zinc-700" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {problem && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300 noto-sans-arabic-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {problem}
          </p>
        )}
        {lowResolution && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200 noto-sans-arabic-medium">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {t("cover.crop.lowResolution", { width: chosenWidth })}
          </p>
        )}

        {/* Kept in view while the modal scrolls on small screens. */}
        <div className="sticky bottom-0 z-10 -mx-4 flex flex-col-reverse gap-2 border-t border-zinc-700 bg-zinc-800 px-4 pb-4 pt-3 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6 sm:pb-6 sm:pt-4">
          <Button variant="ghost" onClick={onCancel} disabled={busy} className="text-zinc-300 hover:bg-white/5 hover:text-white">
            {t("cover.crop.cancel")}
          </Button>
          <Button onClick={confirm} isLoading={busy} disabled={blocked || loadError}>
            {t("cover.crop.confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CoverCropModal;
