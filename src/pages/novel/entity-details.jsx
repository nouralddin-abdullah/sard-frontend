import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, Pen, ChevronLeft, ChevronRight, X } from "lucide-react";
import Header from "../../components/common/Header";
import { useGetEntity } from "../../hooks/entity/useGetEntity";

const EntityDetailsPage = () => {
  const { novelId, entityId } = useParams();

  // API hook
  const { data: entityData, isLoading, error } = useGetEntity(novelId, entityId);

  // Image zoom modal state
  const [imageZoomModalOpen, setImageZoomModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Transform API data
  const transformedData = entityData ? {
    imageUrl: entityData.imageUrl,
    name: entityData.name,
    role: entityData.role,
    subtitle: entityData.shortDescription,
    isOwner: entityData.isOwner,
    biography: entityData.description ? entityData.description.split('\r\n\r\n').filter(p => p.trim()) : [],
    articles: entityData.articles || [],
    relationships: (entityData.relationships || []).map(rel => ({
      id: rel.id,
      name: rel.targetEntityName,
      role: rel.reverseLabel,
      imageUrl: rel.targetEntityImage,
      targetEntityId: rel.targetEntityId
    })),
    keyTraits: entityData.attributes || {},
    gallery: (entityData.galleryImages || []).map(img => ({
      imageUrl: img.imageUrl,
      caption: img.caption
    }))
  } : null;

  const openImageZoomModal = (index) => {
    setCurrentImageIndex(index);
    setImageZoomModalOpen(true);
  };

  const closeImageZoomModal = () => {
    setImageZoomModalOpen(false);
  };

  const navigateToPreviousImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : transformedData.gallery.length - 1));
  };

  const navigateToNextImage = () => {
    setCurrentImageIndex((prev) => (prev < transformedData.gallery.length - 1 ? prev + 1 : 0));
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="bg-[#2C2C2C] min-h-screen flex items-center justify-center" dir="rtl">
          <div className="text-white text-xl noto-sans-arabic-medium">جاري التحميل...</div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Header />
        <div className="bg-[#2C2C2C] min-h-screen flex items-center justify-center" dir="rtl">
          <div className="text-red-500 text-xl noto-sans-arabic-medium">
            حدث خطأ أثناء تحميل البيانات: {error.message}
          </div>
        </div>
      </>
    );
  }

  // No data state
  if (!transformedData) {
    return (
      <>
        <Header />
        <div className="bg-[#2C2C2C] min-h-screen flex items-center justify-center" dir="rtl">
          <div className="text-white text-xl noto-sans-arabic-medium">لا توجد بيانات</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-[#2C2C2C] min-h-screen" dir="rtl">
        {/* Hero Banner */}
        <div className="relative w-full h-[50vh] min-h-[400px] md:h-[60vh]">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${transformedData.imageUrl})`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2C2C] via-[#2C2C2C]/70 to-transparent" />
          
          {/* Edit Button - Only show to owner */}
          {transformedData.isOwner && (
            <div className="absolute top-6 left-6">
              <Link
                to={`/novel/${novelId}/wikipedia/${entityId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-[#2C2C2C]/80 backdrop-blur-sm hover:bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg transition-colors text-white noto-sans-arabic-medium"
              >
                <Pen size={18} />
                <span>تعديل</span>
              </Link>
            </div>
          )}

          <div className="relative container mx-auto px-4 h-full flex items-end pb-12 md:pb-16">
            <div className="text-white">
              <p className="text-sm font-bold text-[#0077FF] tracking-widest uppercase noto-sans-arabic-bold mb-2">
                {transformedData.role}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight noto-sans-arabic-extrabold mb-4">
                {transformedData.name}
              </h1>
              <p className="text-lg md:text-2xl text-[#B8B8B8] max-w-2xl noto-sans-arabic-medium">
                {transformedData.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
            {/* Left Column - Content */}
            <div className="lg:col-span-2 space-y-8 md:space-y-12">
              {/* Biography Section */}
              {transformedData.biography.length > 0 && (
                <div className="bg-[#3C3C3C] p-6 md:p-8 rounded-xl border border-[#5A5A5A]">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 noto-sans-arabic-extrabold">
                    السيرة الذاتية
                  </h2>
                  <div className="space-y-4 text-[#B8B8B8] noto-sans-arabic-regular">
                    {transformedData.biography.map((paragraph, index) => (
                      <p key={index} className="leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles Section (Dynamic) */}
              {transformedData.articles.map((article) => (
                <div key={article.id} className="bg-[#3C3C3C] p-6 md:p-8 rounded-xl border border-[#5A5A5A]">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 noto-sans-arabic-extrabold">
                    {article.title}
                  </h2>
                  <div 
                    className="text-[#B8B8B8] noto-sans-arabic-regular"
                    dangerouslySetInnerHTML={{ __html: article.content }}
                  />
                </div>
              ))}

              {/* Relationships Section */}
              {transformedData.relationships.length > 0 && (
                <div className="bg-[#3C3C3C] p-6 md:p-8 rounded-xl border border-[#5A5A5A]">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 noto-sans-arabic-extrabold">
                    العلاقات
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {transformedData.relationships.map((relationship) => (
                      <Link
                        key={relationship.id}
                        to={`/novel/${novelId}/wikipedia/${relationship.targetEntityId}`}
                        className="flex items-center gap-4 hover:opacity-80 transition-opacity"
                      >
                        <div
                          className="w-16 h-16 rounded-full bg-cover bg-center flex-shrink-0 border-2 border-[#5A5A5A]"
                          style={{
                            backgroundImage: `url(${relationship.imageUrl})`
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-white noto-sans-arabic-extrabold">
                            {relationship.name}
                          </h4>
                          <p className="text-sm text-[#B8B8B8] noto-sans-arabic-regular">
                            {relationship.role}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Section */}
              {transformedData.gallery.length > 0 && (
                <div className="bg-[#3C3C3C] p-6 md:p-8 rounded-xl border border-[#5A5A5A]">
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 noto-sans-arabic-extrabold">
                    معرض الصور
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {transformedData.gallery.map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                        style={{ backgroundColor: '#3C3C3C' }}
                        onClick={() => openImageZoomModal(index)}
                      >
                        <img
                          src={image.imageUrl}
                          alt={image.caption || `${transformedData.name} - صورة ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Key Traits Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-[#3C3C3C] p-6 rounded-xl border border-[#5A5A5A]">
                <h3 className="text-xl font-bold text-white border-b border-[#5A5A5A] pb-3 noto-sans-arabic-extrabold">
                  السمات الرئيسية
                </h3>
                <div className="space-y-4 mt-4">
                  {Object.entries(transformedData.keyTraits).map(([key, value], index) => {
                    const isList = Array.isArray(value);
                    
                    return (
                      <div key={index} className={isList ? "flex flex-col" : "flex justify-between"}>
                        <span className={`text-[#B8B8B8] font-medium noto-sans-arabic-medium ${isList ? 'mb-2' : ''}`}>
                          {key}
                        </span>
                        {isList ? (
                          <ul className="list-disc list-inside text-white space-y-1 pl-1 noto-sans-arabic-regular">
                            {value.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-white noto-sans-arabic-bold">
                            {value}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <Link
              to={`/novel/${novelId}/wikipedia`}
              className="inline-flex items-center gap-2 text-[#0077FF] hover:text-[#0066DD] transition-colors noto-sans-arabic-bold"
            >
              <ArrowRight className="w-5 h-5" />
              العودة إلى الموسوعة
            </Link>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {imageZoomModalOpen && transformedData.gallery.length > 0 && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closeImageZoomModal}
        >
          <div 
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageZoomModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X size={32} />
            </button>

            {/* Image Container */}
            <div className="relative bg-[#2C2C2C] rounded-lg overflow-hidden">
              <img
                src={transformedData.gallery[currentImageIndex].imageUrl}
                alt={transformedData.gallery[currentImageIndex].caption || `صورة ${currentImageIndex + 1}`}
                className="w-full max-h-[80vh] object-contain"
              />

              {/* Caption */}
              {transformedData.gallery[currentImageIndex].caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white text-center noto-sans-arabic-regular">
                    {transformedData.gallery[currentImageIndex].caption}
                  </p>
                </div>
              )}

              {/* Navigation Buttons */}
              {transformedData.gallery.length > 1 && (
                <>
                  {/* Previous Button */}
                  <button
                    onClick={navigateToPreviousImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={navigateToNextImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-3 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full noto-sans-arabic-medium">
                    {currentImageIndex + 1} / {transformedData.gallery.length}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntityDetailsPage;
