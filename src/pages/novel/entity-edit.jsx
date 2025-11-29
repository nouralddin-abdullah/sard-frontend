import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, MoreVertical, ChevronUp, ChevronDown, Pencil, Save, X, Bold, Italic, Underline, Upload, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapUnderline from '@tiptap/extension-underline';
import Header from '../../components/common/Header';
import AddAttributeModal from '../../components/novel/AddAttributeModal';
import AddArticleModal from '../../components/novel/AddArticleModal';
import AddRelationshipModal from '../../components/novel/AddRelationshipModal';
import EditRelationshipModal from '../../components/novel/EditRelationshipModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import { useGetEntity } from '../../hooks/entity/useGetEntity';
import { useUpdateEntity } from '../../hooks/entity/useUpdateEntity';
import { useAddArticle } from '../../hooks/entity/useAddArticle';
import { useUpdateArticle } from '../../hooks/entity/useUpdateArticle';
import { useDeleteArticle } from '../../hooks/entity/useDeleteArticle';
import { useReorderArticles } from '../../hooks/entity/useReorderArticles';
import { useAddRelationship } from '../../hooks/entity/useAddRelationship';
import { useUpdateRelationship } from '../../hooks/entity/useUpdateRelationship';
import { useDeleteRelationship } from '../../hooks/entity/useDeleteRelationship';
import { useAddGalleryImage } from '../../hooks/entity/useAddGalleryImage';
import { useDeleteGalleryImage } from '../../hooks/entity/useDeleteGalleryImage';
import { useUpdateGalleryImage } from '../../hooks/entity/useUpdateGalleryImage';
import { useDeleteEntity } from '../../hooks/entity/useDeleteEntity';

// Article Card Component with Inline Editor
const ArticleCard = ({ 
  article, 
  index, 
  isExpanded, 
  onExpand, 
  onCollapse, 
  onEdit,
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  canMoveUp, 
  canMoveDown
}) => {
  
  if (!isExpanded) {
    // Collapsed view
    return (
      <div className="flex gap-2 items-start">
        <div 
          onClick={onExpand}
          className="flex-1 p-4 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A] cursor-pointer hover:border-[#797979] transition-colors"
        >
          {article.title && (
            <h3 className="text-white noto-sans-arabic-bold mb-2">
              {article.title}
            </h3>
          )}
          <div
            className="text-[#B8B8B8] noto-sans-arabic-regular line-clamp-3"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1">
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className={`p-2 rounded-lg transition-colors ${
              !canMoveUp
                ? 'bg-[#3C3C3C] text-[#5A5A5A] cursor-not-allowed'
                : 'bg-[#3C3C3C] text-[#797979] hover:text-white hover:bg-[#4A4A4A] border border-[#5A5A5A]'
            }`}
            title="تحريك لأعلى"
          >
            <ChevronUp size={18} />
          </button>

          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className={`p-2 rounded-lg transition-colors ${
              !canMoveDown
                ? 'bg-[#3C3C3C] text-[#5A5A5A] cursor-not-allowed'
                : 'bg-[#3C3C3C] text-[#797979] hover:text-white hover:bg-[#4A4A4A] border border-[#5A5A5A]'
            }`}
            title="تحريك لأسفل"
          >
            <ChevronDown size={18} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 bg-[#3C3C3C] text-red-500 hover:text-red-400 hover:bg-[#4A4A4A] rounded-lg transition-colors border border-[#5A5A5A]"
            title="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Expanded view - Read-only preview with Edit button
  return (
    <div className="p-4 bg-[#3C3C3C] rounded-lg border-2 border-[#0077FF]">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm text-[#B8B8B8] noto-sans-arabic-medium">
          معاينة المحتوى
        </h4>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] rounded-lg transition-colors noto-sans-arabic-medium text-white text-sm"
          >
            <Pencil size={16} />
            <span>تعديل</span>
          </button>
          <button
            onClick={onCollapse}
            className="p-2 text-[#797979] hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Title Display (Read-only) */}
      {article.title && (
        <div className="mb-3">
          <h3 className="text-white noto-sans-arabic-bold text-lg">
            {article.title}
          </h3>
        </div>
      )}

      {/* Content Display (Read-only) */}
      <div className="bg-[#2C2C2C] border border-[#5A5A5A] rounded-lg p-4">
        <style>
          {`
            .article-preview p {
              margin-bottom: 1em;
            }
            .article-preview p:last-child {
              margin-bottom: 0;
            }
          `}
        </style>
        <div
          className="article-preview text-white noto-sans-arabic-regular"
          style={{ 
            wordBreak: 'break-word',
            lineHeight: '1.8'
          }}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  );
};

// Static data - will be replaced with API calls
const INITIAL_ENTITY_DATA = {
  name: 'أليستر الشجاع',
  subtitle: 'فارس منفي يسعى للخلاص',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtMeNhLxnrkX3AaSUyra48aqlwaDIM0y5fPX-QFPN09eiGf2NHPsLmC1ufBvtrKB6NVtK1U1gnv0bJG5_shegIMetXkE-sARx_w_khKSwaG_fQphEb5sLNCv8mtKZrBJhW6If3ZiqraB6edwdN-N3TrBpHl8t2kqho4bQgz5h3xwcReibJQyRAZkzzzEODKqQgBx2zQK6SwcELlWvC4odysLd31xMeiH-jWiQYUABp_N5jEeSCMOmapZ3hB5cnxxbxLHoYdH3JC4SY',
  customAttributes: [
    { id: 1, name: 'العمر', value: '32' },
    { id: 2, name: 'المهنة', value: 'حارس ملكي سابق' },
    { id: 3, name: 'الانتماء', value: 'غير منتمٍ' },
    { id: 4, name: 'النوع', value: 'إنسان' }
  ],
  articles: {
    articles: [
      { id: 1, content: '<p>مقال تجريبي أول</p>', font: 'noto-sans-arabic-regular', type: 'articles' },
      { id: 2, content: '<p>مقال تجريبي ثاني</p>', font: 'noto-sans-arabic-extrabold', type: 'articles' }
    ],
    story: [
      { id: 3, content: '<p>قصة البطل الشجاع</p>', font: 'noto-sans-arabic-regular', type: 'story' }
    ],
    backstory: [],
    notes: []
  },
  relationships: [
    {
      id: 1,
      name: 'إيلارا ريح الرياح',
      type: 'حليف',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqZ3ZKgfTJ_qLyZq7M9BhHk7gmjBSmwcifcrXghfeOrHM5f1GWLIR5O6uQp-khHMVdUrVnDSX55QCXVffCg6bVuDpQ7w34S_2THIG2uR85kKvBD0Yf0nYwJLK2KY0VESJGxMOR6h7tiqpFkF5VjzfZIg6XhsTmfww9nJq_HJjN3MR9EFJ2lz6-9FmKkrv7tfcZqqCQF6wO2XCuDRmIWgyU50lurYQPCPQVajGk5eZFG0_k-GIn5KRY2XcWE2jF6hRBfDGKZ_OmEyc9'
    },
    {
      id: 2,
      name: 'اللورد مالاكور',
      type: 'عدو',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe6GIMFzUNFx2fIYj7GIcfb-c41ABElrAGSWAjhDuUOL2ecYgQoCA682uN8L4uFz6XjnZptzWKzVXgv3ZDWC9gUFv3LucBn2vItbRysSacwDmkCU4eWm8qUFLhqYVJ53P88hAfUVCl4x9wPNJGCYyVLRrfMFwOdR6fruULdNPvfnYRsfVhw-hQeSzq3dQoKKTB2AlTYMGcZkev17ERPLfxTL0CWdIvYGO95DUHuZPnHJ17wsy4cfCGJsrsppVZ1-zxNh3cFLkGRl1H'
    }
  ]
};

const EntityEditPage = () => {
  const { novelId, entityId } = useParams();
  const navigate = useNavigate();
  
  // API hooks
  const { data: entityData, isLoading, error } = useGetEntity(novelId, entityId);
  const updateEntityMutation = useUpdateEntity();
  const addArticleMutation = useAddArticle();
  const updateArticleMutation = useUpdateArticle();
  const deleteArticleMutation = useDeleteArticle();
  const reorderArticlesMutation = useReorderArticles();
  const addRelationshipMutation = useAddRelationship();
  const updateRelationshipMutation = useUpdateRelationship();
  const deleteRelationshipMutation = useDeleteRelationship();
  const addGalleryImageMutation = useAddGalleryImage();
  const updateGalleryImageMutation = useUpdateGalleryImage();
  const deleteGalleryImageMutation = useDeleteGalleryImage();
  const deleteEntityMutation = useDeleteEntity();
  
  // Local state
  const [localEntityData, setLocalEntityData] = useState(null);
  const [isAttributeModalOpen, setIsAttributeModalOpen] = useState(false);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [isRelationshipModalOpen, setIsRelationshipModalOpen] = useState(false);
  const [isEditRelationshipModalOpen, setIsEditRelationshipModalOpen] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState(null);
  const [editingArticle, setEditingArticle] = useState(null); // Track which article is being edited in modal
  const [expandedArticleId, setExpandedArticleId] = useState(null); // Track which article is being previewed
  const [hasArticleOrderChanged, setHasArticleOrderChanged] = useState(false); // Track if article order has changed
  const [openRelationshipMenuId, setOpenRelationshipMenuId] = useState(null);
  const [relationshipMenuPosition, setRelationshipMenuPosition] = useState(null);
  const [deleteRelationshipModalOpen, setDeleteRelationshipModalOpen] = useState(false);
  const [relationshipToDelete, setRelationshipToDelete] = useState(null);
  const [hasDetailsChanged, setHasDetailsChanged] = useState(false);
  const [hasAttributesChanged, setHasAttributesChanged] = useState(false);
  const [originalEntityData, setOriginalEntityData] = useState(null);
  const [deleteGalleryImageModalOpen, setDeleteGalleryImageModalOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [deleteEntityModalOpen, setDeleteEntityModalOpen] = useState(false);
  const [addImageModalOpen, setAddImageModalOpen] = useState(false);
  const [imageCaption, setImageCaption] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageZoomModalOpen, setImageZoomModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editedCaption, setEditedCaption] = useState("");
  const [originalCaption, setOriginalCaption] = useState("");

  // Sync API data to local state - intelligently preserve unsaved changes
  useEffect(() => {
    if (entityData) {
      // Transform API response to match local structure
      const transformedData = {
        ...entityData,
        customAttributes: entityData.attributes
          ? Object.entries(entityData.attributes).map(([name, value], index) => {
              // Check if value is an array (list attribute) or simple value
              const isList = Array.isArray(value);
              return {
                id: index + 1,
                name,
                isList,
                value: isList ? undefined : value,
                items: isList ? value : undefined
              };
            })
          : [],
        // Articles is just a flat array from API
        articles: entityData.articles || []
      };

      // If no local data yet (initial load), use API data as-is
      if (!localEntityData) {
        setLocalEntityData(transformedData);
        setOriginalEntityData(transformedData);
        setHasDetailsChanged(false);
        setHasAttributesChanged(false);
      } else {
        // Merge strategy: Update fields that don't have unsaved changes
        setLocalEntityData(prevData => ({
          ...transformedData,
          // Preserve unsaved detail changes
          name: hasDetailsChanged ? prevData.name : transformedData.name,
          role: hasDetailsChanged ? prevData.role : transformedData.role,
          shortDescription: hasDetailsChanged ? prevData.shortDescription : transformedData.shortDescription,
          description: hasDetailsChanged ? prevData.description : transformedData.description,
          section: hasDetailsChanged ? prevData.section : transformedData.section,
          // Preserve unsaved attribute changes
          customAttributes: hasAttributesChanged ? prevData.customAttributes : transformedData.customAttributes,
        }));

        // Update original data to track changes against the latest API state
        setOriginalEntityData(transformedData);
      }
    }
  }, [entityData, hasDetailsChanged, hasAttributesChanged]);

  // Detect changes in entity details
  useEffect(() => {
    if (!localEntityData || !originalEntityData) return;

    const detailsChanged = 
      localEntityData.name !== originalEntityData.name ||
      localEntityData.role !== originalEntityData.role ||
      localEntityData.shortDescription !== originalEntityData.shortDescription ||
      localEntityData.description !== originalEntityData.description ||
      localEntityData.section !== originalEntityData.section;

    setHasDetailsChanged(detailsChanged);
  }, [localEntityData?.name, localEntityData?.role, localEntityData?.shortDescription, localEntityData?.description, localEntityData?.section, originalEntityData]);

  // Detect changes in custom attributes
  useEffect(() => {
    if (!localEntityData || !originalEntityData) return;

    const attributesChanged = JSON.stringify(localEntityData.customAttributes) !== JSON.stringify(originalEntityData.customAttributes);
    setHasAttributesChanged(attributesChanged);
  }, [localEntityData?.customAttributes, originalEntityData]);

  const handleAddAttribute = (newAttribute) => {
    setLocalEntityData(prev => ({
      ...prev,
      customAttributes: [
        ...prev.customAttributes,
        { 
          id: Date.now(), 
          ...newAttribute,
          // If it's a list type, ensure items is an array
          isList: newAttribute.isList || false,
          items: newAttribute.isList ? (newAttribute.items || []) : undefined
        }
      ]
    }));
  };

  const handleDeleteAttribute = (id) => {
    setLocalEntityData(prev => ({
      ...prev,
      customAttributes: prev.customAttributes.filter(attr => attr.id !== id)
    }));
  };

  const handleAddArticle = async (articleData) => {
    try {
      await addArticleMutation.mutateAsync({
        novelId,
        entityId,
        data: {
          title: articleData.title || '',
          content: articleData.content,
          orderIndex: localEntityData.articles?.length || 0
        }
      });
      toast.success('تم إضافة المحتوى بنجاح');
    } catch (error) {
      console.error('Failed to add article:', error);
      toast.error('فشل إضافة المحتوى');
    }
  };

  const handleEditArticle = async (articleId, title, content) => {
    try {
      const article = localEntityData.articles.find(a => a.id === articleId);
      await updateArticleMutation.mutateAsync({
        novelId,
        articleId,
        data: {
          title: title || '',
          content: content,
          orderIndex: article.orderIndex
        }
      });
      setExpandedArticleId(null);
      setIsArticleModalOpen(false);
      setEditingArticle(null);
      toast.success('تم تحديث المحتوى بنجاح');
    } catch (error) {
      console.error('Failed to update article:', error);
      toast.error('فشل تحديث المحتوى');
    }
  };

  const handleMoveArticleUp = (index) => {
    if (index === 0) return;
    
    setLocalEntityData(prev => {
      const articles = [...prev.articles];
      // Swap articles in array
      [articles[index], articles[index - 1]] = [articles[index - 1], articles[index]];
      return { ...prev, articles };
    });
    
    setHasArticleOrderChanged(true);
  };

  const handleMoveArticleDown = (index) => {
    if (!localEntityData.articles || index === localEntityData.articles.length - 1) return;
    
    setLocalEntityData(prev => {
      const articles = [...prev.articles];
      // Swap articles in array
      [articles[index], articles[index + 1]] = [articles[index + 1], articles[index]];
      return { ...prev, articles };
    });
    
    setHasArticleOrderChanged(true);
  };

  const handleSaveArticleOrder = async () => {
    if (!hasArticleOrderChanged || !localEntityData.articles) return;
    
    const orderedArticleIds = localEntityData.articles.map(a => a.id);
    
    try {
      await reorderArticlesMutation.mutateAsync({
        novelId,
        entityId,
        orderedArticleIds
      });
      setHasArticleOrderChanged(false);
      toast.success('تم حفظ الترتيب بنجاح');
    } catch (error) {
      console.error('Failed to reorder articles:', error);
      toast.error('فشل حفظ الترتيب');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المحتوى؟')) return;
    
    try {
      await deleteArticleMutation.mutateAsync({ novelId, articleId: id });
      toast.success('تم حذف المحتوى بنجاح');
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('فشل حذف المحتوى');
    }
  };

  const handleAddRelationship = async (relationshipData) => {
    try {
      await addRelationshipMutation.mutateAsync({
        novelId,
        relationshipData: {
          sourceEntityId: entityId,
          targetEntityId: relationshipData.targetEntityId,
          relationType: 'custom', // You can add UI to select this if needed
          label: relationshipData.relationshipType,
          reverseLabel: relationshipData.reverseRelationshipType,
          description: '' // Optional field
        }
      });
      
      setIsRelationshipModalOpen(false);
      toast.success('تمت إضافة العلاقة بنجاح');
    } catch (error) {
      console.error('Failed to add relationship:', error);
      toast.error('فشل إضافة العلاقة');
    }
  };

  const handleUpdateRelationship = async (relationshipData) => {
    try {
      await updateRelationshipMutation.mutateAsync({
        novelId,
        relationshipId: relationshipData.relationshipId,
        relationshipData: {
          relationType: relationshipData.relationType || 'custom',
          label: relationshipData.label,
          reverseLabel: relationshipData.reverseLabel
        }
      });
      
      setIsEditRelationshipModalOpen(false);
      setEditingRelationship(null);
      toast.success('تم تحديث العلاقة بنجاح');
    } catch (error) {
      console.error('Failed to update relationship:', error);
      toast.error('فشل تحديث العلاقة');
    }
  };

  const openEditRelationshipModal = (relationship) => {
    setEditingRelationship(relationship);
    setIsEditRelationshipModalOpen(true);
  };

  const handleDeleteRelationship = async (relationshipId) => {
    try {
      await deleteRelationshipMutation.mutateAsync({ novelId, relationshipId });
      toast.success('تم حذف العلاقة بنجاح');
      setDeleteRelationshipModalOpen(false);
      setRelationshipToDelete(null);
    } catch (error) {
      console.error('Failed to delete relationship:', error);
      toast.error('فشل حذف العلاقة');
    }
  };

  const openDeleteRelationshipModal = (relationshipId) => {
    setRelationshipToDelete(relationshipId);
    setDeleteRelationshipModalOpen(true);
  };

  const cancelDeleteRelationship = () => {
    setDeleteRelationshipModalOpen(false);
    setRelationshipToDelete(null);
  };

  const confirmDeleteRelationship = () => {
    if (relationshipToDelete) {
      handleDeleteRelationship(relationshipToDelete);
    }
  };

  const handleAddGalleryImage = () => {
    // Open modal for adding image with caption
    setAddImageModalOpen(true);
  };

  const handleImageFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      event.target.value = '';
      return;
    }

    setSelectedImageFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadGalleryImage = async () => {
    if (!selectedImageFile) {
      toast.error('يرجى اختيار صورة');
      return;
    }

    const formData = new FormData();
    formData.append('EntityId', entityId);
    formData.append('ImageFile', selectedImageFile);
    formData.append('Caption', imageCaption || '');
    formData.append('OrderIndex', localEntityData.galleryImages?.length || 0);

    try {
      await addGalleryImageMutation.mutateAsync({
        novelId,
        entityId,
        formData
      });
      toast.success('تمت إضافة الصورة بنجاح');
      // Reset modal state
      setAddImageModalOpen(false);
      setImageCaption('');
      setSelectedImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to add gallery image:', error);
      toast.error('فشل إضافة الصورة');
    }
  };

  const cancelAddImage = () => {
    setAddImageModalOpen(false);
    setImageCaption('');
    setSelectedImageFile(null);
    setImagePreview(null);
  };

  const openImageZoomModal = (imageIndex) => {
    if (!localEntityData.galleryImages || localEntityData.galleryImages.length === 0) return;
    
    const image = localEntityData.galleryImages[imageIndex];
    setCurrentImageIndex(imageIndex);
    setEditedCaption(image.caption || '');
    setOriginalCaption(image.caption || '');
    setImageZoomModalOpen(true);
  };

  const closeImageZoomModal = () => {
    setImageZoomModalOpen(false);
    setCurrentImageIndex(0);
    setEditedCaption('');
    setOriginalCaption('');
  };

  const navigateToPreviousImage = () => {
    if (!localEntityData.galleryImages || localEntityData.galleryImages.length === 0) return;
    
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : localEntityData.galleryImages.length - 1;
    const image = localEntityData.galleryImages[newIndex];
    setCurrentImageIndex(newIndex);
    setEditedCaption(image.caption || '');
    setOriginalCaption(image.caption || '');
  };

  const navigateToNextImage = () => {
    if (!localEntityData.galleryImages || localEntityData.galleryImages.length === 0) return;
    
    const newIndex = currentImageIndex < localEntityData.galleryImages.length - 1 ? currentImageIndex + 1 : 0;
    const image = localEntityData.galleryImages[newIndex];
    setCurrentImageIndex(newIndex);
    setEditedCaption(image.caption || '');
    setOriginalCaption(image.caption || '');
  };

  const handleUpdateImageCaption = async () => {
    if (!localEntityData.galleryImages || !localEntityData.galleryImages[currentImageIndex]) return;
    
    const currentImage = localEntityData.galleryImages[currentImageIndex];
    
    try {
      await updateGalleryImageMutation.mutateAsync({
        novelId,
        imageId: currentImage.id,
        caption: editedCaption
      });
      toast.success('تم تحديث التعليق بنجاح');
      setOriginalCaption(editedCaption);
    } catch (error) {
      console.error('Failed to update image caption:', error);
      toast.error('فشل تحديث التعليق');
    }
  };

  const handleDeleteImageFromZoomModal = () => {
    if (!localEntityData.galleryImages || !localEntityData.galleryImages[currentImageIndex]) return;
    
    const currentImage = localEntityData.galleryImages[currentImageIndex];
    setImageToDelete(currentImage.id);
    setDeleteGalleryImageModalOpen(true);
  };

  const handleDeleteGalleryImage = async (imageId) => {
    try {
      await deleteGalleryImageMutation.mutateAsync({ novelId, imageId });
      toast.success('تم حذف الصورة بنجاح');
      setDeleteGalleryImageModalOpen(false);
      setImageToDelete(null);
      
      // Close zoom modal if it was open
      if (imageZoomModalOpen) {
        closeImageZoomModal();
      }
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
      toast.error('فشل حذف الصورة');
    }
  };

  const openDeleteGalleryImageModal = (imageId) => {
    setImageToDelete(imageId);
    setDeleteGalleryImageModalOpen(true);
  };

  const cancelDeleteGalleryImage = () => {
    setDeleteGalleryImageModalOpen(false);
    setImageToDelete(null);
  };

  const confirmDeleteGalleryImage = () => {
    if (imageToDelete) {
      handleDeleteGalleryImage(imageToDelete);
    }
  };

  const closeRelationshipMenu = () => {
    setOpenRelationshipMenuId(null);
    setRelationshipMenuPosition(null);
  };

  const handleRelationshipMenuToggle = (event, relationshipId) => {
    event.stopPropagation();
    
    if (openRelationshipMenuId === relationshipId) {
      closeRelationshipMenu();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const MENU_WIDTH = 192; // w-48 = 12rem = 192px
    
    // Position the menu below the trigger, aligned to the right
    const left = rect.right - MENU_WIDTH;
    const top = rect.bottom + 4;
    
    setRelationshipMenuPosition({ top, left });
    setOpenRelationshipMenuId(relationshipId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    if (!openRelationshipMenuId) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('[data-relationship-menu]') && !event.target.closest('[data-relationship-menu-trigger]')) {
        closeRelationshipMenu();
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openRelationshipMenuId]);

  const handleSaveEntityDetails = async () => {
    if (!entityData || !localEntityData) return;

    const formData = new FormData();
    let hasChanges = false;

    // Compare and add only changed fields
    if (localEntityData.name !== entityData.name) {
      formData.append('Name', localEntityData.name);
      hasChanges = true;
    }

    if (localEntityData.role !== entityData.role) {
      formData.append('Role', localEntityData.role || '');
      hasChanges = true;
    }

    if (localEntityData.shortDescription !== entityData.shortDescription) {
      formData.append('ShortDescription', localEntityData.shortDescription || '');
      hasChanges = true;
    }

    if (localEntityData.description !== entityData.description) {
      formData.append('Description', localEntityData.description || '');
      hasChanges = true;
    }

    // Check if image changed (if we add image upload later)
    // if (localEntityData.imageFile) {
    //   formData.append('ImageFile', localEntityData.imageFile);
    //   hasChanges = true;
    // }

    if (!hasChanges) {
      toast.info('لا توجد تغييرات لحفظها');
      return;
    }

    try {
      await updateEntityMutation.mutateAsync({
        novelId,
        entityId,
        data: formData
      });
      toast.success('تم حفظ التفاصيل بنجاح');
      
      // Update original data after successful save (keep current localEntityData intact)
      setOriginalEntityData({
        ...originalEntityData,
        name: localEntityData.name,
        role: localEntityData.role,
        shortDescription: localEntityData.shortDescription,
        description: localEntityData.description,
        section: localEntityData.section
      });
      setHasDetailsChanged(false);
      
      // Manually refetch to update other fields (like relationships, gallery) without overwriting local changes
      // The isInitialLoad flag prevents automatic sync
    } catch (error) {
      console.error('Failed to save entity details:', error);
      toast.error('فشل حفظ التفاصيل');
    }
  };

  const handleSaveAttributes = async () => {
    if (!entityData || !localEntityData) return;

    // Compare attributes
    const originalAttributes = entityData.attributes || {};
    
    // Convert customAttributes to the correct format
    const currentAttributes = localEntityData.customAttributes.reduce((acc, attr) => {
      if (attr.isList) {
        // For list attributes, store as array (filter empty lines when saving)
        acc[attr.name] = (attr.items || []).filter(item => item && item.trim());
      } else {
        // For simple attributes, store as string
        acc[attr.name] = attr.value || '';
      }
      return acc;
    }, {});

    // Check if attributes changed
    const attributesChanged = JSON.stringify(originalAttributes) !== JSON.stringify(currentAttributes);

    if (!attributesChanged) {
      toast.info('لا توجد تغييرات لحفظها');
      return;
    }

    const formData = new FormData();
    // Backend expects AttributesJson as a JSON string
    formData.append('AttributesJson', JSON.stringify(currentAttributes));

    try {
      await updateEntityMutation.mutateAsync({
        novelId,
        entityId,
        data: formData
      });
      toast.success('تم حفظ الخصائص بنجاح');
      
      // Update original data after successful save (keep current localEntityData intact)
      setOriginalEntityData({
        ...originalEntityData,
        customAttributes: localEntityData.customAttributes
      });
      setHasAttributesChanged(false);
      
      // Manually refetch to update other fields without overwriting local changes
      // The isInitialLoad flag prevents automatic sync
    } catch (error) {
      console.error('Failed to save attributes:', error);
      toast.error('فشل حفظ الخصائص');
    }
  };

  const handleCancel = () => {
    navigate(`/novel/${novelId}/wikipedia/${entityId}`);
  };

  const handleDeleteEntity = async () => {
    try {
      await deleteEntityMutation.mutateAsync({ novelId, entityId });
      toast.success('تم حذف الكيان بنجاح');
      navigate(`/novel/${novelId}/wikipedia`);
    } catch (error) {
      console.error('Failed to delete entity:', error);
      toast.error('فشل حذف الكيان');
    }
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2C2C2C' }} dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white noto-sans-arabic-bold">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#2C2C2C' }} dir="rtl">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-500">خطأ في تحميل البيانات: {error.message}</div>
        </div>
      </div>
    );
  }

  if (!localEntityData) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#2C2C2C' }} dir="rtl">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Image */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8 p-4 md:p-6 border-b border-[#5A5A5A]">
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="w-20 h-20 md:w-32 md:h-32 rounded-lg bg-cover bg-center border-2 border-[#5A5A5A] flex-shrink-0"
              style={{ backgroundImage: `url(${localEntityData.imageUrl})` }}
            />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-white noto-sans-arabic-extrabold mb-1 md:mb-2 truncate">
                {localEntityData.name}
              </h1>
              <p className="text-sm md:text-base text-[#797979] noto-sans-arabic-regular">
                آخر تعديل: منذ ساعتين
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setDeleteEntityModalOpen(true)}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors noto-sans-arabic-medium text-white flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">حذف</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 bg-[#3C3C3C] hover:bg-[#5A5A5A] rounded-lg transition-colors noto-sans-arabic-medium text-sm md:text-base"
              style={{ color: '#B8B8B8' }}
            >
              إلغاء
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 md:flex-none px-4 md:px-6 py-2 rounded-lg transition-colors noto-sans-arabic-bold text-white text-sm md:text-base"
              style={{ backgroundColor: '#0077FF' }}
            >
              رجوع للتفاصيل
            </button>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Entity Details Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                  التفاصيل الأساسية
                </h2>
                <button
                  onClick={handleSaveEntityDetails}
                  disabled={updateEntityMutation.isPending || !hasDetailsChanged}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed rounded-lg transition-colors noto-sans-arabic-medium text-white"
                >
                  <Save size={18} />
                  <span className={updateEntityMutation.isPending ? 'noto-sans-arabic-bold' : ''}>
                    {updateEntityMutation.isPending ? 'جاري الحفظ...' : 'حفظ التفاصيل'}
                  </span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                    الاسم
                  </label>
                  <input
                    type="text"
                    value={localEntityData.name}
                    onChange={(e) => setLocalEntityData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-3 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                    placeholder="اسم الكيان"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                    الدور
                  </label>
                  <input
                    type="text"
                    value={localEntityData.role || ''}
                    onChange={(e) => setLocalEntityData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-3 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                    placeholder="مثال: بطل، شرير، حليف"
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                    الوصف القصير
                  </label>
                  <input
                    type="text"
                    value={localEntityData.shortDescription || ''}
                    onChange={(e) => setLocalEntityData(prev => ({ ...prev, shortDescription: e.target.value }))}
                    className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-3 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                    placeholder="وصف مختصر (سطر واحد)"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2 noto-sans-arabic-medium" style={{ color: '#797979' }}>
                    الوصف التفصيلي
                  </label>
                  <textarea
                    value={localEntityData.description || ''}
                    onChange={(e) => setLocalEntityData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className="w-full bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg px-4 py-3 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF] resize-none"
                    placeholder="وصف تفصيلي للكيان"
                  />
                </div>
              </div>
            </div>

            {/* Custom Attributes Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                  السمات المخصصة
                </h2>
                <button
                  onClick={handleSaveAttributes}
                  disabled={updateEntityMutation.isPending || !hasAttributesChanged}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed rounded-lg transition-colors noto-sans-arabic-medium text-white"
                >
                  <Save size={18} />
                  <span className={updateEntityMutation.isPending ? 'noto-sans-arabic-bold' : ''}>
                    {updateEntityMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخصائص'}
                  </span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {localEntityData.customAttributes.map((attr) => (
                  <div
                    key={attr.id}
                    className={`flex flex-col gap-2 p-4 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A] ${
                      attr.isList ? 'sm:col-span-2' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-sm noto-sans-arabic-medium" style={{ color: '#797979' }}>
                        {attr.name}
                      </label>
                      <button
                        onClick={() => handleDeleteAttribute(attr.id)}
                        className="text-[#797979] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Simple Value Input */}
                    {!attr.isList && (
                      <input
                        type="text"
                        value={attr.value || ''}
                        onChange={(e) => {
                          setLocalEntityData(prev => ({
                            ...prev,
                            customAttributes: prev.customAttributes.map(a =>
                              a.id === attr.id ? { ...a, value: e.target.value } : a
                            )
                          }));
                        }}
                        className="w-full bg-[#2C2C2C] border border-[#5A5A5A] rounded-lg px-3 py-2 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF]"
                      />
                    )}

                    {/* List Items */}
                    {attr.isList && (
                      <div className="space-y-2">
                        <textarea
                          value={(attr.items || []).join('\n')}
                          onChange={(e) => {
                            // Don't filter while typing - allow empty lines
                            const newItems = e.target.value
                              .split('\n')
                              .map(line => line.trim())
                              .map(line => line.replace(/^[\*\-•]\s*/, ''));
                            // Only filter out completely empty lines at the end
                            
                            setLocalEntityData(prev => ({
                              ...prev,
                              customAttributes: prev.customAttributes.map(a =>
                                a.id === attr.id ? { ...a, items: newItems } : a
                              )
                            }));
                          }}
                          onKeyDown={(e) => {
                            // Allow Enter key to create new lines
                            if (e.key === 'Enter') {
                              e.stopPropagation();
                              // Let the default behavior happen (new line)
                            }
                          }}
                          placeholder="أدخل كل عنصر في سطر منفصل..."
                          rows={Math.max(3, (attr.items || []).length + 1)}
                          className="w-full bg-[#2C2C2C] border border-[#5A5A5A] rounded-lg px-3 py-2 text-white noto-sans-arabic-regular focus:outline-none focus:ring-2 focus:ring-[#0077FF] resize-none"
                        />
                        <p className="text-xs noto-sans-arabic-regular" style={{ color: '#797979' }}>
                          كل سطر = عنصر واحد ({(attr.items || []).filter(item => item).length} عنصر)
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsAttributeModalOpen(true)}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-transparent border border-[#5A5A5A] hover:bg-[#3C3C3C] rounded-lg transition-colors noto-sans-arabic-medium"
                style={{ color: '#B8B8B8' }}
              >
                <Plus size={20} />
                <span>إضافة حقل مخصص</span>
              </button>
            </div>

            {/* Articles Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                المقالات
              </h2>

              {/* Articles List */}
              <div className="space-y-3 mb-4">
                {!localEntityData.articles || localEntityData.articles.length === 0 ? (
                  <div className="text-center py-12 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A]">
                    <p className="text-[#797979] noto-sans-arabic-regular">
                      لا توجد محتويات بعد
                    </p>
                  </div>
                ) : (
                  localEntityData.articles.map((article, index) => (
                    <ArticleCard
                      key={article.id}
                      article={article}
                      index={index}
                      isExpanded={expandedArticleId === article.id}
                      onExpand={() => setExpandedArticleId(article.id)}
                      onCollapse={() => setExpandedArticleId(null)}
                      onEdit={() => {
                        setEditingArticle(article);
                        setIsArticleModalOpen(true);
                        setExpandedArticleId(null);
                      }}
                      onDelete={() => handleDeleteArticle(article.id)}
                      onMoveUp={() => handleMoveArticleUp(index)}
                      onMoveDown={() => handleMoveArticleDown(index)}
                      canMoveUp={index > 0}
                      canMoveDown={index < localEntityData.articles.length - 1}
                    />
                  ))
                )}
              </div>

              {/* Save Article Order Button */}
              {hasArticleOrderChanged && (
                <button
                  onClick={handleSaveArticleOrder}
                  disabled={reorderArticlesMutation.isPending}
                  className="w-full mb-3 flex items-center justify-center gap-2 px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] rounded-lg transition-colors noto-sans-arabic-medium text-white"
                >
                  <Save size={20} />
                  <span>{reorderArticlesMutation.isPending ? 'جاري الحفظ...' : 'حفظ الترتيب'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  setEditingArticle(null);
                  setIsArticleModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#5A5A5A] hover:bg-[#3C3C3C] rounded-lg transition-colors noto-sans-arabic-medium"
                style={{ color: '#B8B8B8' }}
              >
                <Plus size={20} />
                <span>إضافة محتوى</span>
              </button>
            </div>

            {/* Gallery Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4 noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                معرض الصور
              </h2>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {localEntityData.galleryImages && localEntityData.galleryImages.length > 0 && (
                  localEntityData.galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-lg"
                      onClick={() => openImageZoomModal(index)}
                    >
                      <div
                        className="bg-center bg-no-repeat bg-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundImage: `url(${image.imageUrl})` }}
                      ></div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openImageZoomModal(index);
                          }}
                          className="flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white size-8"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteGalleryImageModal(image.id);
                          }}
                          className="flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white size-8"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                
                {/* Add Image Button */}
                <button
                  onClick={handleAddGalleryImage}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#5A5A5A] text-[#797979] hover:border-[#0077FF] hover:text-[#0077FF] transition-colors"
                >
                  <Upload size={32} />
                  <span className="text-sm font-medium noto-sans-arabic-medium">إضافة صورة</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Relationships */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-2xl font-bold mb-4 noto-sans-arabic-bold" style={{ color: '#B8B8B8' }}>
                العلاقات
              </h2>

              <div className="space-y-3">
                {localEntityData.relationships.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-3 bg-[#3C3C3C] rounded-lg border border-[#5A5A5A]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0"
                        style={{ backgroundImage: `url(${rel.targetEntityImage})` }}
                      />
                      <div>
                        <p className="text-xs text-[#9db9a6] noto-sans-arabic-regular">
                          {rel.reverseLabel || rel.label}
                        </p>
                        <Link
                          to={`/novel/${novelId}/wikipedia/${rel.targetEntityId}`}
                          className="text-sm font-medium text-white hover:text-[#0077FF] transition-colors noto-sans-arabic-medium"
                        >
                          {rel.targetEntityName}
                        </Link>
                      </div>
                    </div>
                    <button 
                      data-relationship-menu-trigger
                      onClick={(e) => handleRelationshipMenuToggle(e, rel.id)}
                      className="text-[#9db9a6] hover:text-white transition-colors"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsRelationshipModalOpen(true)}
                className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[#5A5A5A] hover:bg-[#3C3C3C] rounded-lg transition-colors noto-sans-arabic-medium"
                style={{ color: '#B8B8B8' }}
              >
                <Plus size={20} />
                <span>إضافة علاقة</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddAttributeModal
        isOpen={isAttributeModalOpen}
        onClose={() => setIsAttributeModalOpen(false)}
        onAdd={handleAddAttribute}
      />

      <AddArticleModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false);
          setEditingArticle(null);
        }}
        onSave={editingArticle ? 
          (articleData) => handleEditArticle(editingArticle.id, articleData.title, articleData.content) : 
          handleAddArticle
        }
        initialArticle={editingArticle}
      />

      <AddRelationshipModal
        isOpen={isRelationshipModalOpen}
        onClose={() => setIsRelationshipModalOpen(false)}
        onSave={handleAddRelationship}
        novelId={novelId}
        currentEntity={{
          id: entityId,
          name: localEntityData?.name,
          imageUrl: localEntityData?.imageUrl
        }}
      />

      {/* Relationship Menu Dropdown */}
      {openRelationshipMenuId && relationshipMenuPosition && (
        <div
          data-relationship-menu
          role="menu"
          className="fixed z-[70] w-48 overflow-hidden rounded-xl border"
          style={{ 
            top: relationshipMenuPosition.top, 
            left: relationshipMenuPosition.left,
            borderColor: '#5A5A5A',
            backgroundColor: '#3C3C3C'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeRelationshipMenu();
              const relationship = localEntityData.relationships.find(r => r.id === openRelationshipMenuId);
              if (relationship) {
                openEditRelationshipModal(relationship);
              }
            }}
            className="noto-sans-arabic-bold flex w-full items-center gap-2 px-3.5 py-2 text-sm text-white transition"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 119, 255, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Pencil size={14} />
            تعديل العلاقة
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              closeRelationshipMenu();
              openDeleteRelationshipModal(openRelationshipMenuId);
            }}
            className="noto-sans-arabic-bold flex w-full items-center gap-2 px-3.5 py-2 text-sm text-rose-400 transition"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(244, 63, 94, 0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Trash2 size={14} />
            حذف العلاقة
          </button>
        </div>
      )}

      {/* Delete Relationship Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteRelationshipModalOpen}
        onClose={cancelDeleteRelationship}
        onConfirm={confirmDeleteRelationship}
        title="حذف العلاقة"
        message="هل أنت متأكد من حذف هذه العلاقة؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteRelationshipMutation.isPending}
      />

      {/* Edit Relationship Modal */}
      <EditRelationshipModal
        isOpen={isEditRelationshipModalOpen}
        onClose={() => {
          setIsEditRelationshipModalOpen(false);
          setEditingRelationship(null);
        }}
        onSave={handleUpdateRelationship}
        relationship={editingRelationship}
        currentEntity={{
          id: entityId,
          name: localEntityData?.name,
          imageUrl: localEntityData?.imageUrl
        }}
        isLoading={updateRelationshipMutation.isPending}
      />

      {/* Delete Gallery Image Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteGalleryImageModalOpen}
        onClose={cancelDeleteGalleryImage}
        onConfirm={confirmDeleteGalleryImage}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة من المعرض؟ لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteGalleryImageMutation.isPending}
      />

      {/* Add Gallery Image Modal */}
      {addImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2C] rounded-lg w-full max-w-md p-6 border border-[#5A5A5A]">
            <h2 className="text-xl font-bold mb-4 noto-sans-arabic-bold text-white">
              إضافة صورة جديدة
            </h2>

            {/* Image Preview or Upload Area */}
            <div className="mb-4">
              {imagePreview ? (
                <div className="relative aspect-square w-full rounded-lg overflow-hidden border-2 border-[#5A5A5A]">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-square w-full rounded-lg border-2 border-dashed border-[#5A5A5A] hover:border-[#0077FF] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <ImageIcon size={48} className="text-[#797979] mb-2" />
                  <span className="text-[#797979] noto-sans-arabic-medium">اضغط لاختيار صورة</span>
                  <span className="text-[#5A5A5A] text-sm mt-1 noto-sans-arabic-regular">حجم أقصى 5MB</span>
                </label>
              )}
            </div>

            {/* Caption Input */}
            <div className="mb-6">
              <label className="block text-[#B8B8B8] text-sm mb-2 noto-sans-arabic-medium">
                التعليق (اختياري)
              </label>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="أضف وصفاً للصورة"
                className="w-full px-3 py-2 bg-[#3C3C3C] border border-[#5A5A5A] rounded-lg text-white placeholder-[#797979] focus:outline-none focus:border-[#0077FF] noto-sans-arabic-regular"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={cancelAddImage}
                disabled={addGalleryImageMutation.isPending}
                className="flex-1 px-4 py-2 bg-transparent border border-[#5A5A5A] hover:bg-[#3C3C3C] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors noto-sans-arabic-medium text-[#B8B8B8]"
              >
                إلغاء
              </button>
              <button
                onClick={handleUploadGalleryImage}
                disabled={!selectedImageFile || addGalleryImageMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed rounded-lg transition-colors noto-sans-arabic-medium text-white"
              >
                {addGalleryImageMutation.isPending ? 'جاري الرفع...' : 'رفع الصورة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {imageZoomModalOpen && localEntityData.galleryImages && localEntityData.galleryImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-0 bg-[#2C2C2C] rounded-xl overflow-hidden shadow-2xl border border-[#5A5A5A]">
            {/* Image Section */}
            <div className="relative lg:col-span-2 flex items-center justify-center bg-black/50 min-h-[400px] lg:min-h-[600px]">
              <div
                className="absolute inset-0 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url(${localEntityData.galleryImages[currentImageIndex].imageUrl})` }}
              ></div>
              
              {/* Close Button */}
              <button
                onClick={closeImageZoomModal}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
              >
                <X size={24} />
              </button>
              
              {/* Navigation Buttons */}
              {localEntityData.galleryImages.length > 1 && (
                <>
                  <button
                    onClick={navigateToPreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={navigateToNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {/* Edit Section */}
            <div className="flex flex-col p-8">
              <div className="flex-grow flex flex-col gap-4">
                <label className="flex flex-col gap-2">
                  <span className="text-[#797979] text-sm font-medium noto-sans-arabic-medium">التعليق</span>
                  <textarea
                    value={editedCaption}
                    onChange={(e) => setEditedCaption(e.target.value)}
                    placeholder="أضف تعليقاً..."
                    className="w-full rounded-lg bg-[#3C3C3C] text-white border border-[#5A5A5A] focus:ring-1 focus:ring-[#0077FF] focus:border-[#0077FF] placeholder:text-[#797979] min-h-[120px] p-3 text-base noto-sans-arabic-regular resize-none"
                  />
                </label>
              </div>
              
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleUpdateImageCaption}
                  disabled={editedCaption === originalCaption || updateGalleryImageMutation.isPending}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0077FF] hover:bg-[#0066DD] disabled:bg-[#5A5A5A] disabled:cursor-not-allowed text-white text-sm font-bold leading-normal tracking-[0.015em] noto-sans-arabic-bold transition-colors"
                >
                  <span className="truncate">
                    {updateGalleryImageMutation.isPending ? 'جاري التحديث...' : 'تحديث التعليق'}
                  </span>
                </button>
                <button
                  onClick={handleDeleteImageFromZoomModal}
                  disabled={deleteGalleryImageMutation.isPending}
                  className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-[#5A5A5A] hover:bg-[#3C3C3C] disabled:opacity-50 disabled:cursor-not-allowed text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] noto-sans-arabic-bold transition-colors"
                >
                  <Trash2 size={20} className="text-red-400" />
                  <span className="truncate text-red-400">حذف الصورة</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Entity Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteEntityModalOpen}
        onClose={() => setDeleteEntityModalOpen(false)}
        onConfirm={handleDeleteEntity}
        title="حذف الكيان"
        message="هل أنت متأكد من حذف هذا الكيان؟ سيتم حذف جميع المقالات والعلاقات والصور المرتبطة به. لن تتمكن من التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteEntityMutation.isPending}
      />
    </div>
  );
};

export default EntityEditPage;
