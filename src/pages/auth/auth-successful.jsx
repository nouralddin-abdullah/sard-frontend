import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthStore from "../../store/authTokenStore";

// The API redirects here with the JWT in the URL fragment (#token=...), which browsers never
// send to servers. The query form (?token=...) is still accepted while an older API is deployed.
const readTokenFromUrl = () => {
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("token");
  if (fromHash) return fromHash;
  return new URLSearchParams(window.location.search).get("token");
};

// passwordReset=1: this Google sign-in took over an account whose email address was never verified (someone may have
// registered it with this person's address), so the password on it was removed and its other sessions ended.
const readPasswordResetFromUrl = () =>
  new URLSearchParams(window.location.hash.slice(1)).get("passwordReset") === "1";

const AuthSuccess = () => {
  const { t } = useTranslation();
  const { setToken } = useAuthStore();

  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  // Read before the effect strips the fragment from the address bar.
  const [passwordReset] = useState(readPasswordResetFromUrl);

  useEffect(() => {
    const token = readTokenFromUrl();

    // Only handle port redirect in development
    if (import.meta.env.DEV) {
      const currentPort = window.location.port;
      const expectedPort = '5173';
      
      if (currentPort !== expectedPort && token) {
        // Redirect to the correct dev port with the token
        const correctUrl = `${window.location.protocol}//${window.location.hostname}:${expectedPort}/auth/success#token=${encodeURIComponent(token)}${passwordReset ? "&passwordReset=1" : ""}`;
        window.location.replace(correctUrl);
        return;
      }
    }

    if (token) {
      setToken(token);
    }

    // Strip the token from the address bar and history so it can't be copied, shared or leaked.
    if (window.location.hash || window.location.search) {
      window.history.replaceState(window.history.state, "", window.location.pathname);
    }

    // The notice about the removed password waits for the reader to continue.
    if (passwordReset) return;

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

          {passwordReset ? (
            <>
              <div
                role="alert"
                className="mb-6 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4 text-start"
              >
                <p className="text-amber-300 font-bold mb-2">
                  {t("auth.success.passwordRemovedTitle")}
                </p>
                <p className="text-gray-200 text-sm leading-7">
                  {t("auth.success.passwordRemovedMessage")}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/", { replace: true })}
                  className="w-full rounded-lg bg-blue-500 py-3 font-semibold text-white transition-colors hover:bg-blue-600 cursor-pointer"
                >
                  {t("auth.success.continue")}
                </button>
                <Link
                  to="/forgot-password"
                  replace
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  {t("auth.success.setNewPassword")}
                </Link>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;
