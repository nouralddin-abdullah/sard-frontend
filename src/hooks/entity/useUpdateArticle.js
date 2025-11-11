import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const updateArticle = async ({ novelId, articleId, data }) => {
  const token = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/articles/${articleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update article');
  }

  return response.json();
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArticle,
    onSuccess: (_, variables) => {
      // Invalidate all entity queries to refetch updated article
      queryClient.invalidateQueries({ queryKey: ['entity', variables.novelId] });
    },
  });
};
