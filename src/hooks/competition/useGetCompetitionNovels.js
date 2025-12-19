import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

/**
 * Fetches novels participating in a competition
 * @param {string} competitionId - Competition ID
 * @param {Object} params - Query parameters
 * @param {string} params.sortBy - Sort by 'top' (points) or 'newest' (joinedAt)
 * @param {number} params.pageNumber - Page number (1-based)
 * @param {number} params.pageSize - Items per page
 * @returns {Promise<Object>} Paginated list of competition novels
 */
const fetchCompetitionNovels = async (competitionId, { sortBy = 'top', pageNumber = 1, pageSize = 20 } = {}) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const params = new URLSearchParams({
    sortBy,
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString(),
  });
  
  const response = await fetch(
    `${BASE_URL}/api/competition/${competitionId}/novels?${params}`,
    {
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("فشل في جلب المشاركات");
  }

  return response.json();
};

/**
 * Hook to get novels participating in a competition
 * @param {string} competitionId - Competition ID
 * @param {Object} options - Query options
 * @param {string} options.sortBy - Sort by 'top' or 'newest'
 * @param {number} options.pageNumber - Page number
 * @param {number} options.pageSize - Items per page
 * @returns {Object} Query result with competition novels
 */
export const useGetCompetitionNovels = (competitionId, { sortBy = 'top', pageNumber = 1, pageSize = 20 } = {}) => {
  return useQuery({
    queryKey: ["competition-novels", competitionId, sortBy, pageNumber, pageSize],
    queryFn: () => fetchCompetitionNovels(competitionId, { sortBy, pageNumber, pageSize }),
    enabled: !!competitionId,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    keepPreviousData: true, // Keep previous data while fetching new page
  });
};

export default useGetCompetitionNovels;
