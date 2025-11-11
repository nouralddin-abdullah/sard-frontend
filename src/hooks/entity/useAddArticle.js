import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const addArticle = async ({ novelId, entityId, data }) => {
  const token = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/${entityId}/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to add article');
  }

  return response.json();
};

export const useAddArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addArticle,
    onSuccess: (_, variables) => {
      // Invalidate entity details to refetch with new article
      queryClient.invalidateQueries({ queryKey: ['entity', variables.novelId, variables.entityId] });
    },
  });
};
