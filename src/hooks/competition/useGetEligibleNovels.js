import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

/**
 * Fetches eligible novels for a competition
 * @param {string} competitionId - Competition ID
 * @returns {Promise<Array>} List of eligible novels
 */
const fetchEligibleNovels = async (competitionId) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(
    `${BASE_URL}/api/competition/${competitionId}/my-eligible-novels`,
    {
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }
    throw new Error("فشل في جلب الروايات المؤهلة");
  }

  return response.json();
};

/**
 * Hook to get eligible novels for a competition
 * @param {string} competitionId - Competition ID
 * @param {Object} options - Additional react-query options
 * @returns {Object} Query result with eligible novels
 */
export const useGetEligibleNovels = (competitionId, options = {}) => {
  return useQuery({
    queryKey: ["eligible-novels", competitionId],
    queryFn: () => fetchEligibleNovels(competitionId),
    enabled: !!competitionId,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    ...options,
  });
};

export default useGetEligibleNovels;
