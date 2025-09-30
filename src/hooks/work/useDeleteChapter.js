import { useCallback, useState } from "react";

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const useDeleteChapter = () => {
	const [isPending, setIsPending] = useState(false);

	const mutateAsync = useCallback(async () => {
		setIsPending(true);
		await delay();
		setIsPending(false);
	}, []);

	return {
		mutateAsync,
		isPending,
	};
};
