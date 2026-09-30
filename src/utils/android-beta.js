// The Android beta. The Sard app for Android is in closed testing on Google Play, and Google opens it to everyone only
// after at least 12 testers have stayed opted in for 14 days in a row, so the site invites its readers: a banner on every
// page (components/common/AndroidBetaBanner) links to the join page at /android (pages/android).
//
// This module is what every page needs: the banner's texts and the link to the join page (the site footer has one too).
// The join page's own texts and pictures are in content/android-beta-page.js, so they load with that page only. The SEO
// worker (cloudflare-worker/seo-worker.js) uses both. Keep them free of browser APIs.
//
// Texts marked "owner" are the owner's, as written in the issue «جرّب تطبيق سرد لأندرويد»; don't reword them.

export const ANDROID_BETA_PATH = "/android";

/** The join page's name in links to it (the site footer) and in the crawler page's breadcrumbs. */
export const ANDROID_BETA_NAME = "جرّب تطبيق سرد لأندرويد"; // owner

/** Whether a path is the join page: "/android" or "/android/". */
export const isAndroidBetaPath = (path) => path === ANDROID_BETA_PATH || path === `${ANDROID_BETA_PATH}/`;

// ─── The banner ───

export const ANDROID_BETA_BANNER = {
  label: "تطبيق سرد لأندرويد",
  text: "تطبيق سرد لأندرويد في مرحلة التجربة — انضم إلى المختبِرين", // owner
  button: "انضم الآن", // owner
  close: "إخفاء الإعلان",
};
