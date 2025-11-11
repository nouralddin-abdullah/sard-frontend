import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

export const useReorderArticles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ novelId, entityId, orderedArticleIds }) => {
      const token = Cookies.get(TOKEN_KEY);
      
      const response = await fetch(
        `${BASE_URL}/api/novels/${novelId}/entities/${entityId}/articles/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderedArticleIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reorder articles');
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      // Return empty object if no content (204 No Content)
      return {};
    },
    onSuccess: (_, variables) => {
      // Invalidate entity query to refetch updated order
      queryClient.invalidateQueries({
        queryKey: ['entity', variables.novelId, variables.entityId],
      });
    },
  });
};
