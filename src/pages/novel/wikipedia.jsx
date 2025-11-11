import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus } from "lucide-react";
import Header from "../../components/common/Header";
import CreateCategoryModal from "../../components/novel/CreateCategoryModal";
import CreateEntityModal from "../../components/novel/CreateEntityModal";
import { useGetCategories } from "../../hooks/entity/useGetCategories";
import { useGetEntities } from "../../hooks/entity/useGetEntities";
import { ICON_COMPONENTS, DEFAULT_ICON_COMPONENT } from "../../constants/category-icons";

// Fallback icon mapping for old string-based categories (temporary - for backwards compatibility)
const LEGACY_CATEGORY_ICONS = {
  'الشخصيات': 'users',
  'شخصيات': 'users',
  'characters': 'users',
  'الأماكن': 'map-pin',
  'أماكن': 'map-pin',
  'places': 'map-pin',
  'الأشياء': 'shield',
  'أشياء': 'shield',
  'items': 'shield',
  'الفصائل': 'flag',
  'فصائل': 'flag',
  'factions': 'flag',
};

const NovelWikipediaPage = () => {
  const { novelId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState(false);
  const [isCreateEntityModalOpen, setIsCreateEntityModalOpen] = useState(false);

  // Fetch sections (formerly categories)
  const { data: sectionsResponse, isLoading: sectionsLoading } = useGetCategories(novelId);

  // Extract sections array and isOwner from response
  const sectionsData = sectionsResponse?.sections || [];
  const isOwner = sectionsResponse?.isOwner || false;

  // Fetch entities based on selected section
  const { data: entitiesData, isLoading: entitiesLoading } = useGetEntities(novelId, {
    section: selectedCategory, // Pass as 'section' instead of 'categoryName'
    pageSize: 50 // Load 50 entities initially
  });

  // Set first section as default
  useEffect(() => {
    if (sectionsData.length > 0 && !selectedCategory) {
      setSelectedCategory(getCategoryName(sectionsData[0]));
    }
  }, [sectionsData, selectedCategory]);

  const getIconForCategory = (category) => {
    // If category is an object with icon property (new backend format)
    if (typeof category === 'object' && category?.icon) {
      return ICON_COMPONENTS[category.icon] || DEFAULT_ICON_COMPONENT;
    }
    
    // If category is a string (old format - fallback for backwards compatibility)
    const categoryName = typeof category === 'string' ? category : category?.name;
    if (!categoryName) return DEFAULT_ICON_COMPONENT;
    
    // Try to map legacy category name to icon ID
    const iconId = LEGACY_CATEGORY_ICONS[categoryName] || LEGACY_CATEGORY_ICONS[categoryName.toLowerCase()];
    if (iconId && ICON_COMPONENTS[iconId]) {
      return ICON_COMPONENTS[iconId];
    }
    
    return DEFAULT_ICON_COMPONENT;
  };

  const getCategoryName = (category) => {
    return typeof category === 'object' ? category.name : category;
  };

  const getCategoryKey = (category) => {
    return typeof category === 'object' ? category.name : category;
  };

  if (sectionsLoading) {
    return (
      <>
        <Header />
        <div className="bg-[#2C2C2C] min-h-screen" dir="rtl">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center text-white">جاري التحميل...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#2C2C2C] min-h-screen" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="sticky top-24 bg-[#3C3C3C] rounded-xl p-4 border border-[#5A5A5A]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white noto-sans-arabic-extrabold">
                    موسوعة الرواية
                  </h3>
                  {isOwner && (
                    <button
                      onClick={() => setIsCreateCategoryModalOpen(true)}
                      className="p-2 rounded-lg text-[#B8B8B8] hover:bg-[#0077FF]/10 hover:text-[#0077FF] transition-colors"
                      aria-label="إضافة فئة جديدة"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <nav className="flex flex-col gap-1">
                  {sectionsData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-[#797979] text-sm noto-sans-arabic-regular">
                        لا توجد فئات بعد
                      </p>
                      <p className="text-[#797979] text-xs noto-sans-arabic-regular mt-2">
                        اضغط + لإضافة فئة
                      </p>
                    </div>
                  ) : (
                    sectionsData.map((category) => {
                      const Icon = getIconForCategory(category);
                      const categoryName = getCategoryName(category);
                      const categoryKey = getCategoryKey(category);
                      
                      return (
                        <button
                          key={categoryKey}
                          onClick={() => setSelectedCategory(categoryName)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors noto-sans-arabic-bold ${
                            selectedCategory === categoryName
                              ? "bg-[#0077FF] text-white"
                              : "text-[#B8B8B8] hover:bg-[#4A4A4A] hover:text-white"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{categoryName}</span>
                        </button>
                      );
                    })
                  )}
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-center justify-between">
                  <h1 className="text-white text-4xl md:text-5xl font-bold tracking-tight noto-sans-arabic-extrabold">
                    {selectedCategory || 'موسوعة الرواية'}
                  </h1>
                  {isOwner && (
                    <button
                      onClick={() => setIsCreateEntityModalOpen(true)}
                      disabled={!selectedCategory}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors noto-sans-arabic-bold ${
                        selectedCategory
                          ? 'bg-[#0077FF] hover:bg-[#0066DD]'
                          : 'bg-[#5A5A5A] cursor-not-allowed opacity-50'
                      }`}
                      title={!selectedCategory ? 'اختر فئة أولاً' : ''}
                    >
                      <Plus className="w-5 h-5" />
                      <span>إضافة</span>
                    </button>
                  )}
                </div>
                <p className="text-[#B8B8B8] text-lg md:text-xl max-w-3xl noto-sans-arabic-medium">
                  استكشف {selectedCategory} وتفاصيلها. لكل عنصر قصة فريدة لترويها.
                </p>
              </div>

              {/* Entities Grid */}
              {entitiesLoading ? (
                <div className="text-center text-white py-12">جاري التحميل...</div>
              ) : entitiesData?.items?.length === 0 ? (
                <div className="text-center py-12 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A]">
                  <p className="text-[#797979] noto-sans-arabic-regular">
                    لا توجد عناصر في هذه الفئة بعد
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {entitiesData?.items?.map((entity) => (
                    <Link
                      key={entity.id}
                      to={`/novel/${novelId}/wikipedia/${entity.id}`}
                      className="flex flex-col group cursor-pointer"
                    >
                      <div
                        className="w-full aspect-[3/4] bg-cover bg-center rounded-xl transition-transform duration-300 group-hover:scale-105 border border-[#5A5A5A] bg-[#3C3C3C]"
                        style={{
                          backgroundImage: entity.imageUrl ? `url(${entity.imageUrl})` : 'none',
                        }}
                      />
                      <div className="py-4">
                        <h3 className="text-white text-xl font-bold noto-sans-arabic-extrabold mb-2 group-hover:text-[#0077FF] transition-colors">
                          {entity.name}
                        </h3>
                        <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular leading-relaxed">
                          {entity.shortDescription || entity.description || 'لا يوجد وصف'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateCategoryModal
        isOpen={isCreateCategoryModalOpen}
        onClose={() => setIsCreateCategoryModalOpen(false)}
        novelId={novelId}
      />
      <CreateEntityModal
        isOpen={isCreateEntityModalOpen}
        onClose={() => setIsCreateEntityModalOpen(false)}
        categoryName={selectedCategory}
        categoryIcon={
          sectionsData.find(cat => getCategoryName(cat) === selectedCategory)?.icon || 'users'
        }
        novelId={novelId}
      />
    </>
  );
};

export default NovelWikipediaPage;
