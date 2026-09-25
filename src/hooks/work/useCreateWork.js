import { useMutation } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { coverUploadErrorFrom } from "./coverUploadError";

const createWork = async (formData) => {
  const accessToken = Cookies.get(TOKEN_KEY);

  try {
    const response = await fetch(`${BASE_URL}/api/myworks`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) throw await coverUploadErrorFrom(response, "Error creating Novel");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const useCreateWork = () => {
  return useMutation({
    mutationKey: ["my-works"],
    mutationFn: createWork,
  });
};
