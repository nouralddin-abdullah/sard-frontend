import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { throwIfRateLimited } from "../../utils/rate-limit";
import { readApiError } from "../../utils/api-error";

const login = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/identity/Login`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    // 429 - account temporarily locked after failed sign-ins, or too many requests from this IP
    throwIfRateLimited(response);

    // Handle 403 - Invalid credentials (plain text), or an account a moderator suspended: JSON with code
    // AccountSuspended and an Arabic message saying until when (or that it is permanent).
    if (response.status === 403) {
      const { code, message } = await readApiError(response);
      throw new Error(code === "AccountSuspended" && message ? message : "البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, throw a generic error
      throw new Error("حدث خطأ في الاتصال بالخادم");
    }

    // Check if the HTTP request was successful
    if (!response.ok) {
      // If there's an error message in the response, use it
      throw new Error(data.message || data.title || "Login failed");
    }

    // If we get here and have an accessToken, login was successful
    if (!data.accessToken) {
      throw new Error("No access token received");
    }

    return data.accessToken;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const useLogin = () => {
  return useMutation({
    mutationKey: ["login"],
    mutationFn: login,
  });
};
