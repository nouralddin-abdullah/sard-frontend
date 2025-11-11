import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const updateEntity = async ({ novelId, entityId, data }) => {
  const token = Cookies.get(TOKEN_KEY);

  // Check if data is FormData or regular object
  const isFormData = data instanceof FormData;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // Only set Content-Type for JSON, let browser set it for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/${entityId}`, {
    method: 'PATCH',
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update entity');
  }

  return response.json();
};

export const useUpdateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEntity,
    onSuccess: (_, variables) => {
      // Invalidate entity details and list
      queryClient.invalidateQueries({ queryKey: ['entity', variables.novelId, variables.entityId] });
      queryClient.invalidateQueries({ queryKey: ['entities', variables.novelId] });
    },
  });
};
