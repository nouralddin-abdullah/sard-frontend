import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const markAllNotificationsRead = async () => {
  const token = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/notifications/read-all`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all notifications as read");
  }

  // 204 No Content doesn't have a body
  if (response.status === 204) {
    return { success: true };
  }

  return response.json();
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate notifications queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      // Also invalidate unread count
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    },
  });
};
