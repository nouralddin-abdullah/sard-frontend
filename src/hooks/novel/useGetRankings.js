import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

/**
 * Hook to fetch site-wide rankings
 * @param {string} rankingType - Type of ranking: 'Trending', 'NewArrivals', or 'AllTime'
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {number} pageNumber - Page number (default: 1)
 */
export const useGetRankings = (rankingType, pageSize = 10, pageNumber = 1) => {
  return useQuery({
    queryKey: ["rankings", rankingType, pageSize, pageNumber],
    queryFn: async () => {
      const params = new URLSearchParams({
        PageSize: pageSize.toString(),
        PageNumber: pageNumber.toString(),
      });

      const response = await fetch(
        `${BASE_URL}/api/rankings/site-wide/${rankingType}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch rankings");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
