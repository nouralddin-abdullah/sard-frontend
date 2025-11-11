import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const addRelationship = async ({ novelId, relationshipData }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const response = await axios.post(
    `${BASE_URL}/api/novels/${novelId}/entities/relationships`,
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

export const useAddRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addRelationship,
    onSuccess: (data, variables) => {
      // Invalidate entity queries to refresh relationships
      queryClient.invalidateQueries({ 
        queryKey: ['entity', variables.novelId, variables.relationshipData.sourceEntityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['entity', variables.novelId, variables.relationshipData.targetEntityId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['entities', variables.novelId] 
      });
    },
  });
};
