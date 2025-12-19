import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

/**
 * Competition status constants
 */
export const CompetitionStatus = {
  Upcoming: "Upcoming",
  Participation: "Participation",
  Judging: "Judging",
  Completed: "Completed",
};

/**
 * Hook to fetch all competitions
 * @param {string} status - Optional status filter: 'Upcoming', 'Participation', 'Judging', 'Completed'
 */
export const useGetCompetitions = (status) => {
  return useQuery({
    queryKey: ["competitions", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) {
        params.append("status", status);
      }

      const url = status 
        ? `${BASE_URL}/api/competition?${params}`
        : `${BASE_URL}/api/competition`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch competitions");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour cache
    gcTime: 1000 * 60 * 60 * 2, // Keep in cache for 2 hours
  });
};

/**
 * Hook to get active competitions (Upcoming + Participation + Judging)
 * These are shown prominently in the navigation
 */
export const useGetActiveCompetitions = () => {
  const { data, ...rest } = useGetCompetitions();

  const activeCompetitions = data?.filter(
    (c) =>
      c.status === CompetitionStatus.Upcoming ||
      c.status === CompetitionStatus.Participation ||
      c.status === CompetitionStatus.Judging
  ) || [];

  const completedCompetitions = data?.filter(
    (c) => c.status === CompetitionStatus.Completed
  ) || [];

  // Calculate total prize from active competitions
  const totalActivePrize = activeCompetitions.reduce(
    (sum, c) => sum + (c.totalPrize || 0),
    0
  );

  return {
    ...rest,
    data,
    activeCompetitions,
    completedCompetitions,
    totalActivePrize,
  };
};
