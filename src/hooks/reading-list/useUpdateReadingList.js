import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";

export const useUpdateReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ readingListId, name, description, isPublic, coverImage }) => {
      const token = Cookies.get(TOKEN_KEY);
      const formData = new FormData();
      
      if (name !== undefined) formData.append("name", name);
      if (description !== undefined) formData.append("description", description);
      if (isPublic !== undefined) formData.append("isPublic", isPublic);
      if (coverImage) formData.append("coverImage", coverImage);

      const { data } = await axios.patch(
        `${BASE_URL}/api/readinglist/${readingListId}`,
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["readingList", variables.readingListId] });
    },
  });
};
