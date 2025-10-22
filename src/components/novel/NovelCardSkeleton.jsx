const NovelCardSkeleton = () => {
  return (
    <div 
      className="flex gap-4 rounded-2xl border p-4 animate-pulse"
      style={{ backgroundColor: '#3C3C3C', borderColor: '#5A5A5A' }}
    >
      {/* Cover Image Skeleton */}
      <div 
        className="w-28 h-36 flex-shrink-0 rounded-xl"
        style={{ backgroundColor: '#5A5A5A' }}
      ></div>

      {/* Content Skeleton */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        {/* Title and Genres */}
        <div>
          <div 
            className="h-4 rounded mb-2 w-3/4"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
          <div 
            className="h-4 rounded mb-3 w-1/2"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
          
          {/* Genre badges */}
          <div className="flex gap-1 mb-3">
            <div 
              className="h-5 w-16 rounded-full"
              style={{ backgroundColor: '#5A5A5A' }}
            ></div>
            <div 
              className="h-5 w-16 rounded-full"
              style={{ backgroundColor: '#5A5A5A' }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div 
            className="h-3 rounded w-12"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
          <div 
            className="h-3 rounded w-12"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
          <div 
            className="h-3 rounded w-12"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
          <div 
            className="h-3 rounded w-12"
            style={{ backgroundColor: '#5A5A5A' }}
          ></div>
        </div>

        {/* Last Updated */}
        <div 
          className="h-3 rounded w-20 mt-2"
          style={{ backgroundColor: '#5A5A5A' }}
        ></div>
      </div>
    </div>
  );
};

export default NovelCardSkeleton;
