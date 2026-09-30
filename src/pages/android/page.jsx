import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  Bell,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Library,
  Mail,
  MessageSquareHeart,
  Quote,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import Header from "../../components/common/Header";
import PageMeta from "../../components/common/PageMeta";
import SiteFooter from "../../components/common/SiteFooter";
import {
  ANDROID_BETA_PAGE as PAGE,
  EMAIL_URL,
  SUPPORT_EMAIL,
  WHATSAPP_NUMBER,
  WHATSAPP_URL,
} from "../../content/android-beta-page";

// The join page of the Android beta. Its texts and pictures come from content/android-beta-page, which the SEO worker
// renders for crawlers too.

const FEATURE_ICONS = {
  reading: BookOpen,
  offline: WifiOff,
  widget: Smartphone,
  quotes: Quote,
  notifications: Bell,
  library: Library,
};

const TESTER_ICONS = { stay: CalendarCheck, use: BookOpenCheck, feedback: MessageSquareHeart };

const sectionClass = "mx-auto max-w-5xl px-4 sm:px-6 pt-16 md:pt-24";
const headingClass = "text-2xl md:text-3xl leading-snug text-white noto-sans-arabic-extrabold";
const iconCircleClass = "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#4A9EFF]/10";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg noto-sans-arabic-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A9EFF]";

// The screenshots are about 240px wide on a desktop and 62% of a phone's width.
const SHOT_SIZES = "(min-width: 768px) 240px, 62vw";
// The hero fills the text column: 64rem wide at most, less the page's side padding. On a phone it spans the screen, cut
// to 4:3 around the middle phones, so the 16:9 picture is drawn a third wider than the screen.
const HERO_SIZES = "(min-width: 1024px) 976px, (min-width: 640px) calc(100vw - 48px), 134vw";

/**
 * The six screenshots side by side. On a phone they are swiped (each stops at the start); on a larger screen the
 * arrows move them too, and turn off at either end. A shade marks each side with more to see. scrollLeft is 0 at the
 * start and grows negative right-to-left.
 */
const Gallery = () => {
  const { gallery } = PAGE;
  const boxRef = useRef(null);
  const [ends, setEnds] = useState({ start: true, end: false });

  useEffect(() => {
    const box = boxRef.current;
    const update = () => {
      const scrolled = Math.abs(box.scrollLeft);
      const start = scrolled <= 1;
      const end = box.scrollWidth - box.clientWidth - scrolled <= 1;
      setEnds((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
    };
    update();
    box.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(box);
    return () => {
      box.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  /** Moves most of a screen's width towards the end (1) or the start (-1); at once for readers who want less motion. */
  const move = (towardsEnd) => {
    const box = boxRef.current;
    const rtl = getComputedStyle(box).direction === "rtl";
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    box.scrollBy({ left: towardsEnd * (rtl ? -1 : 1) * box.clientWidth * 0.8, behavior: smooth ? "smooth" : "auto" });
  };

  const arrowClass =
    "flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-[#2C2C2C] text-white transition-colors hover:border-[#4A9EFF] hover:bg-[#3C3C3C] disabled:cursor-default disabled:opacity-40 disabled:hover:border-gray-700 disabled:hover:bg-[#2C2C2C]";
  const shade = "pointer-events-none absolute inset-y-0 w-10 md:w-16 from-[#1C1C1C] to-transparent transition-opacity";

  return (
    <section className="pt-16 md:pt-24">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <h2 id="android-gallery" className={headingClass}>
          {gallery.heading}
        </h2>
        {!(ends.start && ends.end) && (
          <div className="hidden md:flex items-center gap-2">
            <button type="button" className={arrowClass} onClick={() => move(-1)} disabled={ends.start} aria-label="الصور السابقة">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" className={arrowClass} onClick={() => move(1)} disabled={ends.end} aria-label="الصور التالية">
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <div className="relative mx-auto mt-6 max-w-5xl">
        <div
          ref={boxRef}
          role="region"
          aria-labelledby="android-gallery"
          tabIndex={0}
          className="overflow-x-auto overscroll-x-contain snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 focus-visible:outline-2 focus-visible:outline-[#4A9EFF]"
        >
          <ul className="flex w-max gap-4 px-4 pb-4 sm:px-6">
            {gallery.shots.map((shot) => (
              <li key={shot.key} className="w-[62vw] max-w-[260px] flex-shrink-0 snap-start md:w-[240px]">
                <figure>
                  <img
                    src={shot.src}
                    srcSet={shot.srcSet}
                    sizes={SHOT_SIZES}
                    width={shot.width}
                    height={shot.height}
                    loading="lazy"
                    decoding="async"
                    alt={gallery.alt(shot)}
                    className="h-auto w-full rounded-2xl border border-white/10"
                  />
                  <figcaption className="mt-3 text-center text-sm text-gray-400 noto-sans-arabic-medium">
                    {shot.caption}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
        <div
          aria-hidden="true"
          className={`${shade} start-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l ${ends.start ? "opacity-0" : "opacity-100"}`}
        />
        <div
          aria-hidden="true"
          className={`${shade} end-0 ltr:bg-gradient-to-l rtl:bg-gradient-to-r ${ends.end ? "opacity-0" : "opacity-100"}`}
        />
      </div>
    </section>
  );
};

const AndroidBetaPage = () => {
  const { hero, features, join, testers, faq } = PAGE;

  return (
    <>
      <PageMeta title={PAGE.title} description={PAGE.description} path={PAGE.path} image={PAGE.shareImage.url} />
      <Header />
      <div className="min-h-screen bg-[#1C1C1C]">
        <main>
          <section className="relative overflow-hidden">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#4A9EFF]/10 to-transparent"
            />
            <div className="relative mx-auto max-w-5xl px-4 sm:px-6 pt-10 md:pt-16 text-center">
              <h1 className="text-4xl md:text-6xl leading-tight text-balance text-white noto-sans-arabic-extrabold">{hero.title}</h1>
              <p className="mx-auto mt-4 max-w-3xl text-lg md:text-2xl leading-relaxed text-balance text-gray-300 noto-sans-arabic-medium">
                {hero.text}
              </p>
              <a href={`#${join.id}`} className={`${buttonClass} mt-8 bg-[#4A9EFF] text-white hover:bg-[#3A8EEF]`}>
                {hero.cta}
                <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </a>
              <img
                src={hero.image.src}
                srcSet={hero.image.srcSet}
                sizes={HERO_SIZES}
                width={hero.image.width}
                height={hero.image.height}
                fetchPriority="high"
                alt={hero.image.alt}
                className="-mx-4 mt-10 aspect-[4/3] w-[calc(100%+2rem)] max-w-none object-cover sm:mx-0 sm:mt-14 sm:aspect-auto sm:h-auto sm:w-full sm:max-w-full sm:rounded-3xl sm:border sm:border-white/10 sm:shadow-2xl sm:shadow-black/40"
              />
            </div>
          </section>

          <section aria-labelledby="android-features" className={sectionClass}>
            <h2 id="android-features" className={headingClass}>
              {features.heading}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.items.map((item) => {
                const Icon = FEATURE_ICONS[item.key];
                return (
                  <li key={item.key} className="flex items-start gap-4 rounded-2xl border border-gray-700/60 bg-[#2C2C2C] p-5">
                    <span className={iconCircleClass}>
                      <Icon className="h-5 w-5 text-[#4A9EFF]" aria-hidden="true" />
                    </span>
                    <p className="text-base leading-7 text-gray-200">{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <Gallery />

          <section id={join.id} aria-labelledby="android-join" className={`${sectionClass} scroll-mt-4`}>
            <div className="rounded-3xl border border-[#4A9EFF]/40 bg-gradient-to-b from-[#4A9EFF]/10 to-[#2C2C2C]/60 p-6 md:p-10">
              <h2 id="android-join" className={headingClass}>
                {join.heading}
              </h2>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-200">{join.text}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${buttonClass} bg-[#4A9EFF] text-white hover:bg-[#3A8EEF]`}
                >
                  <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
                  {join.whatsapp}
                </a>
                <a
                  href={EMAIL_URL}
                  className={`${buttonClass} border border-gray-700 bg-[#2C2C2C] text-white hover:bg-[#3C3C3C]`}
                >
                  <Mail className="h-5 w-5" aria-hidden="true" />
                  {join.email}
                </a>
              </div>
              <dl className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3">
                  <dt className="text-gray-400">{join.whatsappLabel}:</dt>
                  <dd>
                    <bdi dir="ltr" className="select-all text-lg text-white">
                      {WHATSAPP_NUMBER}
                    </bdi>
                  </dd>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-black/20 px-4 py-3">
                  <dt className="text-gray-400">{join.emailLabel}:</dt>
                  <dd className="min-w-0">
                    <bdi dir="ltr" className="select-all break-all text-lg text-white">
                      {SUPPORT_EMAIL}
                    </bdi>
                  </dd>
                </div>
              </dl>
            </div>
          </section>

          <section aria-labelledby="android-testers" className={sectionClass}>
            <h2 id="android-testers" className={headingClass}>
              {testers.heading}
            </h2>
            <ul className="mt-6 grid gap-4 lg:grid-cols-3">
              {testers.items.map((item) => {
                const Icon = TESTER_ICONS[item.key];
                return (
                  <li key={item.key} className="flex items-start gap-4 rounded-2xl border border-gray-700/60 bg-[#2C2C2C] p-5">
                    <span className={iconCircleClass}>
                      <Icon className="h-5 w-5 text-[#4A9EFF]" aria-hidden="true" />
                    </span>
                    <p className="text-base leading-7 text-gray-200">{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="android-faq" className={`${sectionClass} pb-12 md:pb-20`}>
            <h2 id="android-faq" className={headingClass}>
              {faq.heading}
            </h2>
            <div className="mt-6 divide-y divide-gray-700/60 rounded-2xl border border-gray-700/60 bg-[#2C2C2C]">
              {faq.items.map((item) => (
                <div key={item.question} className="p-5 md:p-6">
                  <h3 className="text-lg text-white noto-sans-arabic-bold">{item.question}</h3>
                  <p className="mt-2 text-base leading-7 text-gray-300">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </>
  );
};

export default AndroidBetaPage;
