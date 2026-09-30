import { NavLink } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { ANDROID_BETA_NAME, ANDROID_BETA_PATH } from "../../utils/android-beta";
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

/** The site footer: the Android app's join page, the legal pages and the copyright line. */
const SiteFooter = () => (
  <footer className="py-8 px-4 sm:px-6 border-t border-gray-800">
    <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
      <NavLink
        to={ANDROID_BETA_PATH}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#4A9EFF] underline-offset-4 transition-colors hover:text-[#6BB4FF] hover:underline"
      >
        <Smartphone className="h-4 w-4" aria-hidden="true" />
        {ANDROID_BETA_NAME}
      </NavLink>
      <LegalLinks />
      <p className="text-sm text-gray-500 noto-sans-arabic-medium">© 2025 منصة الروايات العربية. جميع الحقوق محفوظة.</p>
    </div>
  </footer>
);

export default SiteFooter;
