import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

/**
 * Fetches a single competition by ID or slug
 * @param {string} idOrSlug - Competition ID or slug
 * @returns {Promise<Object>} Competition data
 */
const fetchCompetition = async (idOrSlug) => {
  const response = await fetch(`${BASE_URL}/api/competition/${idOrSlug}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch competition");
  }

  return response.json();
};

/**
 * Hook to get a single competition by ID or slug
 * @param {string} idOrSlug - Competition ID or slug
 * @param {Object} options - Additional react-query options
 * @returns {Object} Query result with competition data
 */
export const useGetCompetition = (idOrSlug, options = {}) => {
  return useQuery({
    queryKey: ["competition", idOrSlug],
    queryFn: () => fetchCompetition(idOrSlug),
    enabled: !!idOrSlug,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
    ...options,
  });
};

/**
 * Competition status values
 */
export const CompetitionStatus = {
  UPCOMING: "Upcoming",
  PARTICIPATION: "Participation",
  JUDGING: "Judging",
  COMPLETED: "Completed",
};

export default useGetCompetition;
