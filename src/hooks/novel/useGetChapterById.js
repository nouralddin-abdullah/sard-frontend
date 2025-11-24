import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '../../constants/token-key';

const fetchChapterById = async (novelId, chapterId) => {
  const token = Cookies.get(TOKEN_KEY);
  const headers = {
    accept: '*/*',
  };
  
  // Add auth token if user is logged in to check privilege access
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${BASE_URL}/api/novel/${novelId}/chapter/${chapterId}`, {
    headers,
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
