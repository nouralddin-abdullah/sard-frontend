import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useCreateReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, description, isPublic, coverImage }) => {
      const token = Cookies.get(TOKEN_KEY);
      const formData = new FormData();
      
      formData.append("name", name);
      if (description) formData.append("description", description);
      formData.append("isPublic", isPublic || false);
      if (coverImage) formData.append("coverImage", coverImage);

      const { data } = await axios.post(
        `${BASE_URL}/api/readinglist`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReadingLists"] });
    },
  });
};
