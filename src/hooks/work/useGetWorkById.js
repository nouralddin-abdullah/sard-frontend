import { useCallback, useMemo, useState } from "react";
import mainPicture from "../../assets/mainPicture.jpg";

const buildMockWork = (workId) => ({
	id: workId ?? "demo-work",
	title: "Nebula Drift",
	summary:
		"Pilot a mythic starship while your crew negotiates uneasy truces between rival houses. This workspace keeps every chapter aligned before you go live.",
	status: "Ongoing",
	coverImageUrl: mainPicture,
	genresList: [
		{ id: 1, name: "Space Opera" },
		{ id: 2, name: "Adventure" },
	],
});

export const useGetWorkById = (workId) => {
	const [isPending, setIsPending] = useState(false);
	const [isError, setIsError] = useState(false);

	const data = useMemo(() => buildMockWork(workId), [workId]);

	const refetch = useCallback(async () => {
		try {
			setIsPending(true);
			setIsError(false);
			return buildMockWork(workId);
		} catch (error) {
			setIsError(true);
			throw error;
		} finally {
			setIsPending(false);
		}
	}, [workId]);

	return useMemo(
		() => ({
			data,
			isPending,
			isError,
			refetch,
		}),
		[data, isError, isPending, refetch]
	);
};
