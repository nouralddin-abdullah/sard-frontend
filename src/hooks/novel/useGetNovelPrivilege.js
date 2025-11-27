import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchNovelPrivilege = async (novelId) => {
  if (!novelId) throw new Error("Missing novel identifier");

  const accessToken = Cookies.get(TOKEN_KEY);
  const headers = {
    accept: "*/*",
  };
  
  // Add auth token if user is logged in to check subscription status
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${BASE_URL}/api/novel/${novelId}/privilege`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    // Return null for 404 (privilege not enabled) instead of throwing
    if (response.status === 404) {
      return null;
    }
    throw new Error("Failed to fetch privilege info");
  }

  return response.json();
};

export const useGetNovelPrivilege = (novelId, enabled = true) => {
  return useQuery({
    queryKey: ["novel-privilege", novelId],
    queryFn: () => fetchNovelPrivilege(novelId),
    enabled: !!novelId && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes - privilege info doesn't change often
  });
};
