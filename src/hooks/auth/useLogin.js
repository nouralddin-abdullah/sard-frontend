import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { throwIfRateLimited } from "../../utils/rate-limit";

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

    // Handle 403 - Invalid credentials (before parsing JSON)
    if (response.status === 403) {
      throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
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
