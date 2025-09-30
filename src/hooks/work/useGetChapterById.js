import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";

const fetchChapter = async (workId, chapterId) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/myworks/${workId}/chapters/${chapterId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load chapter");
  }

  return response.json();
};

export const useGetChapterById = (workId, chapterId, options = {}) => {
  return useQuery({
    queryKey: ["my-works", workId, "chapters", chapterId],
    queryFn: () => fetchChapter(workId, chapterId),
    enabled: Boolean(workId) && Boolean(chapterId),
    staleTime: 1000 * 30,
    ...options,
  });
};
