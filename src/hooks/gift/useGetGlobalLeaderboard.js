import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchGlobalLeaderboard = async (period, pageNumber = 1, pageSize = 10) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(
    `${BASE_URL}/api/gift/leaderboard/${period}?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch global leaderboard");
  }

  return response.json();
};

export const useGetGlobalLeaderboard = (period, pageNumber = 1, pageSize = 10) => {
  return useQuery({
    queryKey: ["global-leaderboard", period, pageNumber, pageSize],
    queryFn: () => fetchGlobalLeaderboard(period, pageNumber, pageSize),
    staleTime: 1000 * 60 * 30, // 30 minutes - aggregate leaderboard data
    gcTime: 1000 * 60 * 60, // Keep in cache for 1 hour
  });
};
