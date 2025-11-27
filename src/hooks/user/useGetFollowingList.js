import { useInfiniteQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

export const useGetFollowingList = (userId, pageSize = 20, enabled = true) => {
  return useInfiniteQuery({
    queryKey: ["following-list", userId],
    queryFn: async ({ pageParam = 1 }) => {
      const accessToken = Cookies.get(TOKEN_KEY);
      
      const headers = {};
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(
        `${BASE_URL}/api/User/following-list/${userId}?pageNumber=${pageParam}&pageSize=${pageSize}`,
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch following list");
      }

      return response.json();
    },
    getNextPageParam: (lastPage) => {
      const currentPage = Math.ceil(lastPage.itemsTo / pageSize);
      return currentPage < lastPage.totalPages ? currentPage + 1 : undefined;
    },
    enabled: !!userId && enabled,
  });
};
