import Button from "../ui/button";
import WorkCard from "./WorkCard";

const WorkGrid = ({
  works,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {works.map((work, index) => (
          <WorkCard key={work.id || work.slug || index} work={work} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button onClick={onLoadMore} isLoading={isFetchingNextPage} variant="outline">
            Load more
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkGrid;
