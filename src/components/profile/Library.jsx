import React, { useState } from "react";
import { Link } from "react-router-dom";
import CreateReadingListModal from "./CreateReadingListModal";

// Placeholder data - replace with API calls later
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

  return (
    <div className="min-h-screen bg-[#2C2C2C] text-white py-8 px-4 sm:px-6 lg:px-12">
      <div className="w-[95%] mx-auto space-y-12">
        
        {/* Your Reading Lists Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold noto-sans-arabic-extrabold">قوائم قرائتك</h2>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="hover:opacity-80 transition-opacity duration-300"
            >
              <svg width="47" height="47" viewBox="0 0 47 47" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.5 0C10.5199 0 0 10.5199 0 23.5C0 36.4801 10.5199 47 23.5 47C36.4801 47 47 36.4801 47 23.5C47 10.5199 36.4801 0 23.5 0ZM37.2053 25.4553C37.2053 26.5385 36.3332 27.4105 35.25 27.4105H27.4197V35.25C27.4197 36.3332 26.5477 37.2053 25.4645 37.2053H21.5447C20.4615 37.2053 19.5895 36.324 19.5895 35.25V27.4197H11.75C10.6668 27.4197 9.79473 26.5385 9.79473 25.4645V21.5447C9.79473 20.4615 10.6668 19.5895 11.75 19.5895H19.5803V11.75C19.5803 10.6668 20.4523 9.79473 21.5355 9.79473H25.4553C26.5385 9.79473 27.4105 10.676 27.4105 11.75V19.5803H35.25C36.3332 19.5803 37.2053 20.4615 37.2053 21.5355V25.4553Z" fill="white"/>
              </svg>
            </button>
          </div>

          <div className="space-y-8">
            {placeholderData.userReadingLists.map((list) => (
              <div key={list.id} className="transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left side - Meme/Featured image as card */}
                  <Link to={`/profile/${username}/list/${list.id}`} className="w-full md:w-[300px] flex-shrink-0">
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                      <img
                        src={list.memeImage}
                        alt={list.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </Link>

                  {/* Right side - Novel covers in grid */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold noto-sans-arabic-bold mb-2">{list.name}</h3>
                      <p className="text-[#686868] noto-sans-arabic-medium text-lg">{list.description}</p>
                    </div>

                    <div className="bg-[#666666] rounded-xl p-4 w-fit" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                      <div className="flex flex-wrap gap-3 max-w-full">
                        {list.novels.map((novel, index) => (
                          <div key={novel.id} className="relative group w-[180px] flex-shrink-0">
                            <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                              <img
                                src={novel.coverImage}
                                alt={novel.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            
                            {/* +Number overlay on last item if there are more novels */}
                            {index === list.novels.length - 1 && list.totalNovels > list.displayLimit && (
                              <Link to={`/profile/${username}/list/${list.id}`}>
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
                                  <span className="text-3xl font-bold noto-sans-arabic-extrabold text-white">
                                    +{list.totalNovels - list.displayLimit}
                                  </span>
                                </div>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-[#686868] noto-sans-arabic-medium text-lg">
                      {list.totalNovels} رواية
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Followed Reading Lists Section */}
        <div>
          <h2 className="text-3xl font-bold noto-sans-arabic-extrabold mb-6">قوائم قرائته تتابعها</h2>
          
          <div className="space-y-8">
            {placeholderData.followedReadingLists.map((list) => (
              <div key={list.id} className="transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Left side - Meme/Featured image as card */}
                  <Link to={`/profile/${username}/list/${list.id}`} className="w-full md:w-[300px] flex-shrink-0">
                    <div className="aspect-[3/4] relative rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                      <img
                        src={list.memeImage}
                        alt={list.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  </Link>

                  {/* Right side - Novel covers in grid */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold noto-sans-arabic-bold mb-2">{list.name}</h3>
                      <p className="text-[#686868] noto-sans-arabic-medium text-lg">{list.description}</p>
                    </div>

                    <div className="bg-[#666666] rounded-xl p-4 w-fit" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                      <div className="flex flex-wrap gap-3 max-w-full">
                        {list.novels.map((novel, index) => (
                          <div key={novel.id} className="relative group w-[180px] flex-shrink-0">
                            <div className="aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300" style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
                              <img
                                src={novel.coverImage}
                                alt={novel.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            
                            {/* +Number overlay on last item if there are more novels */}
                            {index === list.novels.length - 1 && list.totalNovels > list.displayLimit && (
                              <Link to={`/profile/${username}/list/${list.id}`}>
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/90 transition-colors">
                                  <span className="text-3xl font-bold noto-sans-arabic-extrabold text-white">
                                    +{list.totalNovels - list.displayLimit}
                                  </span>
                                </div>
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 text-[#686868] noto-sans-arabic-medium text-lg">
                      {list.totalNovels} رواية
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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
