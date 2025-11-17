import React, { useState } from "react";
import { X, ArrowRight, ArrowLeft, Wallet, TrendingDown } from "lucide-react";
import vodafoneLogo from "../../assets/vodaphonecash.png";
import instapayLogo from "../../assets/InstaPay_Logo.png";
import paypalLogo from "../../assets/Paypal_2014_logo.png";

const WithdrawPointsModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Amount & Payment Method, 2: Payment Details
  const [withdrawPoints, setWithdrawPoints] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [paymentDetails, setPaymentDetails] = useState("");

  // User's current balance (TODO: fetch from API)
  const currentBalance = 5000;

  // Withdrawal calculation (10 points = 1 EGP, 10% tax deducted)
  const pricePerPoint = 0.1; // EGP
  const usdToEgp = 47;
  
  const baseAmount = (withdrawPoints || 0) * pricePerPoint; // EGP
  const taxAmount = baseAmount * 0.1; // 10% tax
  const finalAmountEGP = baseAmount - taxAmount; // Amount after tax
  
  // Convert to USD if PayPal is selected
  const isPayPal = paymentMethod === "paypal";
  const displayAmount = isPayPal ? finalAmountEGP / usdToEgp : finalAmountEGP;
  const currency = isPayPal ? "USD" : "جنيه";

  // Minimum withdrawal is 1000 points
  const minWithdraw = 1000;
  const isValidAmount = withdrawPoints >= minWithdraw && withdrawPoints <= currentBalance;

  const handleQuickAmount = (amount) => {
    if (amount <= currentBalance) {
      setWithdrawPoints(amount);
    }
  };

  const handleNext = () => {
    if (isValidAmount) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setPaymentDetails("");
  };

  const handleSubmit = () => {
    // TODO: Submit withdrawal request
    console.log({
      points: withdrawPoints,
      paymentMethod,
      finalAmount: displayAmount,
      currency: isPayPal ? "USD" : "EGP",
      paymentDetails
    });
    // Close modal and show success message
    handleCancel();
  };

  const handleCancel = () => {
    setStep(1);
    setWithdrawPoints(1000);
    setPaymentMethod("vodafone");
    setPaymentDetails("");
    onClose();
  };

  const getPaymentMethodLabel = () => {
    switch (paymentMethod) {
      case "vodafone":
        return "رقم فودافون كاش";
      case "instapay":
        return "بريد إنستاباي أو رقم الهاتف";
      case "paypal":
        return "بريد باي بال";
      default:
        return "";
    }
  };

  const getPaymentMethodPlaceholder = () => {
    switch (paymentMethod) {
      case "vodafone":
        return "01XXXXXXXXX";
      case "instapay":
        return "example@instapay أو 01XXXXXXXXX";
      case "paypal":
        return "example@paypal.com";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#2C2C2C] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#3A3A3A] scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#16a34a]/20 rounded-lg">
              <TrendingDown className="w-6 h-6 text-[#16a34a]" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold noto-sans-arabic-bold">
                سحب النقاط
              </h2>
              <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">
                {step === 1 ? "اختر المبلغ وطريقة الاستلام" : "أدخل بياناتك لاستلام المبلغ"}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-[#3A3A3A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#B8B8B8]" />
          </button>
        </div>

        {/* Step 1: Amount & Payment Method */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-br from-[#16a34a]/20 to-[#15803d]/20 border border-[#16a34a]/30 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#16a34a]/20 rounded-lg">
                    <Wallet className="w-5 h-5 text-[#16a34a]" />
                  </div>
                  <div>
                    <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">رصيدك الحالي</p>
                    <p className="text-white text-2xl font-bold noto-sans-arabic-bold">{currentBalance.toLocaleString("ar-EG")} نقطة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 noto-sans-arabic-medium">
                عدد النقاط المراد سحبها (الحد الأدنى: {minWithdraw.toLocaleString("ar-EG")} نقطة)
              </label>
              <input
                type="number"
                value={withdrawPoints}
                onChange={(e) => setWithdrawPoints(parseInt(e.target.value) || 0)}
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-white text-lg px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] noto-sans-arabic-medium"
                placeholder="أدخل عدد النقاط"
                min={minWithdraw}
                max={currentBalance}
              />
              {!isValidAmount && withdrawPoints > 0 && (
                <p className="text-red-400 text-sm mt-2 noto-sans-arabic-regular">
                  {withdrawPoints < minWithdraw 
                    ? `الحد الأدنى للسحب هو ${minWithdraw.toLocaleString("ar-EG")} نقطة`
                    : "الرصيد غير كافٍ"
                  }
                </p>
              )}
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-3">
              {[1000, 2000, 3000, 5000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleQuickAmount(amount)}
                  disabled={amount > currentBalance}
                  className={`py-3 px-2 rounded-lg border-2 transition-all noto-sans-arabic-medium ${
                    withdrawPoints === amount
                      ? "border-[#16a34a] bg-[#16a34a]/20 text-[#16a34a]"
                      : amount > currentBalance
                      ? "border-[#3A3A3A] bg-[#1A1A1A] text-[#686868] cursor-not-allowed"
                      : "border-[#3A3A3A] bg-[#1A1A1A] text-white hover:border-[#16a34a] hover:bg-[#16a34a]/10"
                  }`}
                >
                  {amount.toLocaleString("ar-EG")}
                </button>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#3A3A3A]">
              <h3 className="text-white text-base font-semibold mb-4 noto-sans-arabic-bold">
                تفاصيل المبلغ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#B8B8B8] noto-sans-arabic-regular">المبلغ الأساسي</span>
                  <span className="text-white noto-sans-arabic-medium">
                    {isPayPal 
                      ? `${(baseAmount / usdToEgp).toFixed(2)} USD`
                      : `${baseAmount.toFixed(2)} جنيه`
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#B8B8B8] noto-sans-arabic-regular">ضريبة (10%)</span>
                  <span className="text-red-400 noto-sans-arabic-medium">
                    - {isPayPal 
                      ? `${(taxAmount / usdToEgp).toFixed(2)} USD`
                      : `${taxAmount.toFixed(2)} جنيه`
                    }
                  </span>
                </div>
                <div className="border-t border-[#3A3A3A] pt-3 flex justify-between items-center">
                  <span className="text-white font-semibold noto-sans-arabic-bold">المبلغ النهائي</span>
                  <span className="text-[#16a34a] text-xl font-bold noto-sans-arabic-bold">
                    {displayAmount.toFixed(2)} {currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 noto-sans-arabic-medium">
                طريقة استلام المبلغ
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* Vodafone Cash */}
                <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "vodafone"
                    ? "border-[#16a34a] bg-[#16a34a]/10"
                    : "border-[#3A3A3A] bg-[#1A1A1A] hover:border-[#16a34a]/50"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vodafone"
                    checked={paymentMethod === "vodafone"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <img src={vodafoneLogo} alt="Vodafone Cash" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-white font-medium noto-sans-arabic-medium">فودافون كاش</p>
                      <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">استلام بالجنيه المصري</p>
                    </div>
                  </div>
                  {paymentMethod === "vodafone" && (
                    <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>

                {/* InstaPay */}
                <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "instapay"
                    ? "border-[#16a34a] bg-[#16a34a]/10"
                    : "border-[#3A3A3A] bg-[#1A1A1A] hover:border-[#16a34a]/50"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="instapay"
                    checked={paymentMethod === "instapay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <img src={instapayLogo} alt="InstaPay" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-white font-medium noto-sans-arabic-medium">إنستاباي</p>
                      <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">استلام بالجنيه المصري</p>
                    </div>
                  </div>
                  {paymentMethod === "instapay" && (
                    <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>

                {/* PayPal */}
                <label className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  paymentMethod === "paypal"
                    ? "border-[#16a34a] bg-[#16a34a]/10"
                    : "border-[#3A3A3A] bg-[#1A1A1A] hover:border-[#16a34a]/50"
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === "paypal"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <img src={paypalLogo} alt="PayPal" className="w-12 h-12 object-contain" />
                    <div>
                      <p className="text-white font-medium noto-sans-arabic-medium">باي بال</p>
                      <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">استلام بالدولار الأمريكي</p>
                    </div>
                  </div>
                  {paymentMethod === "paypal" && (
                    <div className="w-5 h-5 bg-[#16a34a] rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors noto-sans-arabic-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleNext}
                disabled={!isValidAmount}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 noto-sans-arabic-bold ${
                  isValidAmount
                    ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                    : "bg-[#3A3A3A] text-[#686868] cursor-not-allowed"
                }`}
              >
                <span>التالي</span>
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment Details */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            {/* Summary Card */}
            <div className="bg-[#1A1A1A] rounded-xl p-5 border border-[#3A3A3A]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">النقاط المسحوبة</p>
                  <p className="text-white text-lg font-bold noto-sans-arabic-bold">{withdrawPoints.toLocaleString("ar-EG")} نقطة</p>
                </div>
                <div>
                  <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">المبلغ المستلم</p>
                  <p className="text-[#16a34a] text-lg font-bold noto-sans-arabic-bold">{displayAmount.toFixed(2)} {currency}</p>
                </div>
              </div>
            </div>

            {/* Payment Details Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-3 noto-sans-arabic-medium">
                {getPaymentMethodLabel()}
              </label>
              <input
                type="text"
                value={paymentDetails}
                onChange={(e) => setPaymentDetails(e.target.value)}
                className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-white text-base px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] noto-sans-arabic-regular"
                placeholder={getPaymentMethodPlaceholder()}
                dir={paymentMethod === "paypal" ? "ltr" : "rtl"}
              />
              <p className="text-[#B8B8B8] text-sm mt-2 noto-sans-arabic-regular">
                تأكد من إدخال البيانات بشكل صحيح لتجنب أي تأخير في استلام المبلغ
              </p>
            </div>

            {/* Important Note */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-yellow-500 text-xl">⚠️</div>
                <div className="flex-1">
                  <p className="text-yellow-500 font-medium mb-1 noto-sans-arabic-medium">ملاحظة هامة</p>
                  <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">
                    سيتم مراجعة طلب السحب خلال 12-24 ساعة. سيتم تحويل المبلغ بعد الموافقة على الطلب.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleBack}
                className="flex-1 py-3 px-4 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors flex items-center justify-center gap-2 noto-sans-arabic-medium"
              >
                <ArrowRight className="w-5 h-5" />
                <span>رجوع</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!paymentDetails.trim()}
                className={`flex-1 py-3 px-4 rounded-lg transition-colors noto-sans-arabic-bold ${
                  paymentDetails.trim()
                    ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                    : "bg-[#3A3A3A] text-[#686868] cursor-not-allowed"
                }`}
              >
                تأكيد طلب السحب
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPointsModal;
