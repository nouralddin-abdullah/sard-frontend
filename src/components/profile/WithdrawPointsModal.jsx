import React, { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import vodafoneLogo from "../../assets/vodaphonecash.png";
import instapayLogo from "../../assets/InstaPay_Logo.png";
import paypalLogo from "../../assets/Paypal_2014_logo.webp";
import { BASE_URL } from "../../constants/base-url";
import Cookies from "js-cookie";
import { TOKEN_KEY } from "../../constants/token-key";
import { toast } from "sonner";
import { arabicMessage, readApiError } from "../../utils/api-error";

const WithdrawPointsModal = ({
  isOpen,
  onClose,
  onSuccess,
  currentBalance = 0,
  withdrawable,
  pendingEarnings = 0,
  nextReleaseAt = null,
}) => {
  const [step, setStep] = useState(1); // 1: Amount & Payment, 2: Payment Details
  const [withdrawPoints, setWithdrawPoints] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [paymentDetails, setPaymentDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Only earnings whose hold has ended can be withdrawn, never bought points (the API's wallet says how much). An API
  // without the field yet: the balance, as before; the API refuses what isn't withdrawable anyway.
  const knowsWithdrawable = typeof withdrawable === "number";
  const withdrawableNow = knowsWithdrawable ? withdrawable : currentBalance;
  const releaseDate = nextReleaseAt && !Number.isNaN(new Date(nextReleaseAt).getTime())
    ? new Date(nextReleaseAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const isValidAmount = withdrawPoints >= minWithdraw && withdrawPoints <= withdrawableNow;

  const amountProblem = () => {
    if (withdrawPoints < minWithdraw) {
      return `الحد الأدنى للسحب هو ${minWithdraw.toLocaleString("ar-EG")} نقطة`;
    }
    if (withdrawableNow <= 0) {
      return "لا توجد نقاط قابلة للسحب الآن";
    }
    return `يمكنك سحب ${withdrawableNow.toLocaleString("ar-EG")} نقطة فقط الآن`;
  };

  const handleQuickAmount = (amount) => {
    if (amount <= withdrawableNow) {
      setWithdrawPoints(amount);
    }
  };

  const handleNext = () => {
    if (isValidAmount) {
      setStep(2);
    }
  };

  const handleSubmit = async () => {
    if (!paymentDetails.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Match API withdrawal method names exactly
    const withdrawalMethodMap = {
      'vodafone': 'VodafoneCash',
      'instapay': 'InstaPay',
      'paypal': 'PayPal'
    };

    const requestBody = {
      pointsRequested: withdrawPoints,
      withdrawalMethod: withdrawalMethodMap[paymentMethod],
      paymentDetails: paymentDetails.trim()
    };

    try {
      const token = Cookies.get(TOKEN_KEY);
      const response = await fetch(`${BASE_URL}/api/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': '*/*'
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Show success message in Arabic
          const arabicMessage = `تم إرسال طلب السحب بنجاح. المبلغ الصافي: ${data.netAmountEGP || finalAmountEGP.toFixed(3)} جنيه. سيتم معالجته قريباً.`;
          toast.success(arabicMessage);
          if (onSuccess) onSuccess();
          handleCancel();
        } else {
          toast.error(arabicMessage(data.message) || 'فشل إرسال طلب السحب. حاول مرة أخرى.');
        }
      } else {
        // {success: false, code, message}; the message may still be English.
        const { message } = await readApiError(response);
        toast.error(message || 'فشل إرسال طلب السحب. حاول مرة أخرى.');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('حدث خطأ في الاتصال. تحقق من اتصالك بالإنترنت.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStep(1);
    setWithdrawPoints(1000);
    setPaymentMethod("vodafone");
    setPaymentDetails("");
    setIsSubmitting(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-[#2C2C2C] rounded-xl border border-[#3A3A3A] shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {step === 1 ? (
          /* Step 1: Amount & Payment Method */
          <div className="px-8 py-6">
            {/* Header with Close Button */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-4xl font-black leading-tight tracking-tight noto-sans-arabic-bold">
                  سحب النقاط
                </h2>
                <p className="text-[#9db9a6] text-base font-normal leading-normal noto-sans-arabic-regular">
                  اسحب أرباحك واستلم المبلغ بطريقتك المفضلة
                </p>
              </div>
              <button aria-label="إغلاق"
                onClick={onClose}
                className="p-2 text-[#B8B8B8] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Amount & Payment */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                {/* What can be withdrawn now, the balance, and earnings still on hold */}
                <div className="bg-gradient-to-br from-[#16a34a]/20 to-[#15803d]/20 border border-[#16a34a]/30 rounded-xl p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular mb-1">
                        {knowsWithdrawable ? "القابل للسحب الآن" : "رصيدك الحالي"}
                      </p>
                      <p className="text-white text-3xl font-bold noto-sans-arabic-bold">{withdrawableNow.toLocaleString("ar-EG")} نقطة</p>
                    </div>
                    {knowsWithdrawable && (
                      <div>
                        <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular mb-1">رصيدك الحالي</p>
                        <p className="text-[#E0E0E0] text-2xl font-bold noto-sans-arabic-bold">{currentBalance.toLocaleString("ar-EG")} نقطة</p>
                      </div>
                    )}
                  </div>
                  {pendingEarnings > 0 && (
                    <p className="text-[#B8B8B8] text-sm mt-4 noto-sans-arabic-regular">
                      أرباح قيد الانتظار:{" "}
                      <span className="text-white font-semibold noto-sans-arabic-medium">{pendingEarnings.toLocaleString("ar-EG")} نقطة</span>
                      {releaseDate && (
                        <>
                          ، يصبح أولها قابلًا للسحب في{" "}
                          <span className="text-white font-semibold noto-sans-arabic-medium">{releaseDate}</span>
                        </>
                      )}
                    </p>
                  )}
                  {knowsWithdrawable && (
                    <p className="text-[#9db9a6] text-xs leading-relaxed mt-3 noto-sans-arabic-regular">
                      تُسحب أرباح الهدايا واشتراكات الوصول المبكر وحدها، بعد 30 يومًا من استلامها. أما النقاط المشحونة أو المشتراة فتُستخدم داخل سرد ولا تُسحب.
                    </p>
                  )}
                </div>

                {/* Enter Amount */}
                <div>
                  <h3 className="text-white text-[22px] font-bold leading-tight tracking-tight pb-4 noto-sans-arabic-bold">
                    أدخل الكمية
                  </h3>
                  <div className="bg-transparent rounded-xl border border-[#3A3A3A] p-6">
                    <label 
                      className="text-[#9db9a6] text-sm font-medium noto-sans-arabic-medium" 
                      htmlFor="custom-points"
                    >
                      أدخل عدد النقاط المخصص (الحد الأدنى: {minWithdraw.toLocaleString("ar-EG")})
                    </label>
                    <div className="relative mt-3">
                      <input
                        className="w-full text-center text-5xl font-bold bg-transparent border-0 border-b-2 border-[#3A3A3A] focus:ring-0 focus:border-[#16a34a] text-white transition-colors duration-200 pb-2 noto-sans-arabic-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        id="custom-points"
                        placeholder="1000"
                        type="number"
                        min={minWithdraw}
                        max={withdrawableNow}
                        value={withdrawPoints}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "") {
                            setWithdrawPoints("");
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue >= 0) {
                              setWithdrawPoints(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (value === "" || parseInt(value) < minWithdraw) {
                            setWithdrawPoints(minWithdraw);
                          }
                        }}
                      />
                      <span className="absolute left-0 bottom-2 text-[#686868] text-lg font-medium noto-sans-arabic-medium pointer-events-none">
                        نقطة
                      </span>
                    </div>
                    {!isValidAmount && withdrawPoints > 0 && (
                      <p className="text-red-400 text-sm mt-3 noto-sans-arabic-regular">
                        {amountProblem()}
                      </p>
                    )}
                    <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
                      {[1000, 2000, 3000, 5000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          disabled={amount > withdrawableNow}
                          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 noto-sans-arabic-medium ${
                            amount > withdrawableNow
                              ? "bg-[#3A3A3A] text-[#686868] cursor-not-allowed"
                              : withdrawPoints === amount
                              ? "bg-[#16a34a]/20 text-[#16a34a] border-2 border-[#16a34a]"
                              : "bg-[#3A3A3A] text-white hover:bg-[#4A4A4A]"
                          }`}
                        >
                          {amount.toLocaleString("ar-EG")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="text-white text-[22px] font-bold leading-tight tracking-tight pb-4 noto-sans-arabic-bold">
                    اختر طريقة الاستلام
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Vodafone Cash */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "vodafone"
                        ? "ring-2 ring-[#16a34a]/80 border-[#16a34a]"
                        : "border-[#3A3A3A] hover:border-[#16a34a]/50"
                    }`}>
                      <input
                        className="sr-only"
                        name="payment_method"
                        type="radio"
                        value="vodafone"
                        checked={paymentMethod === "vodafone"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <img
                        className="h-8 mb-2"
                        alt="Vodafone Cash Logo"
                        src={vodafoneLogo}
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        Vodafone Cash
                      </p>
                    </label>

                    {/* InstaPay */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "instapay"
                        ? "ring-2 ring-[#16a34a]/80 border-[#16a34a]"
                        : "border-[#3A3A3A] hover:border-[#16a34a]/50"
                    }`}>
                      <input
                        className="sr-only"
                        name="payment_method"
                        type="radio"
                        value="instapay"
                        checked={paymentMethod === "instapay"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <img
                        className="h-8 mb-2"
                        alt="InstaPay Logo"
                        src={instapayLogo}
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        InstaPay
                      </p>
                    </label>

                    {/* PayPal */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "paypal"
                        ? "ring-2 ring-[#16a34a]/80 border-[#16a34a]"
                        : "border-[#3A3A3A] hover:border-[#16a34a]/50"
                    }`}>
                      <input
                        className="sr-only"
                        name="payment_method"
                        type="radio"
                        value="paypal"
                        checked={paymentMethod === "paypal"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <img
                        className="h-6 mb-2"
                        alt="PayPal Logo"
                        src={paypalLogo}
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        PayPal
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Withdrawal Summary */}
              <div className="lg:col-span-1">
                <div className="bg-transparent border border-[#3A3A3A] rounded-xl p-6 sticky top-4">
                  <h3 className="text-white text-[22px] font-bold leading-tight tracking-tight pb-3 noto-sans-arabic-bold">
                    ملخص السحب
                  </h3>
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 pb-4 border-b border-[#3A3A3A]">
                      <div className="flex justify-between items-center">
                        <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">النقاط</p>
                        <p className="text-white font-semibold noto-sans-arabic-medium">{(withdrawPoints || 0).toLocaleString("ar-EG")}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">المبلغ الأساسي</p>
                        <p className="text-white font-semibold noto-sans-arabic-medium">
                          {isPayPal 
                            ? `$${(baseAmount / usdToEgp).toFixed(2)}`
                            : `${baseAmount.toFixed(2)} جنيه`
                          }
                        </p>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">ضريبة (10%)</p>
                        <p className="text-red-400 font-semibold noto-sans-arabic-medium">
                          - {isPayPal 
                            ? `$${(taxAmount / usdToEgp).toFixed(2)}`
                            : `${taxAmount.toFixed(2)} جنيه`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-white font-bold text-lg noto-sans-arabic-bold">المبلغ المستلم</p>
                      <p className="text-[#16a34a] font-bold text-2xl noto-sans-arabic-bold">
                        {isPayPal ? "$" : ""}{displayAmount.toFixed(2)}{!isPayPal ? " جنيه" : ""}
                      </p>
                    </div>
                    <button 
                      onClick={handleNext}
                      disabled={!isValidAmount}
                      className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition-colors noto-sans-arabic-bold ${
                        isValidAmount
                          ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                          : "bg-[#3A3A3A] text-[#686868] cursor-not-allowed"
                      }`}
                    >
                      <span>متابعة</span>
                      <ArrowLeft size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Payment Details */
          <div className="px-8 py-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-4xl font-black leading-tight tracking-tight noto-sans-arabic-bold">
                  بيانات الاستلام
                </h2>
                <p className="text-[#9db9a6] text-base font-normal leading-normal noto-sans-arabic-regular">
                  أدخل بياناتك لاستلام المبلغ
                </p>
              </div>
              <button aria-label="إغلاق"
                onClick={onClose}
                className="p-2 text-[#B8B8B8] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              {/* Summary Card */}
              <div className="bg-[#1A1A1A] border border-[#3A3A3A] rounded-xl p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[#B8B8B8] text-sm mb-2 noto-sans-arabic-regular">النقاط المسحوبة</p>
                    <p className="text-white text-2xl font-bold noto-sans-arabic-bold">{withdrawPoints.toLocaleString("ar-EG")}</p>
                  </div>
                  <div>
                    <p className="text-[#B8B8B8] text-sm mb-2 noto-sans-arabic-regular">المبلغ المستلم</p>
                    <p className="text-[#16a34a] text-2xl font-bold noto-sans-arabic-bold">
                      {isPayPal ? "$" : ""}{displayAmount.toFixed(2)}{!isPayPal ? " جنيه" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Details Input */}
              <div>
                <label className="block text-white text-base font-bold mb-3 noto-sans-arabic-bold">
                  {getPaymentMethodLabel()}
                </label>
                <input
                  type="text"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  className="w-full bg-[#1A1A1A] border border-[#3A3A3A] text-white text-lg px-4 py-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16a34a] noto-sans-arabic-regular"
                  placeholder={getPaymentMethodPlaceholder()}
                  dir={paymentMethod === "paypal" ? "ltr" : "rtl"}
                />
                <p className="text-[#B8B8B8] text-sm mt-2 noto-sans-arabic-regular">
                  تأكد من إدخال البيانات بشكل صحيح لتجنب أي تأخير في استلام المبلغ
                </p>
              </div>

              {/* Important Note */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
                <div className="flex gap-3">
                  <div className="text-yellow-500 text-2xl flex-shrink-0">⚠️</div>
                  <div className="flex-1">
                    <p className="text-yellow-500 font-bold text-base mb-2 noto-sans-arabic-bold">ملاحظة هامة</p>
                    <p className="text-[#B8B8B8] text-sm noto-sans-arabic-regular">
                      سيتم مراجعة طلب السحب خلال 12-24 ساعة. سيتم تحويل المبلغ بعد الموافقة على الطلب.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 px-6 bg-[#1A1A1A] text-white rounded-xl hover:bg-[#3A3A3A] transition-colors font-bold noto-sans-arabic-bold"
                >
                  رجوع
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!paymentDetails.trim() || isSubmitting}
                  className={`flex-1 py-4 px-6 rounded-xl transition-colors font-bold noto-sans-arabic-bold ${
                    paymentDetails.trim() && !isSubmitting
                      ? "bg-[#16a34a] text-white hover:bg-[#15803d]"
                      : "bg-[#3A3A3A] text-[#686868] cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد طلب السحب"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPointsModal;
