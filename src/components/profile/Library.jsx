import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import CreateReadingListModal from "./CreateReadingListModal";
import { useGetMyReadingLists } from "../../hooks/reading-list/useGetMyReadingLists";
import { useGetUserReadingLists } from "../../hooks/reading-list/useGetUserReadingLists";
import { useGetFollowedReadingLists } from "../../hooks/reading-list/useGetFollowedReadingLists";
import { useGetLoggedInUser } from "../../hooks/user/useGetLoggedInUser";

// Placeholder data - fallback only
const placeholderData = {
  userReadingLists: [
    {
      id: "1",
      name: "قراءة لاحقاً",
      description: "خاصة",
      totalNovels: 45,
      displayLimit: 4,
      memeImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop",
      novels: [
        {
          id: "1",
          title: "Son of Hades",
          coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        },
        {
          id: "2", 
          title: "Mystery Novel",
          coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
        },
        {
          id: "3",
          title: "Adventure Story",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        },
        {
          id: "4",
          title: "Fantasy World",
          coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
        },
      ],
    },
    {
      id: "2",
      name: "روايات تقطع شرايينك بالطول بعد قرائتها",
      description: "عامة",
      totalNovels: 23,
      displayLimit: 4,
      memeImage: "https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=600&fit=crop",
      novels: [
        {
          id: "5",
          title: "Sinbad",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        },
        {
          id: "6",
          title: "Dark Fantasy",
          coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
        },
        {
          id: "7",
          title: "Epic Tale",
          coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        },
        {
          id: "8",
          title: "Mystery Book",
          coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
        },
      ],
    },
  ],
  followedReadingLists: [
    {
      id: "3",
      name: "روايات قصيرة",
      description: "عامة",
      totalNovels: 23,
      displayLimit: 4,
      memeImage: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&h=600&fit=crop",
      novels: [
        {
          id: "9",
          title: "Short Story 1",
          coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop",
        },
        {
          id: "10",
          title: "Short Story 2",
          coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop",
        },
        {
          id: "11",
          title: "Short Story 3",
          coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop",
        },
        {
          id: "12",
          title: "Short Story 4",
          coverImage: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop",
        },
      ],
    },
  ],
};

const Library = ({ username }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data: loggedInUser } = useGetLoggedInUser();
  
  // Check if viewing own profile or another user's profile
  const isOwnProfile = loggedInUser?.userName === username;
  
  // Truncate username if too long (for display purposes)
  const truncateUsername = (name, maxLength = 15) => {
    if (!name) return '';
    return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
  };
  
  // Fetch reading lists based on profile type
  // Own profile: Get all lists (public + private) using /my-lists
  // Other user: Get only public lists using /user/{userName}
  const { 
    data: myListsData, 
    isLoading: myListsLoading,
    error: myListsError 
  } = useGetMyReadingLists(1, 12, { enabled: isOwnProfile });
  
  const { 
    data: userListsData, 
    isLoading: userListsLoading,
    error: userListsError 
  } = useGetUserReadingLists(username, 1, 12, { enabled: !isOwnProfile });
  
  // Only fetch followed lists if viewing own profile
  const { 
    data: followedListsData, 
    isLoading: followedListsLoading 
  } = useGetFollowedReadingLists(1, 12, { enabled: isOwnProfile });
  
  const shouldShowFollowedLists = isOwnProfile;
  const isLoading = isOwnProfile 
    ? (myListsLoading || followedListsLoading)
    : userListsLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    );
  }
  
  const error = isOwnProfile ? myListsError : userListsError;
  if (error) {
    return (
      <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center text-white">
        <p className="noto-sans-arabic-medium">حدث خطأ في تحميل القوائم</p>
      </div>
    );
  }
  
  // Use myListsData for own profile (includes private lists), userListsData for others (public only)
  const userLists = isOwnProfile 
    ? (myListsData?.items || [])
    : (userListsData?.items || []);
  const followedLists = followedListsData?.items || [];

  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white py-8 px-4 sm:px-6 lg:px-12">
      <div className="w-[95%] mx-auto space-y-12">
        
        {/* Your Reading Lists Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold noto-sans-arabic-extrabold">
              {isOwnProfile ? "قوائم قرائتك" : `قوائم ${truncateUsername(username)}`}
            </h2>
            {isOwnProfile && (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="hover:opacity-80 transition-opacity duration-300"
              >
                <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.5 0C10.5199 0 0 10.5199 0 23.5C0 36.4801 10.5199 47 23.5 47C36.4801 47 47 36.4801 47 23.5C47 10.5199 36.4801 0 23.5 0ZM37.2053 25.4553C37.2053 26.5385 36.3332 27.4105 35.25 27.4105H27.4197V35.25C27.4197 36.3332 26.5477 37.2053 25.4645 37.2053H21.5447C20.4615 37.2053 19.5895 36.324 19.5895 35.25V27.4197H11.75C10.6668 27.4197 9.79473 26.5385 9.79473 25.4645V21.5447C9.79473 20.4615 10.6668 19.5895 11.75 19.5895H19.5803V11.75C19.5803 10.6668 20.4523 9.79473 21.5355 9.79473H25.4553C26.5385 9.79473 27.4105 10.676 27.4105 11.75V19.5803H35.25C36.3332 19.5803 37.2053 20.4615 37.2053 21.5355V25.4553Z" fill="white"/>
                </svg>
              </button>
            )}
          </div>

          {userLists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                {isOwnProfile ? "لم تقم بإنشاء أي قوائم قراءة بعد" : "لا توجد قوائم قراءة عامة"}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {userLists.map((list) => (
              <div key={list.id} className="transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left side - Cover image as card */}
                  <Link to={`/reading-list/${list.id}`} className="w-full md:w-[300px] flex-shrink-0">
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                      <img
                        src={list.coverImageUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&h=600&fit=crop"}
                        alt={list.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </Link>

                  {/* Right side - Novel covers in grid */}
                  <div className="flex-1 flex flex-col">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold noto-sans-arabic-bold mb-2">{list.name}</h3>
                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                          {list.isPublic ? "عامة" : "خاصة"}
                        </p>
                        <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                          {list.followersCount} متابع
                        </p>
                      </div>
                    </div>

                    {list.previewNovels && list.previewNovels.length > 0 && (
                      <div className="bg-[#666666] rounded-xl p-2 md:p-4 w-full md:w-fit" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                        {/* Mobile: 3 cards grid - 2 novels + 1 with +X remaining */}
                        <div className="md:hidden grid grid-cols-3 gap-2">
                          {list.previewNovels.slice(0, 3).map((novel, index) => (
                            <div key={novel.novelId} className="relative group">
                              {/* Show +X on 3rd card if more than 2 novels exist */}
                              {index === 2 && list.novelsCount > 2 ? (
                                <Link to={`/reading-list/${list.id}`}>
                                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                    <img
                                      src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                      alt={novel.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                      <span className="text-xl font-bold noto-sans-arabic-extrabold text-white">
                                        +{list.novelsCount - 2}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <Link to={`/novel/${novel.slug}`}>
                                  <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                    <img
                                      src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                      alt={novel.title}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Desktop: 2 novels + 1 with +X remaining */}
                        <div className="hidden md:flex flex-wrap gap-3 max-w-full">
                          {list.previewNovels.slice(0, 3).map((novel, index) => (
                            <div key={novel.novelId} className="relative group w-[180px] flex-shrink-0">
                              {/* Show +X on 3rd card if more than 2 novels exist */}
                              {index === 2 && list.novelsCount > 2 ? (
                                <Link to={`/reading-list/${list.id}`}>
                                  <div className="aspect-[3/4] rounded-lg overflow-hidden relative" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                    <img
                                      src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                      alt={novel.title}
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
                                      <span className="text-3xl font-bold noto-sans-arabic-extrabold text-white">
                                        +{list.novelsCount - 2}
                                      </span>
                                    </div>
                                  </div>
                                </Link>
                              ) : (
                                <Link to={`/novel/${novel.slug}`}>
                                  <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                    <img
                                      src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                      alt={novel.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-auto pt-4 text-[#686868] noto-sans-arabic-medium text-lg">
                      {list.novelsCount} رواية
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Followed Reading Lists Section - Only show if viewing own profile */}
        {shouldShowFollowedLists && (
          <div>
            <h2 className="text-3xl font-bold noto-sans-arabic-extrabold mb-6">قوائم قراءة تتابعها</h2>
            
            {followedLists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                  لا تتابع أي قوائم قراءة بعد
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {followedLists.map((list) => (
                  <div key={list.id} className="transition-all duration-300">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {/* Left side - Cover image as card */}
                      <Link to={`/reading-list/${list.id}`} className="w-full md:w-[300px] flex-shrink-0">
                        <div className="aspect-[3/4] relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                          <img
                            src={list.coverImageUrl || "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&h=600&fit=crop"}
                            alt={list.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>
                      </Link>

                      {/* Right side - Novel covers in grid */}
                      <div className="flex-1 flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-2xl font-bold noto-sans-arabic-bold mb-2">{list.name}</h3>
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                              {list.isPublic ? "عامة" : "خاصة"}
                            </p>
                            <p className="text-[#686868] noto-sans-arabic-medium text-lg">
                              {list.followersCount} متابع
                            </p>
                          </div>
                        </div>

                        {list.previewNovels && list.previewNovels.length > 0 && (
                          <div className="bg-[#666666] rounded-xl p-2 md:p-4 w-full md:w-fit" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                            {/* Mobile: 3 cards grid - 2 novels + 1 with +X remaining */}
                            <div className="md:hidden grid grid-cols-3 gap-2">
                              {list.previewNovels.slice(0, 3).map((novel, index) => (
                                <div key={novel.novelId} className="relative group">
                                  {/* Show +X on 3rd card if more than 2 novels exist */}
                                  {index === 2 && list.novelsCount > 2 ? (
                                    <Link to={`/reading-list/${list.id}`}>
                                      <div className="aspect-[3/4] rounded-lg overflow-hidden relative" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                        <img
                                          src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                          alt={novel.title}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                          <span className="text-xl font-bold noto-sans-arabic-extrabold text-white">
                                            +{list.novelsCount - 2}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  ) : (
                                    <Link to={`/novel/${novel.slug}`}>
                                      <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                        <img
                                          src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                          alt={novel.title}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Desktop: 2 novels + 1 with +X remaining */}
                            <div className="hidden md:flex flex-wrap gap-3 max-w-full">
                              {list.previewNovels.slice(0, 3).map((novel, index) => (
                                <div key={novel.novelId} className="relative group w-[180px] flex-shrink-0">
                                  {/* Show +X on 3rd card if more than 2 novels exist */}
                                  {index === 2 && list.novelsCount > 2 ? (
                                    <Link to={`/reading-list/${list.id}`}>
                                      <div className="aspect-[3/4] rounded-lg overflow-hidden relative" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                        <img
                                          src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                          alt={novel.title}
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
                                          <span className="text-3xl font-bold noto-sans-arabic-extrabold text-white">
                                            +{list.novelsCount - 2}
                                          </span>
                                        </div>
                                      </div>
                                    </Link>
                                  ) : (
                                    <Link to={`/novel/${novel.slug}`}>
                                      <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                                        <img
                                          src={novel.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop"}
                                          alt={novel.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                      </div>
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto pt-4 text-[#686868] noto-sans-arabic-medium text-lg">
                          {list.novelsCount} رواية
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create Reading List Modal */}
      <CreateReadingListModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default Library;
