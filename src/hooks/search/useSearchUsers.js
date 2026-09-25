import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

export const useSearchUsers = ({ query, pageNumber = 1, pageSize = 20, enabled = true }) => {
  const trimmedQuery = query?.trim() ?? "";
  // Signed in, the API also says whom the caller already follows (isFollowing), so the key depends on it.
  const accessToken = Cookies.get(TOKEN_KEY);

  return useQuery({
    queryKey: ["searchUsers", trimmedQuery, pageNumber, pageSize, !!accessToken],
    queryFn: async () => {
      const params = new URLSearchParams({
        query: trimmedQuery,
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      const headers = { accept: "*/*" };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${BASE_URL}/api/search/users?${params}`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enabled && trimmedQuery.length > 0,
  });
};
