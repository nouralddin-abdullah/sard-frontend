import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import RegisterForm from "../../components/auth/RegisterForm";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

export default function RegisterPage() {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ backgroundColor: "#2C2C2C" }}
    >
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="noto-sans-arabic-extrabold text-white text-[56px] leading-none mb-2 hover:opacity-80 transition-opacity">
              سَرْد
            </h1>
          </Link>
          <p className="text-gray-400 text-[14px]">منصة الروايات العربية</p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-3xl shadow-2xl p-8 border border-gray-700/50 backdrop-blur-sm relative overflow-hidden"
          style={{ backgroundColor: "#3C3C3C" }}
        >
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4A9EFF] via-[#6BB4FF] to-[#4A9EFF]" />

          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-[32px] noto-sans-arabic-extrabold text-white mb-2">
              {t("auth.register.title")}
            </h2>
            <p className="text-gray-400 text-[15px]">{t("auth.register.subtitle")}</p>
          </div>

          {/* Form */}
          <RegisterForm />

          {/* Divider */}
          <div className="mt-6 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-4 text-gray-400 noto-sans-arabic-medium"
                  style={{ backgroundColor: "#3C3C3C" }}
                >
                  {t("auth.register.orContinueWith")}
                </span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          <div className="mb-6">
            <GoogleAuthButton />
          </div>

          {/* Login Link */}
          <div className="text-center pt-6 border-t border-gray-700/50">
            <p className="text-[15px] text-gray-400 noto-sans-arabic-medium">
              {t("auth.register.haveAccount")}{" "}
              <Link
                to="/login"
                className="text-[#4A9EFF] hover:text-[#6BB4FF] transition-colors noto-sans-arabic-extrabold"
              >
                {t("auth.register.login")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-[13px]">© 2025 سَرْد - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
