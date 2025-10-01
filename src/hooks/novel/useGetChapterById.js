import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";

const fetchChapterById = async (novelId, chapterId) => {
  const response = await fetch(`${BASE_URL}/api/novel/${novelId}/chapter/${chapterId}`, {
    headers: {
      accept: '*/*',
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load chapter");
  }

  return response.json();
};

export const useGetChapterById = (novelId, chapterId, options = {}) => {
  return useQuery({
    queryKey: ["novel", novelId, "chapter", chapterId],
    queryFn: () => fetchChapterById(novelId, chapterId),
    enabled: Boolean(novelId) && Boolean(chapterId),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    ...options,
  });
};
