// Turns a picked image into the JPEG that is uploaded as a cover: cropped (or fitted) to 2:3 and shrunk in the
// browser, so a 12 MB phone photo becomes a few hundred KB before it leaves the device. The API then makes the WebP
// sizes and the share image from it.
import { COVER_ASPECT, COVER_MIN_WIDTH, COVER_UPLOAD_MAX_WIDTH } from "./cover-image";

const JPEG_QUALITY = 0.9;

/** Loads a picked file as an image element (browsers apply the photo's EXIF orientation to it). */
export const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image-load-failed"));
    img.src = url;
  });

/** The largest 2:3 width that fits in an image (what the author can get at most from it). */
export const maxCropWidth = (width, height) => Math.floor(Math.min(width, height * COVER_ASPECT));

/** Width of the cover when the whole image is kept (fit): as wide as the image's limiting side allows. */
export const fitWidth = (width, height) =>
  Math.floor(width / height > COVER_ASPECT ? width : height * COVER_ASPECT);

/** True when even the largest 2:3 crop of this image is below the API's minimum. */
export const isTooSmallForCover = (width, height) => maxCropWidth(width, height) < COVER_MIN_WIDTH;

/** Output size for a crop that is `cropWidth` source pixels wide: never upscaled, never above the upload width. */
export const outputSize = (cropWidth, maxWidth = COVER_UPLOAD_MAX_WIDTH) => {
  const width = Math.max(2, Math.min(maxWidth, Math.round(cropWidth)));
  const even = width - (width % 2);
  return { width: even, height: Math.round(even / COVER_ASPECT) };
};

const newCanvas = (width, height) => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Transparent PNGs become white, as on the server (a JPEG has no transparency and would turn it black).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  return { canvas, ctx };
};

/** Draws the chosen 2:3 area (`area` in image pixels, as react-easy-crop reports it). */
export const renderCrop = (img, area, maxWidth = COVER_UPLOAD_MAX_WIDTH) => {
  const { width, height } = outputSize(area.width, maxWidth);
  const { canvas, ctx } = newCanvas(width, height);
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, width, height);
  return canvas;
};

/**
 * Draws the whole image centred on a blurred, darkened copy of itself (for landscape or square artwork the author
 * doesn't want cut). The blur is a tiny copy scaled up, which works in every browser (canvas `filter` doesn't).
 */
export const renderFit = (img, maxWidth = COVER_UPLOAD_MAX_WIDTH) => {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const { width, height } = outputSize(fitWidth(iw, ih), maxWidth);
  const { canvas, ctx } = newCanvas(width, height);

  const fill = Math.max(width / iw, height / ih);
  const tinyWidth = 24;
  const tiny = document.createElement("canvas");
  tiny.width = tinyWidth;
  tiny.height = Math.max(1, Math.round((tinyWidth * height) / width));
  const tctx = tiny.getContext("2d");
  tctx.imageSmoothingQuality = "high";
  const sw = width / fill;
  const sh = height / fill;
  tctx.drawImage(img, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, tiny.width, tiny.height);
  ctx.drawImage(tiny, 0, 0, width, height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.fillRect(0, 0, width, height);

  const fit = Math.min(width / iw, height / ih);
  const dw = iw * fit;
  const dh = ih * fit;
  ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
  return canvas;
};

/** Encodes a canvas as the JPEG file that is uploaded. */
export const canvasToFile = (canvas, name = "cover.jpg") =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(new File([blob], name, { type: "image/jpeg" })) : reject(new Error("encode-failed"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });
