import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

/**
 * Hook to fetch genre-specific rankings
 * @param {string} genreSlug - Genre slug (e.g., 'romance', 'action')
 * @param {string} rankingType - Type of ranking: 'new', 'trending', or 'top_rated'
 * @param {number} pageSize - Number of items per page (default: 10)
 * @param {number} pageNumber - Page number (default: 1)
 */
export const useGetGenreRankings = (genreSlug, rankingType, pageSize = 10, pageNumber = 1) => {
  return useQuery({
    queryKey: ["genreRankings", genreSlug, rankingType, pageSize, pageNumber],
    queryFn: async () => {
      const params = new URLSearchParams({
        PageSize: pageSize.toString(),
        PageNumber: pageNumber.toString(),
      });

      const response = await fetch(
        `${BASE_URL}/api/rankings/${genreSlug}/${rankingType}?${params}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch genre rankings");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour - rankings are recalculated daily
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
};
