import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../store/authTokenStore";

const AuthSuccess = () => {
  const { t } = useTranslation();
  const { setToken } = useAuthStore();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // If we're on the wrong port (5173 when preview is on 4173), redirect to correct port
    const currentPort = window.location.port;
    const isDevPort = currentPort === '5173' || currentPort === '5174';
    const expectedPort = import.meta.env.DEV ? '5173' : '4173';
    
    if (currentPort !== expectedPort && token) {
      // Redirect to the correct port with the token
      const correctUrl = `${window.location.protocol}//${window.location.hostname}:${expectedPort}/auth/success?token=${token}`;
      window.location.href = correctUrl;
      return;
    }

    if (token) {
      console.log("Token received:", token);
      setToken(token);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#2c2c2c" }}
    >
      <div className="max-w-md w-full mx-4">
        <div
          className="rounded-lg p-8 text-center shadow-2xl"
          style={{ backgroundColor: "#3c3c3c" }}
        >
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 mb-6 bg-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {t("auth.success.title")}
          </h1>

          <p className="text-gray-300 mb-6">{t("auth.success.message")}</p>

          {/* Countdown */}
          <div className="mb-6">
            <div className="text-blue-400 font-semibold text-lg">
              {t("auth.success.redirecting")} {countdown}{" "}
              {countdown !== 1
                ? t("auth.success.seconds")
                : t("auth.success.second")}
              ...
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
