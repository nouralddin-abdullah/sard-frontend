import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Header from "../../components/common/Header";
import PageMeta from "../../components/common/PageMeta";
import SiteFooter from "../../components/common/SiteFooter";
import { LEGAL_PAGES, legalDisplayText, sitePath } from "../../utils/legal-pages";
import privacyPolicy from "../../content/legal/privacy-policy.ar.md?raw";
import termsOfService from "../../content/legal/terms-of-service.ar.md?raw";
import communityGuidelines from "../../content/legal/community-guidelines.ar.md?raw";

// The owner's texts, as published (see utils/legal-pages). The SEO worker serves the same files to crawlers.
const TEXTS = { privacy: privacyPolicy, terms: termsOfService, guidelines: communityGuidelines };

const linkClass = "text-[#4A9EFF] underline-offset-4 hover:underline";

// Links to the site (the other legal pages, /delete-account) stay in the app; e-mail addresses open the mail app;
// other sites (Google Play's refund policy) open in a new tab.
const TextLink = ({ href = "", children }) => {
  const path = sitePath(href);
  if (path) {
    return (
      <Link to={path} className={linkClass}>
        {children}
      </Link>
    );
  }
  const external = /^https?:/i.test(href);
  return (
    <a
      href={href}
      className={linkClass}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
};

// A table too wide for the screen scrolls sideways in this box, never the page. A shade marks each side with more to
// see; scrollLeft is 0 at the start and grows (negative right-to-left) towards the end.
const TableBox = ({ children }) => {
  const boxRef = useRef(null);
  const [more, setMore] = useState({ start: false, end: false });

  useEffect(() => {
    const box = boxRef.current;
    const update = () => {
      const scrolled = Math.abs(box.scrollLeft);
      const start = scrolled > 1;
      const end = box.scrollWidth - box.clientWidth - scrolled > 1;
      setMore((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
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

  const shade = "pointer-events-none absolute inset-y-0 w-6 from-[#4A9EFF]/30 to-transparent transition-opacity";
  return (
    <div className="relative my-6">
      <div ref={boxRef} className="overflow-x-auto">
        {children}
      </div>
      <div
        aria-hidden="true"
        className={`${shade} start-0 ltr:bg-gradient-to-r rtl:bg-gradient-to-l ${more.start ? "opacity-100" : "opacity-0"}`}
      />
      <div
        aria-hidden="true"
        className={`${shade} end-0 ltr:bg-gradient-to-l rtl:bg-gradient-to-r ${more.end ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

// The site's typography for the Markdown: Noto Sans Arabic for headings, the body font (Tajawal) for the text. Tables
// with two columns fit a phone; three or more keep readable columns (min-width) and scroll in their box.
const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => (
    <h1 className="text-2xl md:text-3xl leading-snug text-white noto-sans-arabic-extrabold mb-4">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl md:text-2xl leading-snug text-white noto-sans-arabic-extrabold mt-10 mb-4">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg md:text-xl leading-snug text-white noto-sans-arabic-extrabold mt-8 mb-3">{children}</h3>
  ),
  p: ({ children }) => <p className="mb-4">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
  ul: ({ children }) => <ul className="list-disc ps-6 mb-4 space-y-2 marker:text-gray-500">{children}</ul>,
  ol: ({ children, start }) => (
    <ol start={start} className="list-decimal ps-6 mb-4 space-y-2 marker:text-gray-400">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="ps-1">{children}</li>,
  a: TextLink,
  hr: () => <hr className="my-8 border-gray-800" />,
  table: ({ children }) => (
    <TableBox>
      <table className="w-full border-collapse border border-gray-700 text-[15px] leading-7 [&:has(th:nth-child(3))]:min-w-[36rem]">
        {children}
      </table>
    </TableBox>
  ),
  th: ({ children, style }) => (
    <th style={style} className="border border-gray-700 bg-[#2C2C2C] px-3 py-2 text-start align-top font-bold text-white">
      {children}
    </th>
  ),
  td: ({ children, style }) => (
    <td style={style} className="border border-gray-700 px-3 py-2 align-top">
      {children}
    </td>
  ),
};

const LegalPage = ({ pageKey }) => {
  const page = LEGAL_PAGES.find((item) => item.key === pageKey);

  return (
    <>
      <PageMeta title={page.title} description={page.description} path={page.path} />
      <Header />
      <div className="min-h-screen bg-[#1C1C1C]">
        <main>
          <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-2 md:pt-12 md:pb-12 text-base md:text-[17px] leading-8 text-gray-300 break-words [&_li>ol]:mt-2 [&_li>ol]:mb-0 [&_li>ul]:mt-2 [&_li>ul]:mb-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
              {legalDisplayText(TEXTS[page.key])}
            </ReactMarkdown>
          </article>
        </main>
        <SiteFooter />
      </div>
    </>
  );
};

export default LegalPage;
