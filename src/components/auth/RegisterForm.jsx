import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useRegister } from "../../hooks/auth/useRegister";
import useAuthStore from "../../store/authTokenStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../ui/button";

export default function RegisterForm() {
  const { t } = useTranslation();

  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const [formFields, setformFields] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    displayName: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setformFields({
      ...formFields,
      [e.target.name]: e.target.value,
    });
  };

  const {
    mutateAsync: register,
    isPending: isLoading,
    isError,
    error,
  } = useRegister();

  const validateFields = () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      displayName: "",
      password: "",
      confirmPassword: "",
    };

    // Username validation - should be at least 3 characters and no spaces
    if (
      formFields.username.trim().length < 3 ||
      formFields.username.includes(" ")
    ) {
      isValid = false;
      newErrors.username = t("auth.validation.usernameInvalid");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formFields.email.trim()) {
      isValid = false;
      newErrors.email = t("auth.validation.emailRequired");
    } else if (!emailRegex.test(formFields.email)) {
      isValid = false;
      newErrors.email = t("auth.validation.emailInvalid");
    }

    // Display name validation - should be at least 3 characters
    if (formFields.displayName.trim().length < 3) {
      isValid = false;
      newErrors.displayName = t("auth.validation.displayNameInvalid");
    }

    // Password validation
    if (!formFields.password.trim()) {
      isValid = false;
      newErrors.password = t("auth.validation.passwordRequired");
    } else if (formFields.password.length < 6) {
      isValid = false;
      newErrors.password = t("auth.validation.passwordTooShort");
    }

    // Confirm password validation
    if (!formFields.confirmPassword.trim()) {
      isValid = false;
      newErrors.confirmPassword = t("auth.validation.confirmPasswordRequired");
    } else if (formFields.confirmPassword !== formFields.password) {
      isValid = false;
      newErrors.confirmPassword = t("auth.validation.passwordsDoNotMatch");
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) return;

    const formData = new FormData();
    formData.append("Username", formFields.username);
    formData.append("Email", formFields.email);
    formData.append("DisplayName", formFields.displayName);
    formData.append("Password", formFields.password);

    try {
      const token = await register(formData);

      setToken(token);
      navigate("/", { replace: true });
      toast.success(t("auth.register.accountCreatedMessage"));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username Field */}
      <div className="group">
        <label
          htmlFor="username"
          className="block text-[14px] noto-sans-arabic-medium text-gray-300 mb-1.5"
        >
          {t("auth.register.username")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            value={formFields.username}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.register.usernamePlaceholder")}
          />
        </div>
        {errors.username && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.username}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="group">
        <label
          htmlFor="email"
          className="block text-[14px] noto-sans-arabic-medium text-gray-300 mb-1.5"
        >
          {t("auth.register.email")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formFields.email}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.register.emailPlaceholder")}
          />
        </div>
        {errors.email && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.email}
          </p>
        )}
      </div>

      {/* Display Name Field */}
      <div className="group">
        <label
          htmlFor="displayName"
          className="block text-[14px] noto-sans-arabic-medium text-gray-300 mb-1.5"
        >
          {t("auth.register.displayName")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={formFields.displayName}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.register.displayNamePlaceholder")}
          />
        </div>
        {errors.displayName && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.displayName}
          </p>
        )}
      </div>

      {/* Password Field */}
      <div className="group">
        <label
          htmlFor="password"
          className="block text-[14px] noto-sans-arabic-medium text-gray-300 mb-1.5"
        >
          {t("auth.register.password")}
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
            className="w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.register.passwordPlaceholder")}
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
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.password}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="group">
        <label
          htmlFor="confirmPassword"
          className="block text-[14px] noto-sans-arabic-medium text-gray-300 mb-1.5"
        >
          {t("auth.register.confirmPassword")}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#4A9EFF] transition-colors" />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formFields.confirmPassword}
            onChange={handleChange}
            className="w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] transition-all duration-200 hover:border-gray-500"
            placeholder={t("auth.register.confirmPasswordPlaceholder")}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.confirmPassword}
          </p>
        )}
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
      <Button type="submit" isLoading={isLoading} className="w-full mt-6">
        <div className="flex items-center justify-center gap-2 noto-sans-arabic-extrabold text-[16px]">
          {t("auth.register.createAccount")}
          {!isLoading && (
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          )}
        </div>
      </Button>
    </form>
  );
}
