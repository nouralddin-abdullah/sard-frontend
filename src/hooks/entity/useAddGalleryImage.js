import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const addGalleryImage = async ({ novelId, entityId, formData }) => {
  const token = Cookies.get(TOKEN_KEY);
  
  const response = await axios.post(
    `${BASE_URL}/api/novels/${novelId}/entities/${entityId}/gallery`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  
  return response.data;
};

export const useAddGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addGalleryImage,
    onSuccess: (data, variables) => {
      // Invalidate entity query to refresh gallery
      queryClient.invalidateQueries({ 
        queryKey: ['entity', variables.novelId, variables.entityId] 
      });
    },
  });
};
