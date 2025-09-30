const WorkSkeletonGrid = ({ itemCount = 6 }) => {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: itemCount }).map((_, index) => (
        <div
          key={index}
          className="bg-zinc-800/70 border border-zinc-700/60 rounded-3xl p-6 animate-pulse space-y-6"
        >
          <div className="h-40 bg-zinc-700/70 rounded-2xl" />
          <div className="h-5 bg-zinc-700/60 rounded-full w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-zinc-700/50 rounded-full w-full" />
            <div className="h-4 bg-zinc-700/50 rounded-full w-5/6" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 bg-zinc-700/40 rounded-lg flex-1" />
            <div className="h-9 bg-zinc-700/40 rounded-lg flex-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkSkeletonGrid;
