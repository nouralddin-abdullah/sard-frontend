import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../../constants/base-url";
import { throwIfRateLimited } from "../../utils/rate-limit";

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["register"],
    mutationFn: async (formData) => {
      try {
        const response = await fetch(`${BASE_URL}/api/identity/Register`, {
          method: "POST",
          body: formData,
        });

        throwIfRateLimited(response);

        const data = await response.json();

        // Check if the registration was successful
        if (!data.result?.success) {
          // Throw an error with the message from the API
          throw new Error(data.result?.message || "Registration failed");
        }

        // Only return the token if registration was successful
        return data.accessToken;
      } catch (error) {
        console.error(error);
        // Re-throw the error so React Query can handle it properly
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });
};
