import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Smartphone, X } from "lucide-react";
import { ANDROID_BETA_BANNER, ANDROID_BETA_PATH, isAndroidBetaPath } from "../../utils/android-beta";

// Closing the banner hides it for about 30 days: the time it was closed is kept in localStorage.
const DISMISSED_KEY = "sard-android-beta-banner-closed-at";
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

/** Whether the reader closed the banner in the last 30 days. Storage can be unavailable (blocked, private mode). */
const closedRecently = () => {
  try {
    const closedAt = Number(localStorage.getItem(DISMISSED_KEY));
    const age = Date.now() - closedAt;
    return closedAt > 0 && age >= 0 && age < DISMISS_FOR_MS;
  } catch {
    return false;
  }
};

const rememberClosed = () => {
  try {
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  } catch {
    // Not remembered: it stays hidden until the page is loaded again.
  }
};

/**
 * The invitation to the Android beta, above every page but the join page it links to (/android). It is in the page's
 * first render, never added or removed by an effect after the page shows, and its height is fixed (index.css), so it
 * doesn't move the page; closing it (a click) is the only thing that does. Nothing inside it moves either: the text
 * fills a box of its own, so a web font arriving late only redraws the letters. It isn't a heading, and data-nosnippet
 * keeps its text out of search results. The page's own fixed boxes sit below it (their z-index is 40 and up).
 */
const AndroidBetaBanner = () => {
  const { pathname } = useLocation();
  const [closed, setClosed] = useState(closedRecently);

  // Routes match without regard to case, so /Android is the join page too.
  if (closed || isAndroidBetaPath(pathname.toLowerCase())) return null;

  const close = () => {
    rememberClosed();
    setClosed(true);
  };

  return (
    <aside
      id="site-banner"
      data-nosnippet=""
      aria-label={ANDROID_BETA_BANNER.label}
      className="relative z-30 h-(--site-banner-height) border-b border-[#4A9EFF]/25 bg-[#12223D] text-white"
    >
      {/* On a phone the text takes two lines beside the button; from 640px it is one line in a centered 32rem. */}
      <div className="flex h-full items-center ps-3 pe-1 sm:px-14">
        <Link
          to={ANDROID_BETA_PATH}
          className="group flex h-full min-w-0 flex-1 items-center gap-3 rounded-md sm:mx-auto sm:max-w-lg focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4A9EFF]"
        >
          <Smartphone className="hidden h-5 w-5 flex-shrink-0 text-[#4A9EFF] sm:block" aria-hidden="true" />
          <span className="min-w-0 flex-1 line-clamp-2 text-[13px] leading-5 text-balance text-gray-100 sm:line-clamp-1 sm:text-sm">
            {ANDROID_BETA_BANNER.text}
          </span>
          <span className="flex-shrink-0 whitespace-nowrap rounded-full bg-[#4A9EFF] px-3 py-1 text-[13px] leading-5 noto-sans-arabic-bold text-white transition-colors group-hover:bg-[#3A8EEF]">
            {ANDROID_BETA_BANNER.button}
          </span>
        </Link>
        <button
          type="button"
          onClick={close}
          aria-label={ANDROID_BETA_BANNER.close}
          className="ms-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-[#4A9EFF] sm:absolute sm:end-2 sm:top-1/2 sm:-translate-y-1/2"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
};

export default AndroidBetaBanner;
