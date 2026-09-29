import { NavLink } from "react-router-dom";
import { LEGAL_PAGES } from "../../utils/legal-pages";

/** Links to the legal pages: the privacy policy, the terms of use and the community guidelines. */
export const LegalLinks = () => (
  <nav aria-label="الشروط والسياسات">
    <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
      {LEGAL_PAGES.map((page) => (
        <li key={page.key}>
          <NavLink
            to={page.path}
            className={({ isActive }) =>
              `text-sm font-medium underline-offset-4 transition-colors hover:text-white hover:underline ${
                isActive ? "text-white" : "text-gray-400"
              }`
            }
          >
            {page.name}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

/** The site footer: the legal pages and the copyright line. */
const SiteFooter = () => (
  <footer className="py-8 px-4 sm:px-6 border-t border-gray-800">
    <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
      <LegalLinks />
      <p className="text-sm text-gray-500 noto-sans-arabic-medium">© 2025 منصة الروايات العربية. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
);

export default SiteFooter;
