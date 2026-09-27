// The API answers errors in three shapes: JSON {code, message} when the error has a stable code for clients to
// branch on (AccountSuspended, Blocked, TargetNotFound, ...; the message is Arabic, for people), ASP.NET's
// validation problem {errors: {Field: [messages]}} (Arabic messages), or plain text (often English, not for people).
// Reads the body into {code, message}; message is null unless the API gave one meant for people.
export const readApiError = async (response) => {
  let text = "";
  try {
    text = await response.text();
  } catch {
    return { code: null, message: null };
  }

  try {
    const body = JSON.parse(text);
    if (body && typeof body === "object") {
      const validationMessage = body.errors
        ? Object.values(body.errors).flat().find((message) => typeof message === "string")
        : null;
      return {
        code: typeof body.code === "string" ? body.code : null,
        message: (body.code && body.message) || validationMessage || null,
      };
    }
  } catch {
    // Plain text.
  }
  return { code: null, message: null };
};

// An Error with the API's message (or the fallback) and its code and status, for toasts and branching.
export const apiError = async (response, fallbackMessage) => {
  const { code, message } = await readApiError(response);
  const error = new Error(message || fallbackMessage);
  error.code = code;
  error.status = response.status;
  return error;
};
