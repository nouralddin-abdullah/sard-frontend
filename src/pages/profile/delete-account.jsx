import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, EyeOff, Loader2, LogIn, Trash2 } from "lucide-react";
import Header from "../../components/common/Header";
import PageMeta from "../../components/common/PageMeta";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { useGetWalletBalance } from "../../hooks/wallet/useGetWalletBalance";
import { useAccountToDelete, useDeleteAccount } from "../../hooks/user/useDeleteAccount";
import useAuthStore from "../../store/authTokenStore";
import { rememberReturnPath } from "../../utils/return-path";

const PATH = "/delete-account";
const SUPPORT_EMAIL = "support@sardnovels.com";

// The API accepts a Google-only account's own token for 10 minutes after it signed in; a minute is left for confirming.
const RECENT_SIGN_IN_SECONDS = 9 * 60;

// When the access token was issued (its "iat", seconds), read from the token itself; null if it can't be read.
const tokenIssuedAt = (token) => {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "=");
    const iat = Number(JSON.parse(atob(padded)).iat);
    return Number.isFinite(iat) ? iat : null;
  } catch {
    return null;
  }
};

const signedInRecently = (token) => {
  const iat = token ? tokenIssuedAt(token) : null;
  return iat !== null && Date.now() / 1000 - iat < RECENT_SIGN_IN_SECONDS;
};

// The typed confirmation, without diacritics, tatweel or surrounding spaces.
const normalizeWord = (text) => text.replace(/[\u064B-\u065F\u0670\u0640]/g, "").trim();

const InfoCard = ({ icon, title, items, tone = "neutral" }) => {
  const Icon = icon;
  return (
    <section
      className={`rounded-xl border p-5 ${
        tone === "danger" ? "border-red-500/30 bg-red-500/5" : "border-gray-800 bg-[#2C2C2C]"
      }`}
    >
      <h2 className="flex items-center gap-2 text-lg text-white noto-sans-arabic-bold mb-3">
        <Icon className={`w-5 h-5 flex-shrink-0 ${tone === "danger" ? "text-red-400" : "text-gray-400"}`} aria-hidden="true" />
        {title}
      </h2>
      <ul className="list-disc ps-5 space-y-2 text-gray-300 noto-sans-arabic-medium leading-7 marker:text-gray-500">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
};

const inputClass =
  "w-full bg-[#1C1C1C] text-white rounded-lg px-4 py-3 noto-sans-arabic-medium border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/70";

const DeleteAccountPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { token, isAuthenticated, deleteToken } = useAuthStore();
  const { data: me, isLoading: loadingMe } = useAccountToDelete(isAuthenticated ? token : null);
  const signedIn = isAuthenticated && Boolean(me?.id);
  const { data: wallet } = useGetWalletBalance(signedIn);
  const { mutateAsync: deleteAccount, isPending: deleting } = useDeleteAccount();

  const [password, setPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [error, setError] = useState(null);
  // The API said the Google sign-in behind the token isn't recent enough (the reader waited too long).
  const [googleExpired, setGoogleExpired] = useState(false);
  const [deleted, setDeleted] = useState(false);

  // An API without the field asks for the password, as it always did.
  const hasPassword = me?.hasPassword !== false;
  const googleConfirmed = !hasPassword && !googleExpired && signedInRecently(token);
  const canConfirm = hasPassword || googleConfirmed;
  const wordTyped = normalizeWord(typed) === t("deleteAccount.confirm.word");
  const canSubmit = canConfirm && wordTyped && (!hasPassword || password.length > 0) && !deleting;
  const balance = Number(wallet?.currentBalance);

  const signOutHere = () => {
    deleteToken();
    queryClient.clear();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!canSubmit) return;
    setError(null);
    try {
      await deleteAccount({ token, password: hasPassword ? password : undefined });
      // The API refuses this session's token from now on.
      signOutHere();
      setDeleted(true);
      window.scrollTo({ top: 0 });
    } catch (err) {
      if (err.status === 401) {
        signOutHere();
      } else if (err.code === "ReauthenticationRequired" && !hasPassword) {
        setGoogleExpired(true);
      }
      setError(err.message);
    }
  };

  const goSignIn = () => {
    rememberReturnPath(PATH);
    navigate("/login");
  };

  const meta = (
    <PageMeta title={t("deleteAccount.metaTitle")} description={t("deleteAccount.metaDescription")} path={PATH} />
  );

  if (deleted) {
    return (
      <>
        {meta}
        <Header />
        <main className="min-h-screen bg-[#1C1C1C] px-4 py-16">
          <div className="max-w-xl mx-auto text-center rounded-xl border border-gray-800 bg-[#2C2C2C] p-8" role="status">
            <CheckCircle2 className="mx-auto w-14 h-14 text-green-400 mb-4" aria-hidden="true" />
            <h1 className="text-2xl text-white noto-sans-arabic-extrabold mb-3">{t("deleteAccount.done.title")}</h1>
            <p className="text-gray-300 noto-sans-arabic-medium leading-8 mb-6">{t("deleteAccount.done.text")}</p>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-[#4A9EFF] px-6 py-3 text-white noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors"
            >
              {t("deleteAccount.done.home")}
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {meta}
      <Header />
      <main className="min-h-screen bg-[#1C1C1C]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12 space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl text-white noto-sans-arabic-extrabold mb-3">{t("deleteAccount.title")}</h1>
            <p className="text-gray-300 noto-sans-arabic-medium leading-8">{t("deleteAccount.intro")}</p>
          </div>

          <InfoCard icon={Trash2} title={t("deleteAccount.deleted.title")} items={t("deleteAccount.deleted.items", { returnObjects: true })} />
          <InfoCard icon={EyeOff} title={t("deleteAccount.anonymized.title")} items={t("deleteAccount.anonymized.items", { returnObjects: true })} />
          <InfoCard icon={AlertTriangle} title={t("deleteAccount.lost.title")} items={t("deleteAccount.lost.items", { returnObjects: true })} tone="danger" />

          <section className="rounded-xl border border-gray-700 bg-[#2C2C2C] p-5 md:p-6" aria-labelledby="delete-account-action">
            {isAuthenticated && loadingMe ? (
              <div className="flex items-center justify-center gap-3 py-8 text-gray-300 noto-sans-arabic-medium">
                <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                {t("deleteAccount.confirm.loading")}
              </div>
            ) : !signedIn ? (
              <div className="space-y-4">
                <h2 id="delete-account-action" className="text-xl text-white noto-sans-arabic-bold">
                  {t("deleteAccount.signedOut.title")}
                </h2>
                <p className="text-gray-300 noto-sans-arabic-medium leading-7">
                  {isAuthenticated ? t("deleteAccount.confirm.sessionEnded") : t("deleteAccount.signedOut.text")}
                </p>
                <button
                  type="button"
                  onClick={goSignIn}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4A9EFF] px-6 py-3 text-white noto-sans-arabic-bold hover:bg-[#3A8EEF] transition-colors w-full sm:w-auto"
                >
                  <LogIn className="w-5 h-5" aria-hidden="true" />
                  {t("deleteAccount.signedOut.signIn")}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5" noValidate>
                <h2 id="delete-account-action" className="text-xl text-white noto-sans-arabic-bold">
                  {t("deleteAccount.confirm.title")}
                </h2>

                <p className="text-gray-300 noto-sans-arabic-medium">
                  {t("deleteAccount.confirm.account")}{" "}
                  <span className="text-white noto-sans-arabic-bold">{me.displayName}</span>{" "}
                  <bdi className="text-gray-400" dir="ltr">@{me.userName}</bdi>
                </p>

                <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-200 noto-sans-arabic-medium leading-7">
                  <AlertTriangle className="w-5 h-5 mt-1 flex-shrink-0 text-red-400" aria-hidden="true" />
                  <span>
                    {balance > 0
                      ? t("deleteAccount.confirm.balance", { points: balance.toLocaleString("ar-EG") })
                      : t("deleteAccount.confirm.balanceUnknown")}
                  </span>
                </p>

                {hasPassword ? (
                  <div className="space-y-2">
                    <label htmlFor="delete-account-password" className="block text-white noto-sans-arabic-bold">
                      {t("deleteAccount.confirm.password")}
                    </label>
                    <input
                      id="delete-account-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("deleteAccount.confirm.passwordPlaceholder")}
                      className={inputClass}
                    />
                  </div>
                ) : googleConfirmed ? (
                  <p className="text-gray-300 noto-sans-arabic-medium leading-7">{t("deleteAccount.confirm.googleRecent")}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-300 noto-sans-arabic-medium leading-7">{t("deleteAccount.confirm.googleNeeded")}</p>
                    <div className="sm:max-w-sm">
                      <GoogleAuthButton label={t("deleteAccount.confirm.googleButton")} returnTo={PATH} selectAccount />
                    </div>
                  </div>
                )}

                {canConfirm && (
                  <div className="space-y-2">
                    <label htmlFor="delete-account-word" className="block text-white noto-sans-arabic-bold">
                      {t("deleteAccount.confirm.typeWord")}
                    </label>
                    <input
                      id="delete-account-word"
                      type="text"
                      autoComplete="off"
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      placeholder={t("deleteAccount.confirm.word")}
                      className={inputClass}
                    />
                  </div>
                )}

                {error && (
                  <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-red-300 noto-sans-arabic-medium">
                    {error}
                  </p>
                )}

                {canConfirm && (
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white noto-sans-arabic-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                        {t("deleteAccount.confirm.deleting")}
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                        {t("deleteAccount.confirm.submit")}
                      </>
                    )}
                  </button>
                )}
              </form>
            )}
          </section>

          <p className="text-sm text-gray-400 noto-sans-arabic-medium leading-7">
            <Trans
              i18nKey="deleteAccount.support"
              components={{
                mail: <a href={`mailto:${SUPPORT_EMAIL}`} dir="ltr" className="text-[#4A9EFF] hover:underline" />,
              }}
            />
          </p>
        </div>
      </main>
    </>
  );
};

export default DeleteAccountPage;
