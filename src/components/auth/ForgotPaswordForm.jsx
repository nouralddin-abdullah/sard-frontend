import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, ArrowRight } from "lucide-react";
import { useForgotPassword } from "../../hooks/auth/useForgotPassword";
// import { useForgotPassword } from "../../hooks/auth/useForgotPassword"; // Uncomment when hook is available

export default function ForgotPasswordForm() {
  const { t } = useTranslation();

  const { mutateAsync: forgotPassword, isSuccess } = useForgotPassword();

  const [formFields, setFormFields] = useState({
    email: "",
  });

  const [errors, setErrors] = useState({
    email: "",
  });

  const handleChange = (e) => {
    setFormFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });

    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: "",
      }));
    }
  };

  const validateFields = () => {
    let isValid = true;
    const newErrors = { email: "" };

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formFields.email.trim()) {
      isValid = false;
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!emailRegex.test(formFields.email.trim())) {
      isValid = false;
      newErrors.email = t("auth.validation.emailInvalid");
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      await forgotPassword({ email: formFields.email.trim() });
    } catch (error) {
      console.error(error);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl text-white mb-2 noto-sans-arabic-bold">
            {t("auth.forgotPassword.resetLinkSent")}
          </h3>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm text-gray-300 mb-2 noto-sans-arabic-bold"
          >
            {t("auth.forgotPassword.email")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              value={formFields.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 noto-sans-arabic-medium"
              placeholder={t("auth.forgotPassword.emailPlaceholder")}
            />
          </div>
          {errors.email && <p className="text-red-600 my-3 noto-sans-arabic-medium">{errors.email}</p>}
        </div>

        {forgotPassword.isError && (
          <p className="text-red-600 my-3 noto-sans-arabic-medium">{forgotPassword.error}</p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={forgotPassword.isLoading}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group noto-sans-arabic-bold"
          style={{
            backgroundColor: forgotPassword.isLoading ? "#4F46E5" : "#2563EB",
          }}
        >
          {forgotPassword.isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("auth.forgotPassword.sendingResetLink")}
            </div>
          ) : (
            <div className="flex items-center">
              {t("auth.forgotPassword.sendResetLink")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
