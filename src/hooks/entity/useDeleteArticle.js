import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const deleteArticle = async ({ novelId, articleId }) => {
  const token = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/articles/${articleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete article');
  }

  return response.status === 204 ? { success: true } : response.json();
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArticle,
    onSuccess: (_, variables) => {
      // Invalidate entity details to refetch without deleted article
      queryClient.invalidateQueries({ queryKey: ['entity', variables.novelId] });
    },
  });
};
