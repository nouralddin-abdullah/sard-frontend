import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const updateRelationship = async ({ novelId, relationshipId, relationshipData }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const response = await axios.patch(
    `${BASE_URL}/api/novels/${novelId}/entities/relationships/${relationshipId}`,
    relationshipData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  return response.data;
};

export const useUpdateRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRelationship,
    onSuccess: (data, variables) => {
      // Invalidate entity queries to refresh relationships
      // We need to invalidate both source and target entities
      queryClient.invalidateQueries({ 
        queryKey: ['entity', variables.novelId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['entities', variables.novelId] 
      });
    },
  });
};
