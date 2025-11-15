import { useInfiniteQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchNotifications = async ({ pageParam = 1, unreadOnly = false }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const params = new URLSearchParams({
    pageNumber: pageParam.toString(),
    pageSize: "20",
  });

  if (unreadOnly) {
    params.append("unreadOnly", "true");
  }

  const response = await fetch(
    `${BASE_URL}/api/notifications?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

export const useGetNotifications = (unreadOnly = false) => {
  return useInfiniteQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: ({ pageParam = 1 }) => fetchNotifications({ pageParam, unreadOnly }),
    getNextPageParam: (lastPage) => {
      if (lastPage.pageNumber < lastPage.totalPages) {
        return lastPage.pageNumber + 1;
      }
      return undefined;
    },
    staleTime: 30000, // 30 seconds
  });
};
