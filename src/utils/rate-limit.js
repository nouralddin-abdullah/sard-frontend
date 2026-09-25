import i18n from "../i18n";

// The API answers 429 when an account is temporarily locked after repeated failed sign-ins, or when
// a client IP hits the per-endpoint limits on the account endpoints (sign-in, sign-up, password emails).
// The 429 body is plain text, so check the status before trying to parse JSON.
export const throwIfRateLimited = (response) => {
  if (response.status === 429) {
    const error = new Error(i18n.t("auth.errors.tooManyRequests"));
    error.status = 429;
    throw error;
  }
};
