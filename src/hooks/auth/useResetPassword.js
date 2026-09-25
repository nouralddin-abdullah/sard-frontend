import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { throwIfRateLimited } from "../../utils/rate-limit";

const resetPassword = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/api/identity/reset-password`, {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    throwIfRateLimited(response);

    if (!response.ok) {
      throw new Error("Reset Password failed");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Reset Password error:", error);
    throw error;
  }
};

export const useResetPassword = () => {
  return useMutation({
    mutationKey: ["reset-password"],
    mutationFn: resetPassword,
  });
};
