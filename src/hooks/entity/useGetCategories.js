import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const fetchSections = async (novelId) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/sections`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch sections');
  }

  return response.json();
};

export const useGetSections = (novelId) => {
  return useQuery({
    queryKey: ['sections', novelId],
    queryFn: () => fetchSections(novelId),
    enabled: !!novelId,
  });
};

// Keep backward compatibility alias
export const useGetCategories = useGetSections;
