import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

/**
 * Fetches user's participations across all competitions
 * @returns {Promise<Array>} List of user's competition participations
 */
const fetchMyParticipations = async () => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  if (!accessToken) {
    return [];
  }
  
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };
  
  const response = await fetch(
    `${BASE_URL}/api/competition/my-participations`,
    {
      headers,
      credentials: "include",
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      return [];
    }
    throw new Error("فشل في جلب مشاركاتك");
  }

  return response.json();
};

/**
 * Hook to get user's participations in competitions
 * @returns {Object} Query result with user's participations
 */
export const useGetMyParticipations = () => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  return useQuery({
    queryKey: ["my-participations"],
    queryFn: fetchMyParticipations,
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

export default useGetMyParticipations;
