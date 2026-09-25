/**
 * Refetch a novel's details after something changed its stats (reviews, gifts).
 *
 * The novel page caches its details under ["novel", slug] (useGetNovelBySlug), while mutations only know the
 * novel id, so invalidating ["novel", novelId] alone never reached the page: the rating, review count and
 * gift totals stayed stale until a reload. This also matches the slug-keyed entry by the id in its data.
 */
export const invalidateNovelDetails = (queryClient, novelId) => {
  if (!novelId) return;
  queryClient.invalidateQueries({ queryKey: ["novel", novelId] });
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey[0] === "novel" &&
      query.queryKey.length === 2 &&
      query.state.data?.id === novelId,
  });
};
