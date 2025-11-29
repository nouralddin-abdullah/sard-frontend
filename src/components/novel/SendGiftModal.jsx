import React, { useState, useEffect } from "react";
import { X, Coins } from "lucide-react";
import { toast } from "sonner";
import { useSendGift } from "../../hooks/novel/useSendGift";
import { useGetWalletBalance } from "../../hooks/wallet/useGetWalletBalance";
import flowerGift from "../../assets/gifts/flower-100.png";
import pizzaGift from "../../assets/gifts/pizza-300.png";
import bookGift from "../../assets/gifts/book-500.png";
import crownGift from "../../assets/gifts/Crown-1000.png";
import scepterGift from "../../assets/gifts/Scepter-1500.png";
import castleGift from "../../assets/gifts/Castle-2000.png";
import dragonGift from "../../assets/gifts/Dragon-5000.png";
import universeGift from "../../assets/gifts/Universe-10000.png";

const SendGiftModal = ({ isOpen, onClose, novelTitle, novelId, preselectedGiftId = null }) => {
  const [selectedGift, setSelectedGift] = useState(preselectedGiftId);
  const [quantity, setQuantity] = useState(1);
  
  const { mutate: sendGift, isPending: isSending } = useSendGift();
  const { data: walletData, isLoading: isLoadingWallet } = useGetWalletBalance(isOpen);

  // Update selected gift when preselectedGiftId changes
  useEffect(() => {
    if (preselectedGiftId) {
      setSelectedGift(preselectedGiftId);
    }
  }, [preselectedGiftId]);

  // Get user's actual wallet balance
  const userCoins = walletData?.currentBalance || 0;

  // Gifts data matching the API structure with local images
  const gifts = [
    { id: "ec16dfde-71b8-4e23-8ff5-d1846cdf2036", image: flowerGift, name: "وردة", cost: 100 },
    { id: "88103b01-2e5b-4d06-9ff3-2724f4afba52", image: pizzaGift, name: "بيتزا", cost: 300 },
    { id: "9e17512a-269a-43e8-a571-1a1dc541cb5a", image: bookGift, name: "كتاب", cost: 500 },
    { id: "48bdfb35-9f2c-4198-80c1-58f28eb648ef", image: crownGift, name: "تاج", cost: 1000 },
    { id: "e6bfb3e7-6273-4e6b-a577-6afa71055bce", image: scepterGift, name: "صولجان", cost: 1500 },
    { id: "a4005ee7-f2a5-488a-8757-574030513cd4", image: castleGift, name: "قلعة", cost: 2000 },
    { id: "955f63a6-5f4e-4b10-8743-8ea11f544bae", image: dragonGift, name: "تنين", cost: 5000 },
    { id: "50ca3576-e6ee-4708-8d7d-4e9ce82cf722", image: universeGift, name: "مجرة", cost: 10000 },
  ];

  const handleGiftSelect = (giftId) => {
    setSelectedGift(giftId);
  };

  const getTotalCost = () => {
    if (!selectedGift) return 0;
    const gift = gifts.find((g) => g.id === selectedGift);
    return gift ? gift.cost * quantity : 0;
  };

  const handleSendGift = () => {
    if (!selectedGift || !novelId) return;

    const selectedGiftData = gifts.find((g) => g.id === selectedGift);

    sendGift(
      {
        giftId: selectedGift,
        novelId: novelId,
        count: quantity,
      },
      {
        onSuccess: (data) => {
          // Create custom Arabic success message
          const message = `تم إرسال ${quantity}x ${selectedGiftData?.name} إلى ${novelTitle} بنجاح!`;
          toast.success(message);
          onClose();
          // Reset state
          setQuantity(1);
        },
        onError: (error) => {
          toast.error(error.message || "فشل إرسال الهدية");
        },
      }
    );
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value >= 1) {
      setQuantity(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-lg rounded-xl bg-[#1A1A1A] border border-[#3C3C3C] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#3C3C3C] p-3 sm:p-4">
          <h3 className="text-white text-lg font-bold noto-sans-arabic-extrabold">
            إرسال هدية إلى {novelTitle}
          </h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2C2C2C] text-[#B0B0B0] hover:bg-[#3C3C3C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Current Balance */}
            <div className="flex items-center justify-between rounded-lg bg-[#2C2C2C] p-2.5 border border-[#3C3C3C]">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-[#4A9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-white noto-sans-arabic-extrabold">
                  رصيدك الحالي:
                </span>
              </div>
              <div className="text-base font-bold text-white noto-sans-arabic-extrabold">
                {userCoins.toLocaleString("ar-SA")} نقطة
              </div>
            </div>

            {/* Gift Selection */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-white noto-sans-arabic-extrabold">
                اختر هدية
              </label>
              <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto pb-2 md:pb-0 md:overflow-visible scrollbar-hide">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    onClick={() => handleGiftSelect(gift.id)}
                    className={`cursor-pointer rounded-lg border-2 p-2 text-center transition-all flex-shrink-0 min-w-[80px] md:min-w-0 ${
                      selectedGift === gift.id
                        ? "border-[#4A9EFF] bg-[#4A9EFF]/10"
                        : "border-transparent bg-[#2C2C2C] hover:border-[#4A9EFF]/50"
                    }`}
                  >
                    <img src={gift.image} alt={gift.name} className="w-10 h-10 object-contain mx-auto" />
                    <div className="mt-0.5 font-bold text-white noto-sans-arabic-extrabold text-sm">
                      {gift.name}
                    </div>
                    <p className="text-xs text-[#B0B0B0] noto-sans-arabic-medium">
                      {gift.cost.toLocaleString("ar-SA")} نقطة
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label
                htmlFor="quantity"
                className="mb-1.5 block text-sm font-medium text-white noto-sans-arabic-extrabold"
              >
                الكمية
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full rounded-lg border border-[#3C3C3C] bg-[#2C2C2C] p-2.5 text-white placeholder:text-[#B0B0B0] focus:border-[#4A9EFF] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/20 noto-sans-arabic-medium"
              />
            </div>

            {/* Total Cost */}
            <div className="flex items-center justify-between rounded-lg bg-[#2C2C2C] p-2.5 border border-[#3C3C3C]">
              <div className="text-sm font-medium text-white noto-sans-arabic-extrabold">
                التكلفة الإجمالية:
              </div>
              <div className="text-base font-bold text-[#4A9EFF] noto-sans-arabic-extrabold">
                {getTotalCost().toLocaleString("ar-SA")} نقطة
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {getTotalCost() > userCoins && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-2.5">
                <p className="text-sm text-red-400 noto-sans-arabic-medium">
                  رصيدك غير كافٍ لإرسال هذه الهدية
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[#3C3C3C] p-3 sm:flex-row sm:justify-end sm:p-4">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#2C2C2C] text-white text-base font-bold noto-sans-arabic-extrabold hover:bg-[#3C3C3C] transition-colors w-full sm:w-auto"
          >
            إلغاء
          </button>
          <button
            onClick={handleSendGift}
            disabled={!selectedGift || getTotalCost() > userCoins || isSending}
            className="flex items-center justify-center rounded-lg h-10 px-5 bg-[#4A9EFF] text-white text-base font-bold noto-sans-arabic-extrabold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            {isSending ? "جاري الإرسال..." : "إرسال الهدية"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendGiftModal;
