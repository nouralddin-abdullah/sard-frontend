import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../src/locale/en/translation.json";
import arTranslation from "../src/locale/ar/translation.json";

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    // Sard is Arabic-only. The English resources are unused leftovers, kept until they're removed.
    lng: "ar",
    fallbackLng: "ar",

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

// Forget a language picked on the old /test page, so nobody stays stuck in English.
try {
  localStorage.removeItem("language");
} catch {
  // Storage can be unavailable (private mode); nothing to forget then.
}

export default i18n;
