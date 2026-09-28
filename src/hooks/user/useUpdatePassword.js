import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import useAuthTokenStore from "../../store/authTokenStore";
import { readApiError } from "../../utils/api-error";

export const useUpdatePassword = () => {
  const { token } = useAuthTokenStore();

  const updatePassword = async ({ currentPassword, newPassword }) => {
    const response = await fetch(`${BASE_URL}/api/User/update-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      // {code, message}: code PasswordMismatch when the current password is wrong; the message may still be English.
      const { code, message } = await readApiError(response);
      throw new Error(
        code === "PasswordMismatch" ? "كلمة المرور الحالية غير صحيحة" : message || "فشل تحديث كلمة المرور"
      );
    }

    return response.json();
  };

  return useMutation({
    mutationFn: updatePassword,
  });
};
