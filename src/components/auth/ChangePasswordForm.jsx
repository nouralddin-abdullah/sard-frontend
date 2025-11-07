import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useResetPassword } from "../../hooks/auth/useResetPassword";
import { toast } from "sonner";

export default function ChangePasswordForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const userId = searchParams.get("UserId");
  const token = searchParams.get("token");

  const { mutateAsync: resetPassword, isPending } = useResetPassword();

  const [formFields, setFormFields] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const [errors, setErrors] = useState({
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  useEffect(() => {
    // Validate URL parameters
    if (!userId || !token) {
      setInvalidLink(true);
      toast.error("رابط غير صالح. الرجاء طلب رابط جديد لإعادة تعيين كلمة المرور");
    }
  }, [userId, token]);

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
    const newErrors = {
      newPassword: "",
      confirmNewPassword: "",
    };

    // New password validation
    if (!formFields.newPassword.trim()) {
      isValid = false;
      newErrors.newPassword = t("auth.validation.newPasswordRequired");
    } else if (formFields.newPassword.length < 6) {
      isValid = false;
      newErrors.newPassword = t("auth.validation.passwordTooShort");
    }

    // Confirm new password validation
    if (!formFields.confirmNewPassword.trim()) {
      isValid = false;
      newErrors.confirmNewPassword = t(
        "auth.validation.confirmNewPasswordRequired"
      );
    } else if (formFields.confirmNewPassword !== formFields.newPassword) {
      isValid = false;
      newErrors.confirmNewPassword = t(
        "auth.validation.newPasswordsDoNotMatch"
      );
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    if (!userId || !token) {
      toast.error("رابط غير صالح");
      return;
    }

    try {
      await resetPassword({
        userId,
        token,
        newPassword: formFields.newPassword,
      });
      
      setIsSuccess(true);
      toast.success("تم تغيير كلمة المرور بنجاح");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء تغيير كلمة المرور");
    }
  };

  // Show error if missing parameters
  if (invalidLink) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl text-white mb-2 noto-sans-arabic-bold">
            رابط غير صالح
          </h3>
          <p className="text-gray-400 text-sm mb-4 noto-sans-arabic-medium">
            هذا الرابط غير صالح أو منتهي الصلاحية
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors noto-sans-arabic-bold"
          >
            طلب رابط جديد
          </button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl text-white mb-2 noto-sans-arabic-bold">
            {t("auth.changePassword.passwordUpdated")}
          </h3>
          <p className="text-gray-400 text-sm mb-4 noto-sans-arabic-medium">
            يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة
          </p>
          <p className="text-sm text-gray-500 noto-sans-arabic-medium">
            سيتم توجيهك إلى صفحة تسجيل الدخول خلال 3 ثوانٍ...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* New Password Field */}
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm text-gray-300 mb-2 noto-sans-arabic-bold"
          >
            {t("auth.changePassword.newPassword")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={formFields.newPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 noto-sans-arabic-medium"
              placeholder={t("auth.changePassword.newPasswordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-600 my-3">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password Field */}
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm text-gray-300 mb-2 noto-sans-arabic-bold"
          >
            {t("auth.changePassword.confirmNewPassword")}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type={showConfirmNewPassword ? "text" : "password"}
              value={formFields.confirmNewPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 noto-sans-arabic-medium"
              placeholder={t(
                "auth.changePassword.confirmNewPasswordPlaceholder"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirmNewPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.confirmNewPassword && (
            <p className="text-red-600 my-3">{errors.confirmNewPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group noto-sans-arabic-bold"
          style={{
            backgroundColor: isPending ? "#4F46E5" : "#2563EB",
          }}
        >
          {isPending ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {t("auth.changePassword.updatingPassword")}
            </div>
          ) : (
            <div className="flex items-center">
              {t("auth.changePassword.updatePassword")}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </button>
      </div>
    </form>
  );
}
