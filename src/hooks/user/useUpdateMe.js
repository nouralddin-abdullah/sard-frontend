import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";

const updateMe = async (formData) => {
  const token = Cookies.get(TOKEN_KEY);

  try {
    // Build query parameters from FormData text fields
    const queryParams = new URLSearchParams();
    const fileFields = new FormData();
    let hasFiles = false;

    for (const [key, value] of formData.entries()) {
      // Check if it's a file (ProfilePhoto or ProfileBanner)
      if (value instanceof File) {
        fileFields.append(key, value);
        hasFiles = true;
      } else {
        // Text fields go to query params
        queryParams.append(key, value);
      }
    }

    const url = `${BASE_URL}/api/User/update-me${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const response = await fetch(url, {
      method: "PATCH",
      body: hasFiles ? fileFields : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useUpdateMe = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
    },
  });
};
