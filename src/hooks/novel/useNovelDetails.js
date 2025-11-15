import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../../constants/base-url';

const fetchNovelDetails = async (novelSlug) => {
  const response = await fetch(`${BASE_URL}/api/novel/${novelSlug}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch novel details');
  }

  return response.json();
};

export const useNovelDetails = (novelSlug) => {
  return useQuery({
    queryKey: ['novel', novelSlug],
    queryFn: () => fetchNovelDetails(novelSlug),
    enabled: !!novelSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
