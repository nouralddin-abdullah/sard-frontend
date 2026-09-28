// The API answers errors as JSON {code, message} (a failed result adds success: false; a refused form keeps ASP.NET's
// {errors: {Field: [messages]}} too), or, from older endpoints, plain text. Clients branch on the stable code. Many
// messages are still English: only an Arabic one is meant for people here, so an English one counts as none.
export const arabicMessage = (message) =>
  typeof message === "string" && /[\u0600-\u06FF]/.test(message) ? message : null;

// Reads the body into {code, message}; message is null unless the API gave an Arabic one.
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
        message: arabicMessage(body.message) || arabicMessage(validationMessage),
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
