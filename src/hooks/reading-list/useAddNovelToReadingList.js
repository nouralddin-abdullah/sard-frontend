import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../constants/base-url";
import { TOKEN_KEY } from "../../constants/token-key";
import Cookies from "js-cookie";
import { toast } from "sonner";

export const useAddNovelToReadingList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ readingListId, novelId }) => {
      const token = Cookies.get(TOKEN_KEY);
      const { data } = await axios.post(
        `${BASE_URL}/api/readinglist/${readingListId}/novels/${novelId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["myReadingLists"] });
      queryClient.invalidateQueries({ queryKey: ["readingList", variables.readingListId] });
      toast.success("تمت إضافة الرواية إلى القائمة بنجاح");
    },
    onError: (error) => {
      // The API's stable code first; the status when there is none.
      const code = error.response?.data?.code;
      const status = error.response?.status;

      if (code === "AlreadyInList") {
        toast.error("الرواية موجودة بالفعل في هذه القائمة");
      } else if (code === "NovelNotPublished") {
        toast.error("لا يمكن إضافة رواية غير منشورة");
      } else if (code === "NotOwner" || status === 403) {
        toast.error("ليس لديك صلاحية للقيام بهذا الإجراء");
      } else if (code === "ReadingListNotFound" || code === "NovelNotFound" || status === 404) {
        toast.error("القائمة أو الرواية غير موجودة");
      } else {
        toast.error("حدث خطأ أثناء إضافة الرواية");
      }
    },
  });
};
