import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";
import { toast } from "sonner";

export const useDeleteReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (readingListId) => {
      const token = Cookies.get(TOKEN_KEY);
      await axios.delete(
        `${BASE_URL}/api/readinglist/${readingListId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["followedReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["readingList"] });
      toast.success("تم حذف القائمة بنجاح");
    },
    onError: (error) => {
      if (error.response?.status === 403) {
        toast.error("ليس لديك صلاحية لحذف هذه القائمة");
      } else if (error.response?.status === 404) {
        toast.error("القائمة غير موجودة");
      } else {
        toast.error("حدث خطأ أثناء حذف القائمة");
      }
    },
  });
};
