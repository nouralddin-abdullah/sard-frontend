import { useQuery } from '@tanstack/react-query';
import { BASE_URL } from '../../constants/base-url';

const fetchEntities = async (novelId, { section, pageNumber = 1, pageSize = 20 }) => {
  const params = new URLSearchParams({
    pageNumber: pageNumber.toString(),
    pageSize: pageSize.toString()
  });

  if (section) {
    params.append('section', section);
  }

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch entities');
  }

  return response.json();
};

export const useGetEntities = (novelId, filters) => {
  return useQuery({
    queryKey: ['entities', novelId, filters],
    queryFn: () => fetchEntities(novelId, filters),
    enabled: !!novelId,
  });
};
