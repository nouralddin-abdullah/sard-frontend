import { useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { BASE_URL } from '../../constants/base-url';
import { TOKEN_KEY } from '../../constants/token-key';

const createEntity = async ({ novelId, data }) => {
  const token = Cookies.get(TOKEN_KEY);

  if (!token) {
    throw new Error('يجب تسجيل الدخول أولاً');
  }

  // Check if data is FormData (has image) or regular object
  const isFormData = data instanceof FormData;
  
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  
  // Only set Content-Type for JSON, let browser set it for FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}/api/novels/${novelId}/entities`, {
    method: 'POST',
    headers,
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    // Handle different error statuses
    if (response.status === 401) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }
    if (response.status === 403) {
      throw new Error('ليس لديك صلاحية للتعديل على هذه الرواية');
    }
    
    try {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create entity');
    } catch (e) {
      throw new Error('فشل إنشاء الكيان');
    }
  }

  return response.json();
};

export const useCreateEntity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntity,
    onSuccess: (_, variables) => {
      // Invalidate entities list and sections
      queryClient.invalidateQueries({ queryKey: ['entities', variables.novelId] });
      queryClient.invalidateQueries({ queryKey: ['sections', variables.novelId] });
    },
  });
};
