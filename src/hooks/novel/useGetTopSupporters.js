import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchTopSupporters = async (novelId, topCount = 100) => {
  if (!novelId) throw new Error("Missing novel identifier");

  const accessToken = Cookies.get(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}/api/gift/novel/${novelId}/top-supporters?topCount=${topCount}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch top supporters");
  }

  return response.json();
};

export const useGetTopSupporters = (novelId, topCount = 100, enabled = true) => {
  return useQuery({
    queryKey: ["top-supporters", novelId, topCount],
    queryFn: () => fetchTopSupporters(novelId, topCount),
    enabled: !!novelId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
