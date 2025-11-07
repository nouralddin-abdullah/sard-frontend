import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useLogin } from "../../hooks/auth/useLogin";
import useAuthStore from "../../store/authTokenStore";
import { useNavigate } from "react-router-dom";
import Button from "../ui/button";

export default function LoginForm() {
  const { t } = useTranslation();

  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const [formFields, setformFields] = useState({
    loginCardinality: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    loginCardinality: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setformFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const {
    mutateAsync: login,
    isPending: isLoading,
    isError,
    error,
  } = useLogin();

  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      loginCardinality: "",
      password: "",
    };

    if (!formFields.loginCardinality.trim()) {
      isValid = false;
      newErrors.loginCardinality = t("auth.validation.fieldRequired");
    }

    if (!formFields.password.trim()) {
      isValid = false;
      newErrors.password = t("auth.validation.fieldRequired");
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    try {
      const token = await login(formFields);

      // If we get here, login was successful
      setToken(token);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* loginCardinality Field */}
      <div className="group">
        <label
          htmlFor="loginCardinality"
          className="block text-[15px] noto-sans-arabic-medium text-gray-300 mb-2"
        >
          {t("auth.login.emailOrUsername")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="loginCardinality"
            name="loginCardinality"
            type="text"
            value={formFields.loginCardinality}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3.5 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.login.emailOrUsernamePlaceholder")}
          />
        </div>
        {errors.loginCardinality && (
          <p className="text-[#FF6B6B] text-[13px] mt-2 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.loginCardinality}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="group">
        <label
          htmlFor="password"
          className="block text-[15px] noto-sans-arabic-medium text-gray-300 mb-2"
        >
          {t("auth.login.password")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formFields.password}
            onChange={handleChange}
            className="w-full pl-12 pr-12 py-3.5 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.login.passwordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-[#FF6B6B] text-[13px] mt-2 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.password}
          </p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-[14px] text-[#4A9EFF] hover:text-[#6BB4FF] transition-colors noto-sans-arabic-medium"
        >
          {t("auth.login.forgotPassword")}
        </Link>
      </div>

      {/* Error Message */}
      {isError && (
        <div className="bg-[#FF6B6B]/10 border border-[#FF6B6B]/30 rounded-xl p-4 animate-shake">
          <p className="text-[#FF6B6B] text-[14px] text-center noto-sans-arabic-medium">
            {error?.message}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button type="submit" isLoading={isLoading} className="w-full">
        <div className="flex items-center justify-center gap-2 noto-sans-arabic-extrabold text-[16px]">
          {t("auth.login.signIn")}
          {!isLoading && (
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </Button>
    </form>
  );
}
