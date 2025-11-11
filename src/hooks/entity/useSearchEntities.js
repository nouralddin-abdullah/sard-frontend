import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BASE_URL } from '../../constants/base-url';

const searchEntities = async ({ novelId, query, section, pageNumber = 1, pageSize = 20 }) => {
  const token = localStorage.getItem('token');
  
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (section) params.append('section', section);
  params.append('pageNumber', pageNumber);
  params.append('pageSize', pageSize);

  const response = await axios.get(
    `${BASE_URL}/api/novels/${novelId}/entities/search?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

export const useSearchEntities = (novelId, query, section, pageNumber = 1, pageSize = 20, enabled = true) => {
  return useQuery({
    queryKey: ['entities-search', novelId, query, section, pageNumber, pageSize],
    queryFn: () => searchEntities({ novelId, query, section, pageNumber, pageSize }),
    enabled: enabled && !!novelId,
  });
};
