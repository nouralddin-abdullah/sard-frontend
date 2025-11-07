import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

export const useSearchNovels = ({
  query = "",
  genres = [],
  status = "",
  chapterRanges = [],
  sortBy = "Relevance",
  pageNumber = 1,
  pageSize = 20,
}) => {
  return useQuery({
    queryKey: [
      "searchNovels",
      query,
      genres,
      status,
      chapterRanges,
      sortBy,
      pageNumber,
      pageSize,
    ],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams();

      if (query?.trim()) {
        params.append("query", query.trim());
      }

      genres?.forEach((genre) => {
        params.append("genres", genre);
      });

      if (status) {
        params.append("status", status);
      }

      chapterRanges?.forEach((range) => {
        params.append("chapterRanges", range);
      });

      if (sortBy) {
        params.append("sortBy", sortBy);
      }

      params.append("pageNumber", pageNumber);
      params.append("pageSize", pageSize);

      const response = await fetch(
        `${BASE_URL}/api/search/novels?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to search novels");
      }

      return response.json();
    },
    enabled: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
