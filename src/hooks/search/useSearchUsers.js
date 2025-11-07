import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

export const useSearchUsers = ({ query, pageNumber = 1, pageSize = 20 }) => {
  return useQuery({
    queryKey: ["searchUsers", query, pageNumber, pageSize],
    queryFn: async () => {
      if (!query || query.trim().length === 0) {
        return {
          items: [],
          totalPages: 0,
          totalItemsCount: 0,
          itemsFrom: 0,
          itemsTo: 0,
        };
      }

      const params = new URLSearchParams({
        query: query.trim(),
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`${BASE_URL}/api/search/users?${params}`, {
        method: "GET",
        headers: {
          accept: "*/*",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to search users");
      }

      return response.json();
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: query.trim().length > 0,
  });
};
