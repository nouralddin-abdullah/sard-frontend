import { useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

/**
 * Join a competition with a novel
 * @param {Object} data - Join data
 * @param {string} data.competitionId - Competition ID
 * @param {string} data.novelId - Novel ID
 * @returns {Promise<Object>} Join result
 */
const joinCompetition = async ({ competitionId, novelId }) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  const headers = {
    "Content-Type": "application/json",
  };
  
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  
  const response = await fetch(
    `${BASE_URL}/api/competition/${competitionId}/join`,
    {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify({ novelId }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("يجب تسجيل الدخول أولاً");
    }
    if (response.status === 400) {
      const error = await response.json();
      throw new Error(error.message || "الرواية غير مؤهلة للمشاركة");
    }
    throw new Error("فشل في الانضمام للمسابقة");
  }

  return response.json();
};

/**
 * Hook to join a competition with a novel
 * @returns {Object} Mutation result
 */
export const useJoinCompetition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: joinCompetition,
    onSuccess: (data, variables) => {
      // Invalidate eligible novels query to refresh the list
      queryClient.invalidateQueries(["eligible-novels", variables.competitionId]);
      // Invalidate competition query to refresh participant count
      queryClient.invalidateQueries(["competition", variables.competitionId]);
    },
  });
};

export default useJoinCompetition;
