import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

export const useSearchSuggestions = (query) => {
  return useQuery({
    queryKey: ["searchSuggestions", query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await fetch(
        `${BASE_URL}/api/search/suggest?query=${encodeURIComponent(query.trim())}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch suggestions");
      }

      return response.json();
    },
    enabled: query?.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
