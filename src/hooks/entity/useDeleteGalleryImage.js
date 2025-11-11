import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const deleteGalleryImage = async ({ novelId, imageId }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const response = await axios.delete(
    `${BASE_URL}/api/novels/${novelId}/entities/gallery/${imageId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

export const useDeleteGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: (data, variables) => {
      // Invalidate entity queries to refresh gallery
      queryClient.invalidateQueries({ 
        queryKey: ['entity', variables.novelId] 
      });
    },
  });
};
