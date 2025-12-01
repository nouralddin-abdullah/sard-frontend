import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../../constants/base-url';

const fetchNovelRecommendations = async (novelId, count = 5) => {
  const response = await fetch(`${BASE_URL}/api/novel/${novelId}/recommendations?count=${count}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch novel recommendations');
  }

  return response.json();
};

export const useGetNovelRecommendations = (novelId, count = 5, enabled = true) => {
  return useQuery({
    queryKey: ['novelRecommendations', novelId, count],
    queryFn: () => fetchNovelRecommendations(novelId, count),
    enabled: !!novelId && enabled,
    staleTime: 60 * 60 * 1000, // 1 hour cache
    gcTime: 60 * 60 * 1000, // Keep in cache for 1 hour (formerly cacheTime)
  });
};
