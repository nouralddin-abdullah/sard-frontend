import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { TOKEN_KEY } from '../../constants/token-key';
import { BASE_URL } from '../../constants/base-url';

export const useUpdateGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ novelId, imageId, caption }) => {
      const token = Cookies.get(TOKEN_KEY);
      
      const response = await axios.patch(
        `${BASE_URL}/api/novels/${novelId}/entities/gallery/${imageId}`,
        { 
          imageId,
          caption 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate entity queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: ['entity', variables.novelId],
      });
    },
  });
};
