import { useCallback, useMemo, useState } from "react";

const buildMockChapters = (workId) => {
	const baseDate = Date.now();
	return [
		{
			id: `${workId ?? "demo-work"}-ch-1`,
			title: "A Beacon in the Drift",
			status: "Published",
			synopsis: "Captain Lyra negotiates safe passage while a cosmic storm folds around the Nebula Drift.",
			content: "",
			updatedAt: new Date(baseDate - 1000 * 60 * 60 * 24 * 2).toISOString(),
			createdAt: new Date(baseDate - 1000 * 60 * 60 * 24 * 5).toISOString(),
			wordCount: 2480,
		},
		{
			id: `${workId ?? "demo-work"}-ch-2`,
			title: "Signals from the Ember Belt",
			status: "Draft",
			synopsis: "Mysterious transmissions tempt the crew toward forbidden territory.",
			content: "",
			updatedAt: new Date(baseDate - 1000 * 60 * 60 * 12).toISOString(),
			createdAt: new Date(baseDate - 1000 * 60 * 60 * 24 * 3).toISOString(),
			wordCount: 1895,
		},
		{
			id: `${workId ?? "demo-work"}-ch-3`,
			title: "The Cartographer's Secret",
			status: "Draft",
			synopsis: "An ancient star map hints at alliances that could shatter the fragile truce.",
			content: "",
			updatedAt: new Date(baseDate - 1000 * 60 * 20).toISOString(),
			createdAt: new Date(baseDate - 1000 * 60 * 60 * 20).toISOString(),
			wordCount: 2230,
		},
	];
};

export const useGetWorkChapters = (workId) => {
	const [isPending, setIsPending] = useState(false);
	const [isError, setIsError] = useState(false);

	const data = useMemo(() => buildMockChapters(workId), [workId]);

	const refetch = useCallback(async () => {
		try {
			setIsPending(true);
			setIsError(false);
			return buildMockChapters(workId);
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
