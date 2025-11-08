import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, image, novelId }) => {
      const token = Cookies.get(TOKEN_KEY);
      const formData = new FormData();

      formData.append("content", content);
      
      if (image) {
        // If image is a File object
        if (image instanceof File) {
          formData.append("image", image);
        }
      }

      if (novelId) {
        formData.append("novelId", novelId);
      }

      const response = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch user posts
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },
  });
};
