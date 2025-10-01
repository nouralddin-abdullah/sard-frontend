import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

const fetchNovelChapters = async (novelId) => {
  const response = await fetch(`${BASE_URL}/api/novel/${novelId}/chapter`, {
    headers: {
      accept: '*/*',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load chapters");
  }

  return response.json();
};

export const useGetNovelChapters = (novelId, options = {}) => {
  return useQuery({
    queryKey: ["novel", novelId, "chapters"],
    queryFn: () => fetchNovelChapters(novelId),
    enabled: Boolean(novelId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...options,
  });
};
