import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchRecentGifts = async (novelId, pageSize = 4, pageNumber = 1) => {
  if (!novelId) throw new Error("Missing novel identifier");

  const accessToken = Cookies.get(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const queryParams = new URLSearchParams({
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
  });

  const response = await fetch(`${BASE_URL}/api/gift/novel/${novelId}?${queryParams}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recent gifts");
  }

  return response.json();
};

export const useGetRecentGifts = (novelId, pageSize = 4, pageNumber = 1, enabled = true) => {
  return useQuery({
    queryKey: ["recent-gifts", novelId, pageSize, pageNumber],
    queryFn: () => fetchRecentGifts(novelId, pageSize, pageNumber),
    enabled: !!novelId && enabled, // Only fetch when novelId exists AND enabled is true
    staleTime: 1000 * 30, // 30 seconds - refresh more frequently for recent activity
  });
};
