import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import useAuthTokenStore from "../../store/authTokenStore";

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "فشل تحديث كلمة المرور");
    }

    return response.json();
  };

  return useMutation({
    mutationFn: updatePassword,
  });
};
