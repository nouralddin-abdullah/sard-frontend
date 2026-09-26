import React from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({
  id,
  name,
  type = "text",
  value,
  onChange,
  label,
  placeholder,
  error,
  icon,
  disabled = false,
  required = false,
  className = "",
  showPasswordToggle = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}

        <input
          id={id}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${icon ? "pl-10" : "pl-4"} ${
            showPasswordToggle && type === "password" ? "pr-10" : "pr-4"
          } py-3 bg-gray-800 border ${
            error ? "border-red-500" : "border-gray-600"
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
            error ? "focus:ring-red-500" : "focus:ring-blue-500"
          } focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
          placeholder={placeholder}
          {...props}
        />

        {showPasswordToggle && type === "password" && (
          <button aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 my-3 text-sm">{error}</p>}
    </div>
  );
};

export default Input;
