import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const deleteRelationship = async ({ novelId, relationshipId }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const response = await axios.delete(
    `${BASE_URL}/api/novels/${novelId}/entities/relationships/${relationshipId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

export const useDeleteRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRelationship,
    onSuccess: (data, variables) => {
      // Invalidate all entity queries to refresh relationships
      queryClient.invalidateQueries({ 
        queryKey: ['entities'] 
      });
    },
  });
};
