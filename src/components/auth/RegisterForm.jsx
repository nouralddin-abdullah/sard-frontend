import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, X, AlertCircle } from "lucide-react";
import { useRegister } from "../../hooks/auth/useRegister";
import useAuthStore from "../../store/authTokenStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Button from "../ui/button";

// Validation helper component for character count
const CharacterCounter = ({ current, min, max }) => {
  const isValid = current >= min && current <= max;
  const isWarning = current > 0 && current < min;
  const isOverLimit = current > max;
  
  return (
    <div className={`text-xs mt-1 flex items-center gap-1 transition-colors duration-200 ${
      isOverLimit ? 'text-[#FF6B6B]' : 
      isWarning ? 'text-amber-400' : 
      isValid ? 'text-emerald-400' : 
      'text-gray-500'
    }`}>
      <span>{current}</span>
      <span>/</span>
      <span>{max}</span>
      {isValid && <Check className="h-3 w-3 text-emerald-400" />}
      {isOverLimit && <X className="h-3 w-3 text-[#FF6B6B]" />}
    </div>
  );
};

// Password strength indicator
const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    if (strength <= 1) return { level: 1, label: 'Weak', color: '#FF6B6B' };
    if (strength <= 2) return { level: 2, label: 'Fair', color: '#FFA94D' };
    if (strength <= 3) return { level: 3, label: 'Good', color: '#FFD43B' };
    if (strength <= 4) return { level: 4, label: 'Strong', color: '#69DB7C' };
    return { level: 5, label: 'Excellent', color: '#51CF66' };
  };
  
  const { level, label, color } = getStrength();
  
  if (!password) return null;
  
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= level ? '' : 'bg-gray-600'
            }`}
            style={{ backgroundColor: i <= level ? color : undefined }}
          />
        ))}
      </div>
      <p className="text-xs transition-colors duration-200" style={{ color }}>
        {label}
      </p>
    </div>
  );
};

// Validation status icon
const ValidationIcon = ({ isValid, isEmpty }) => {
  if (isEmpty) return null;
  
  return (
    <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-all duration-200 ${
      isValid ? 'text-emerald-400' : 'text-[#FF6B6B]'
    }`}>
      {isValid ? (
        <Check className="h-5 w-5" />
      ) : (
        <AlertCircle className="h-5 w-5" />
      )}
    </div>
  );
};

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
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    displayName: false,
    password: false,
    confirmPassword: false,
  });

  // Real-time validation states
  const [validationState, setValidationState] = useState({
    username: { isValid: false, message: '' },
    email: { isValid: false, message: '' },
    displayName: { isValid: false, message: '' },
    password: { isValid: false, message: '' },
    confirmPassword: { isValid: false, message: '' },
  });

  // Real-time field validation
  const validateFieldRealtime = useCallback((name, value, allFields = formFields) => {
    switch (name) {
      case 'username': {
        const trimmed = value.trim();
        if (!trimmed) return { isValid: false, message: t("auth.validation.usernameRequired") || "Username is required" };
        if (trimmed.length < 3) return { isValid: false, message: t("auth.validation.usernameTooShort") || "Minimum 3 characters" };
        if (trimmed.length > 20) return { isValid: false, message: t("auth.validation.usernameTooLong") || "Maximum 20 characters" };
        if (value.includes(" ")) return { isValid: false, message: t("auth.validation.usernameNoSpaces") || "No spaces allowed" };
        return { isValid: true, message: '' };
      }
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) return { isValid: false, message: t("auth.validation.emailRequired") };
        if (!emailRegex.test(value)) return { isValid: false, message: t("auth.validation.emailInvalid") };
        return { isValid: true, message: '' };
      }
      case 'displayName': {
        const trimmed = value.trim();
        if (!trimmed) return { isValid: false, message: t("auth.validation.displayNameRequired") || "Display name is required" };
        if (trimmed.length < 3) return { isValid: false, message: t("auth.validation.displayNameTooShort") || "Minimum 3 characters" };
        if (trimmed.length > 20) return { isValid: false, message: t("auth.validation.displayNameTooLong") || "Maximum 20 characters" };
        return { isValid: true, message: '' };
      }
      case 'password': {
        if (!value.trim()) return { isValid: false, message: t("auth.validation.passwordRequired") };
        if (value.length < 6) return { isValid: false, message: t("auth.validation.passwordTooShort") };
        return { isValid: true, message: '' };
      }
      case 'confirmPassword': {
        if (!value.trim()) return { isValid: false, message: t("auth.validation.confirmPasswordRequired") };
        if (value !== allFields.password) return { isValid: false, message: t("auth.validation.passwordsDoNotMatch") };
        return { isValid: true, message: '' };
      }
      default:
        return { isValid: true, message: '' };
    }
  }, [t, formFields]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormFields = {
      ...formFields,
      [name]: value,
    };
    setformFields(newFormFields);
    
    // Update validation state in real-time
    const validation = validateFieldRealtime(name, value, newFormFields);
    setValidationState(prev => ({
      ...prev,
      [name]: validation,
    }));
    
    // Also revalidate confirmPassword if password changes
    if (name === 'password' && touched.confirmPassword) {
      const confirmValidation = validateFieldRealtime('confirmPassword', newFormFields.confirmPassword, newFormFields);
      setValidationState(prev => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate on blur
    const validation = validateFieldRealtime(name, value);
    setValidationState(prev => ({
      ...prev,
      [name]: validation,
    }));
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

    // Username validation - 3-20 characters, no spaces
    const usernameTrimmed = formFields.username.trim();
    if (!usernameTrimmed) {
      isValid = false;
      newErrors.username = t("auth.validation.usernameRequired") || "Username is required";
    } else if (usernameTrimmed.length < 3) {
      isValid = false;
      newErrors.username = t("auth.validation.usernameTooShort") || "Username must be at least 3 characters";
    } else if (usernameTrimmed.length > 20) {
      isValid = false;
      newErrors.username = t("auth.validation.usernameTooLong") || "Username must be at most 20 characters";
    } else if (formFields.username.includes(" ")) {
      isValid = false;
      newErrors.username = t("auth.validation.usernameNoSpaces") || "Username cannot contain spaces";
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

    // Display name validation - 3-20 characters
    const displayNameTrimmed = formFields.displayName.trim();
    if (!displayNameTrimmed) {
      isValid = false;
      newErrors.displayName = t("auth.validation.displayNameRequired") || "Display name is required";
    } else if (displayNameTrimmed.length < 3) {
      isValid = false;
      newErrors.displayName = t("auth.validation.displayNameTooShort") || "Display name must be at least 3 characters";
    } else if (displayNameTrimmed.length > 20) {
      isValid = false;
      newErrors.displayName = t("auth.validation.displayNameTooLong") || "Display name must be at most 20 characters";
    }

    // Password validation - minimum 6 characters
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
    // Mark all fields as touched on submit
    setTouched({
      username: true,
      email: true,
      displayName: true,
      password: true,
      confirmPassword: true,
    });
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

  // Helper function to get input border classes based on validation state
  const getInputBorderClasses = (fieldName) => {
    const isTouched = touched[fieldName];
    const validation = validationState[fieldName];
    const hasError = errors[fieldName];
    
    if (!isTouched && !hasError) {
      return "border-gray-600/50 focus:ring-[#4A9EFF]/50 focus:border-[#4A9EFF] hover:border-gray-500";
    }
    
    if (validation?.isValid) {
      return "border-emerald-500/50 focus:ring-emerald-500/50 focus:border-emerald-500 hover:border-emerald-400";
    }
    
    return "border-[#FF6B6B]/50 focus:ring-[#FF6B6B]/50 focus:border-[#FF6B6B] hover:border-[#FF6B6B]";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username Field */}
      <div className="group">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="username"
            className="block text-[14px] noto-sans-arabic-medium text-gray-300"
          >
            {t("auth.register.username")}
          </label>
          <CharacterCounter current={formFields.username.length} min={3} max={20} />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`h-5 w-5 transition-colors ${
              touched.username && validationState.username?.isValid 
                ? 'text-emerald-400' 
                : touched.username && !validationState.username?.isValid 
                  ? 'text-[#FF6B6B]' 
                  : 'text-gray-500 group-focus-within:text-[#4A9EFF]'
            }`} />
          </div>
          <input
            id="username"
            name="username"
            type="text"
            maxLength={20}
            value={formFields.username}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${getInputBorderClasses('username')}`}
            placeholder={t("auth.register.usernamePlaceholder")}
          />
          <ValidationIcon 
            isValid={validationState.username?.isValid} 
            isEmpty={!formFields.username || !touched.username} 
          />
        </div>
        {(errors.username || (touched.username && !validationState.username?.isValid && formFields.username)) && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.username || validationState.username?.message}
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
            <Mail className={`h-5 w-5 transition-colors ${
              touched.email && validationState.email?.isValid 
                ? 'text-emerald-400' 
                : touched.email && !validationState.email?.isValid 
                  ? 'text-[#FF6B6B]' 
                  : 'text-gray-500 group-focus-within:text-[#4A9EFF]'
            }`} />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            value={formFields.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${getInputBorderClasses('email')}`}
            placeholder={t("auth.register.emailPlaceholder")}
          />
          <ValidationIcon 
            isValid={validationState.email?.isValid} 
            isEmpty={!formFields.email || !touched.email} 
          />
        </div>
        {(errors.email || (touched.email && !validationState.email?.isValid && formFields.email)) && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.email || validationState.email?.message}
          </p>
        )}
      </div>

      {/* Display Name Field */}
      <div className="group">
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="displayName"
            className="block text-[14px] noto-sans-arabic-medium text-gray-300"
          >
            {t("auth.register.displayName")}
          </label>
          <CharacterCounter current={formFields.displayName.length} min={3} max={20} />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <User className={`h-5 w-5 transition-colors ${
              touched.displayName && validationState.displayName?.isValid 
                ? 'text-emerald-400' 
                : touched.displayName && !validationState.displayName?.isValid 
                  ? 'text-[#FF6B6B]' 
                  : 'text-gray-500 group-focus-within:text-[#4A9EFF]'
            }`} />
          </div>
          <input
            id="displayName"
            name="displayName"
            type="text"
            maxLength={20}
            value={formFields.displayName}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${getInputBorderClasses('displayName')}`}
            placeholder={t("auth.register.displayNamePlaceholder")}
          />
          <ValidationIcon 
            isValid={validationState.displayName?.isValid} 
            isEmpty={!formFields.displayName || !touched.displayName} 
          />
        </div>
        {(errors.displayName || (touched.displayName && !validationState.displayName?.isValid && formFields.displayName)) && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.displayName || validationState.displayName?.message}
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
            <Lock className={`h-5 w-5 transition-colors ${
              touched.password && validationState.password?.isValid 
                ? 'text-emerald-400' 
                : touched.password && !validationState.password?.isValid 
                  ? 'text-[#FF6B6B]' 
                  : 'text-gray-500 group-focus-within:text-[#4A9EFF]'
            }`} />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formFields.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${getInputBorderClasses('password')}`}
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
        <PasswordStrength password={formFields.password} />
        {(errors.password || (touched.password && !validationState.password?.isValid && formFields.password)) && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.password || validationState.password?.message}
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
            <Lock className={`h-5 w-5 transition-colors ${
              touched.confirmPassword && validationState.confirmPassword?.isValid 
                ? 'text-emerald-400' 
                : touched.confirmPassword && !validationState.confirmPassword?.isValid 
                  ? 'text-[#FF6B6B]' 
                  : 'text-gray-500 group-focus-within:text-[#4A9EFF]'
            }`} />
          </div>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formFields.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full pl-12 pr-12 py-3 bg-[#2C2C2C] border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-200 ${getInputBorderClasses('confirmPassword')}`}
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
        {touched.confirmPassword && validationState.confirmPassword?.isValid && (
          <p className="text-emerald-400 text-[13px] mt-1.5 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Passwords match
          </p>
        )}
        {(errors.confirmPassword || (touched.confirmPassword && !validationState.confirmPassword?.isValid && formFields.confirmPassword)) && (
          <p className="text-[#FF6B6B] text-[13px] mt-1.5 flex items-center gap-1 animate-shake">
            <span className="inline-block w-1 h-1 rounded-full bg-[#FF6B6B]"></span>
            {errors.confirmPassword || validationState.confirmPassword?.message}
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
