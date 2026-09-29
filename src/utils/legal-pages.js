// The legal pages: the privacy policy, the terms of use and the community guidelines. Their addresses, names, titles and
// descriptions are shared by the web app (pages/legal, the site footer) and the SEO worker (cloudflare-worker/
// seo-worker.js), which serves the same pages to crawlers as plain HTML. Keep this module free of browser APIs.
//
// The texts are the owner's, published exactly as written: src/content/legal/*.ar.md are the sard-app docs/store files
// up to their «أسئلة للمالك» section, which is not published (scripts/check-legal-texts.mjs checks this). The app and
// the worker both render those files, so don't edit them here: change them in sard-app and copy them again.

export const LEGAL_PAGES = [
  {
    key: "privacy",
    path: "/privacy",
    file: "privacy-policy.ar.md",
    name: "سياسة الخصوصية",
    title: "سياسة الخصوصية | سرد",
    description:
      "سياسة خصوصية سرد: ما نجمعه من بيانات حين تستخدم الموقع أو تطبيق أندرويد، ولماذا نجمعه، ومن يطّلع عليه، ومدة الاحتفاظ به، وكيف تتحكم فيه وتحذف حسابك.",
  },
  {
    key: "terms",
    path: "/terms",
    file: "terms-of-service.ar.md",
    name: "شروط الاستخدام",
    title: "شروط الاستخدام | سرد",
    description:
      "شروط استخدام سرد: حسابك، والمحتوى الذي تنشره وحقوقك فيه، والنقاط والهدايا، والوصول المبكر، والإشراف والبلاغات، وحذف الحساب.",
  },
  {
    key: "guidelines",
    path: "/guidelines",
    file: "community-guidelines.ar.md",
    name: "إرشادات المجتمع",
    title: "إرشادات المجتمع | سرد",
    description:
      "إرشادات مجتمع سرد: ما لا نسمح به في الروايات والتعليقات والمراجعات، والمواضيع الناضجة لجمهور 13+، وكيف تبلّغ عن محتوى أو تحظر مستخدمًا، وسلّم العقوبات.",
  },
];

/** The legal page at a path ("/privacy", or "/privacy/"), or undefined. */
export const legalPageAt = (path) => LEGAL_PAGES.find((page) => path === page.path || path === `${page.path}/`);

/**
 * A text as the pages show it. Each file ends with two rules (---) that set it apart from the owner's notes that came
 * after them; with the notes gone they would only draw two lines above the footer, so they are left out.
 */
export const legalDisplayText = (markdown) => markdown.replace(/\n\n(?:---[ \t]*\n)*---[ \t]*\n*$/, "\n");

// A link to this site, with or without "www" (the texts link https://www.sardnovels.com/delete-account and each other,
// and "www.sardnovels.com" in the text becomes a link too).
const SITE_LINK = /^https?:\/\/(?:www\.)?sardnovels\.com(?=[/?#]|$)/i;

/** The path of a link to this site ("https://www.sardnovels.com/terms" -> "/terms"), or null for any other link. */
export const sitePath = (href) => {
  const match = SITE_LINK.exec(String(href ?? ""));
  if (!match) return null;
  const rest = String(href).slice(match[0].length);
  return rest.startsWith("/") ? rest : `/${rest}`;
};
