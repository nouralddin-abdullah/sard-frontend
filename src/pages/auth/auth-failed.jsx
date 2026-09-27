import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";

// Google sign-in refused because a moderator suspended the account: the API sends
// ?error=account_suspended&until=yyyy-MM-dd (UTC), or &permanent=1.
const suspensionMessage = (urlParams) => {
  const contact = "للاستفسار راسلنا على support@sardnovels.com";
  const until = urlParams.get("until");
  return urlParams.get("permanent") === "1" || !until
    ? `تم إيقاف حسابك نهائياً لمخالفته قواعد سرد. ${contact}`
    : `تم إيقاف حسابك مؤقتاً حتى ${until.replaceAll("-", "/")} لمخالفته قواعد سرد. ${contact}`;
};

const AuthFailure = () => {
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const [suspension, setSuspension] = useState(null);

  useEffect(() => {
    // Get error details from URL parameters if available
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (errorParam === "account_suspended") {
      setSuspension(suspensionMessage(urlParams));
    } else if (errorParam) {
      setError(errorDescription || errorParam);
    }
  }, []);

  const handleRetry = () => {
    // In a real app, you'd redirect to your login/auth page
    window.location.href = "/login";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

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
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 mb-6 bg-red-500 rounded-full flex items-center justify-center">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-white mb-4">
            {suspension ? "تم إيقاف حسابك" : t("auth.failure.title")}
          </h1>

          <p className="text-gray-300 mb-6">{suspension || t("auth.failure.message")}</p>

          {/* Error Details */}
          {error && (
            <div
              className="mb-6 p-4 rounded-lg text-sm text-left"
              style={{ backgroundColor: "#2c2c2c" }}
            >
              <p className="text-red-400 font-medium mb-1">
                {t("auth.failure.errorDetails")}
              </p>
              <p className="text-gray-300">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <GoogleAuthButton />
          </div>

          {/* Help Text */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-gray-400 text-sm">
              {t("auth.failure.stillTrouble")}
              <a
                href="/contact"
                className="text-red-400 hover:text-red-300 ml-1 underline"
              >
                {t("auth.failure.contactSupport")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthFailure;
