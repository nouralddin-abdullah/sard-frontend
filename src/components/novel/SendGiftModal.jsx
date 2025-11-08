import React, { useState } from "react";
import { X, Coins } from "lucide-react";

const SendGiftModal = ({ isOpen, onClose, novelTitle }) => {
  const [selectedGift, setSelectedGift] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  // Static user coins balance
  const userCoins = 15000;

  const gifts = [
    { id: "diamond", emoji: "💎", name: "ماسة", nameEn: "Diamond", cost: 1000 },
    { id: "rose", emoji: "🌹", name: "وردة", nameEn: "Rose", cost: 500 },
    { id: "coffee", emoji: "☕", name: "قهوة", nameEn: "Coffee", cost: 100 },
    { id: "like", emoji: "👍", name: "إعجاب", nameEn: "Like", cost: 10 },
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
      message,
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
                    <div className="text-4xl">{gift.emoji}</div>
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

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-medium text-white noto-sans-arabic-extrabold"
              >
                أضف رسالة (اختياري)
              </label>
              <textarea
                id="message"
                rows="3"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="شجع الكاتب!"
                className="w-full rounded-lg border border-[#3C3C3C] bg-[#2C2C2C] p-3 text-white placeholder:text-[#B0B0B0] focus:border-[#4A9EFF] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/20 resize-none noto-sans-arabic-medium"
              ></textarea>
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
