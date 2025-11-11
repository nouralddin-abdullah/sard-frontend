import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const uploadGalleryImage = async ({ novelId, entityId, imageFile, caption, orderIndex = 0 }) => {
  const token = Cookies.get(TOKEN_KEY);

  if (!token) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  const formData = new FormData();
  formData.append('imageFile', imageFile);
  if (caption) formData.append('caption', caption);
  formData.append('orderIndex', orderIndex.toString());

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities/${entityId}/gallery`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    if (response.status === 403) {
      throw new Error('ليس لديك صلاحية للتعديل على هذه الرواية');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload image');
    } catch (e) {
      throw new Error('فشل رفع الصورة');
    }
  }

  return response.json();
};

export const useUploadGalleryImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadGalleryImage,
    onSuccess: (_, variables) => {
      // Invalidate entity query to refresh gallery images
      queryClient.invalidateQueries({ queryKey: ['entity', variables.novelId, variables.entityId] });
    },
  });
};
