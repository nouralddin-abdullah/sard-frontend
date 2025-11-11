import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const deleteEntity = async ({ novelId, entityId }) => {
  const token = Cookies.get(TOKEN_KEY);

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/${entityId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete entity');
  }

  return response.status === 204 ? { success: true } : response.json();
};

export const useDeleteEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEntity,
    onSuccess: (_, variables) => {
      // Invalidate entities list
      queryClient.invalidateQueries({ queryKey: ['entities', variables.novelId] });
    },
  });
};
