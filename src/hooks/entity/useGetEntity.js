import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const fetchEntity = async (novelId, entityId) => {
  const accessToken = Cookies.get(TOKEN_KEY);
  
  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/${entityId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch entity');
  }

  return response.json();
};

export const useGetEntity = (novelId, entityId) => {
  return useQuery({
    queryKey: ['entity', novelId, entityId],
    queryFn: () => fetchEntity(novelId, entityId),
    enabled: !!novelId && !!entityId,
  });
};
