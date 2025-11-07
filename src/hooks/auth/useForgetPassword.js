import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

export const useForgetPassword = () => {
  const forgetPassword = async ({ email }) => {
    const response = await fetch(`${BASE_URL}/api/identity/forget-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "فشل إرسال رابط إعادة تعيين كلمة المرور");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: forgetPassword,
  });
};
