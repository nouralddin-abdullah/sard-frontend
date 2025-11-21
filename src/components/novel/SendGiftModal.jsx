import React, { useState } from "react";
import { X, Coins } from "lucide-react";
import flowerGift from "../../assets/gifts/flower-100.png";
import pizzaGift from "../../assets/gifts/pizza-300.png";
import bookGift from "../../assets/gifts/book-500.png";
import crownGift from "../../assets/gifts/Crown-1000.png";
import scepterGift from "../../assets/gifts/Scepter-1500.png";
import castleGift from "../../assets/gifts/Castle-2000.png";
import dragonGift from "../../assets/gifts/Dragon-5000.png";
import universeGift from "../../assets/gifts/Universe-10000.png";

const SendGiftModal = ({ isOpen, onClose, novelTitle }) => {
  const [selectedGift, setSelectedGift] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Static user coins balance
  const userCoins = 15000;

  const gifts = [
    { id: "flower", image: flowerGift, name: "زهرة", nameEn: "Flower", cost: 100 },
    { id: "pizza", image: pizzaGift, name: "بيتزا", nameEn: "Pizza", cost: 300 },
    { id: "book", image: bookGift, name: "كتاب", nameEn: "Book", cost: 500 },
    { id: "crown", image: crownGift, name: "تاج", nameEn: "Crown", cost: 1000 },
    { id: "scepter", image: scepterGift, name: "صولجان", nameEn: "Scepter", cost: 1500 },
    { id: "castle", image: castleGift, name: "قلعة", nameEn: "Castle", cost: 2000 },
    { id: "dragon", image: dragonGift, name: "تنين", nameEn: "Dragon", cost: 5000 },
    { id: "universe", image: universeGift, name: "كون", nameEn: "Universe", cost: 10000 },
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
    // TODO: Implement API call to send gift
    console.log("Sending gift:", {
      giftId: selectedGift,
      quantity,
      totalCost: getTotalCost(),
    });
    onClose();
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
        <div className="flex items-center justify-between border-b border-[#3C3C3C] p-4 sm:p-6">
          <h3 className="text-white text-xl font-bold noto-sans-arabic-extrabold">
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
        <div className="p-4 sm:p-6">
          <div className="space-y-4">
            {/* Current Balance */}
            <div className="flex items-center justify-between rounded-lg bg-[#2C2C2C] p-3 border border-[#3C3C3C]">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#FFD700]" />
                <span className="text-sm font-medium text-white noto-sans-arabic-extrabold">
                  رصيدك الحالي:
                </span>
              </div>
              <div className="text-lg font-bold text-[#FFD700] noto-sans-arabic-extrabold">
                {userCoins.toLocaleString("ar-SA")} نقطة
              </div>
            </div>

            {/* Gift Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white noto-sans-arabic-extrabold">
                اختر هدية
              </label>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {gifts.map((gift) => (
                  <div
                    key={gift.id}
                    onClick={() => handleGiftSelect(gift.id)}
                    className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all ${
                      selectedGift === gift.id
                        ? "border-[#4A9EFF] bg-[#4A9EFF]/10"
                        : "border-transparent bg-[#2C2C2C] hover:border-[#4A9EFF]/50"
                    }`}
                  >
                    <img src={gift.image} alt={gift.name} className="w-12 h-12 object-contain mx-auto" />
                    <div className="mt-1 font-bold text-white noto-sans-arabic-extrabold text-sm">
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
                className="mb-2 block text-sm font-medium text-white noto-sans-arabic-extrabold"
              >
                الكمية
              </label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="w-full rounded-lg border border-[#3C3C3C] bg-[#2C2C2C] p-3 text-white placeholder:text-[#B0B0B0] focus:border-[#4A9EFF] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/20 noto-sans-arabic-medium"
              />
            </div>

            {/* Total Cost */}
            <div className="flex items-center justify-between rounded-lg bg-[#2C2C2C] p-3 border border-[#3C3C3C]">
              <div className="text-sm font-medium text-white noto-sans-arabic-extrabold">
                التكلفة الإجمالية:
              </div>
              <div className="text-lg font-bold text-[#4A9EFF] noto-sans-arabic-extrabold">
                {getTotalCost().toLocaleString("ar-SA")} نقطة
              </div>
            </div>

            {/* Insufficient Balance Warning */}
            {getTotalCost() > userCoins && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/50 p-3">
                <p className="text-sm text-red-400 noto-sans-arabic-medium">
                  رصيدك غير كافٍ لإرسال هذه الهدية
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-[#3C3C3C] p-4 sm:flex-row sm:justify-end sm:p-6">
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg h-11 px-6 bg-[#2C2C2C] text-white text-base font-bold noto-sans-arabic-extrabold hover:bg-[#3C3C3C] transition-colors w-full sm:w-auto"
          >
            إلغاء
          </button>
          <button
            onClick={handleSendGift}
            disabled={!selectedGift || getTotalCost() > userCoins}
            className="flex items-center justify-center rounded-lg h-11 px-6 bg-[#4A9EFF] text-white text-base font-bold noto-sans-arabic-extrabold hover:bg-[#3A8EEF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            إرسال الهدية
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendGiftModal;
