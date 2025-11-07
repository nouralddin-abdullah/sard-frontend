import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import ForgotPasswordForm from "../../components/auth/ForgotPaswordForm";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#2C2C2C" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl shadow-2xl p-8 border border-gray-700"
          style={{ backgroundColor: "#3C3C3C" }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl text-white mb-2 noto-sans-arabic-bold">
              {t("auth.forgotPassword.title")}
            </h2>
            <p className="text-gray-400 noto-sans-arabic-medium">{t("auth.forgotPassword.subtitle")}</p>
          </div>

          {/* Form */}
          <ForgotPasswordForm />

          {/* Back to Login Link */}
          <div className="mt-6">
            <Link
              to="/login"
              className="flex items-center justify-center text-sm text-blue-400 hover:text-blue-300 transition-colors group noto-sans-arabic-medium"
            >
              <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              {t("auth.forgotPassword.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
