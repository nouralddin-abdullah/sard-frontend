// The Android beta's join page (/android): its texts, pictures and contact links. The web app's page (pages/android) and
// the SEO worker's crawler page (cloudflare-worker/seo-worker.js) both render them, so the two can't drift apart. The
// page's address and name are in utils/android-beta.js. Keep this module free of browser APIs.
//
// Texts marked "owner" are the owner's, as written in the issue «جرّب تطبيق سرد لأندرويد»; don't reword them. The section
// headings, the description, the button to the join section and the picture texts were written for the page.

import { SITE_URL } from "../utils/seo.js";
import { ANDROID_BETA_NAME, ANDROID_BETA_PATH } from "../utils/android-beta.js";

// ─── Contact ───

/** The number and address testers write to, as the page shows them. */
export const WHATSAPP_NUMBER = "+20 104 421 6091";
export const SUPPORT_EMAIL = "support@sardnovels.com";

const WHATSAPP_MESSAGE = "مرحبًا، أريد الانضمام لتجربة تطبيق سرد لأندرويد. بريدي على Google Play هو: "; // owner
const EMAIL_SUBJECT = "الانضمام لتجربة تطبيق سرد"; // owner

/** Opens a chat with the message typed in (wa.me takes the number as digits only, country code first). */
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

/** Opens a new e-mail with the subject filled in. */
export const EMAIL_URL = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;

// ─── Images ───

// public/app-screens: the hero (five phones, 1600x900) and six framed screenshots (668x1293), WebP at the widths below.
// public/og-android.jpg is the hero cut to 1200x630, for link previews.
const IMAGES = "/app-screens";

const image = (name, width, height, widths) => ({
  src: `${IMAGES}/${name}-${widths[widths.length - 1]}.webp`,
  srcSet: widths.map((w) => `${IMAGES}/${name}-${w}.webp ${w}w`).join(", "),
  width,
  height,
});

const HERO_ALT = "شاشات من تطبيق سرد لأندرويد: الرئيسية والقارئ وصفحة الرواية ومشاركة الاقتباس";

// ─── The page ───

export const ANDROID_BETA_PAGE = {
  path: ANDROID_BETA_PATH,
  name: ANDROID_BETA_NAME,
  title: "تطبيق سرد لأندرويد — انضم إلى التجربة", // owner
  description:
    "جرّب تطبيق سرد لأندرويد قبل إطلاقه للجميع: قراءة مريحة وبلا إنترنت، ومشاركة الاقتباسات كصور، وإشعارات الفصول الجديدة. أرسل لنا بريد Google لتنضم إلى التجربة.",
  shareImage: {
    url: `${SITE_URL}/og-android.jpg`,
    type: "image/jpeg",
    width: 1200,
    height: 630,
    alt: HERO_ALT,
  },

  hero: {
    title: "سرد على هاتفك", // owner
    text: "اقرأ رواياتك المفضلة في تطبيق سرد لأندرويد — وكن من أوائل من يجرّبه.", // owner
    cta: "انضم إلى التجربة",
    image: {
      ...image("hero", 1600, 900, [800, 1200, 1600]),
      alt: HERO_ALT,
    },
  },

  features: {
    heading: "ماذا في التطبيق؟",
    // owner
    items: [
      { key: "reading", text: "قراءة مريحة: خط عربي واضح، وحجم وتباعد تختاره، وخلفية فاتحة أو ورقية أو داكنة، وتكمل من حيث توقفت." },
      { key: "offline", text: "القراءة بلا إنترنت: نزّل الفصول واقرأها في أي مكان." },
      { key: "widget", text: "«أكمل القراءة» على الشاشة الرئيسية للهاتف (ويدجت)." },
      { key: "quotes", text: "شارك اقتباسًا كصورة جميلة مع أصدقائك، بتصميمات وخلفيات تختارها." },
      { key: "notifications", text: "إشعارات الفصول الجديدة والردود والهدايا، وتذكير يومي بالقراءة إن أردت." },
      { key: "library", text: "مكتبتك وقوائم قراءتك، والتعليقات والمراجعات، والهدايا مع رسالة للكاتب." },
    ],
  },

  gallery: {
    heading: "صور من التطبيق",
    shots: [
      { key: "home", caption: "الشاشة الرئيسية", ...image("01-home", 668, 1293, [334, 668]) },
      { key: "novel", caption: "صفحة الرواية", ...image("02-novel", 668, 1293, [334, 668]) },
      { key: "reader", caption: "القارئ وقائمة تحديد النص", ...image("03-reader", 668, 1293, [334, 668]) },
      { key: "quote", caption: "مشاركة اقتباس كصورة", ...image("04-quote", 668, 1293, [334, 668]) },
      { key: "library", caption: "المكتبة", ...image("05-library", 668, 1293, [334, 668]) },
      { key: "gifts", caption: "الداعمون ورسائل الهدايا", ...image("06-gifts", 668, 1293, [334, 668]) },
    ],
    /** A screenshot's alt text. */
    alt: (shot) => `تطبيق سرد لأندرويد: ${shot.caption}`,
  },

  join: {
    id: "join",
    heading: "كيف تنضم إلى التجربة؟",
    text: "التجربة مفتوحة لمستخدمي أندرويد. لتنضم أرسل لنا بريد Google الذي تستخدمه على هاتفك، وسنضيفك ونرسل لك رابط التحميل من Google Play.", // owner
    whatsapp: "راسلنا على واتساب", // owner
    email: "راسلنا بالبريد", // owner
    whatsappLabel: "واتساب",
    emailLabel: "البريد",
  },

  testers: {
    heading: "ما نطلبه من المختبِرين",
    // owner
    items: [
      { key: "stay", text: "ابقَ مشتركًا في التجربة واحتفظ بالتطبيق مثبّتًا لمدة 14 يومًا على الأقل." },
      { key: "use", text: "استخدمه كعادتك: اقرأ، وجرّب المكتبة والتعليقات ومشاركة الاقتباسات." },
      { key: "feedback", text: "أخبرنا بما أعجبك وما لم يعجبك من داخل Google Play أو عبر البريد." },
    ],
  },

  faq: {
    heading: "أسئلة شائعة",
    // owner
    items: [
      { question: "هل التطبيق مجاني؟", answer: "نعم." },
      { question: "هل يوجد لآيفون؟", answer: "ليس بعد، قريبًا." },
      { question: "هل حسابي هو نفسه؟", answer: "نعم، نفس حسابك على الموقع." },
      { question: "متى يصبح متاحًا للجميع؟", answer: "بعد انتهاء فترة التجربة ومراجعة Google." },
    ],
  },
};
