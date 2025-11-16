import React, { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon, Info, ArrowRight, ArrowLeft, Copy } from "lucide-react";

const RechargePointsModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1); // 1: Amount & Payment, 2: Upload Proof
  const [customPoints, setCustomPoints] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState("vodafone");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Price calculation (10 points = 1 EGP)
  const pricePerPoint = 0.1;
  const basePrice = (customPoints || 0) * pricePerPoint;
  const transactionFee = basePrice * 0.1; // 10% fee
  const totalPrice = basePrice + transactionFee;

  const handleQuickAmount = (amount) => {
    setCustomPoints(amount);
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("image/")) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleNext = () => {
    // TODO: Save order details
    setStep(2);
  };

  const handleSubmit = () => {
    // TODO: Submit recharge request with proof
    console.log({
      points: customPoints,
      paymentMethod,
      totalPrice,
      proof: uploadedFile
    });
    // Close modal and show success message
    onClose();
  };

  const handleCancel = () => {
    setStep(1);
    setCustomPoints(500);
    setPaymentMethod("vodafone");
    setUploadedFile(null);
    onClose();
  };

  const formatFileSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getPaymentDetails = () => {
    switch (paymentMethod) {
      case "vodafone":
        return {
          label: "رقم فودافون كاش",
          value: "01008396119"
        };
      case "instapay":
        return {
          label: "بريد إنستاباي",
          value: "toasty@instapay"
        };
      case "paypal":
        return {
          label: "بريد باي بال",
          value: "nouralddinabdullah@gmail.com"
        };
      default:
        return null;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // TODO: Show toast notification
    console.log("Copied to clipboard:", text);
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
      <div className="relative z-10 w-full max-w-4xl mx-4 bg-[#2C2C2C] rounded-xl border border-[#3A3A3A] shadow-2xl max-h-[90vh] overflow-y-auto">
        {step === 1 ? (
          /* Step 1: Amount & Payment Method */
          <div className="px-8 py-6">
            {/* Header with Close Button */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-white text-4xl font-black leading-tight tracking-tight noto-sans-arabic-bold">
                  شحن النقاط
                </h2>
                <p className="text-[#9db9a6] text-base font-normal leading-normal noto-sans-arabic-regular">
                  ادعم كتّابك المفضلين من خلال شراء النقاط
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#B8B8B8] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Amount & Payment */}
              <div className="lg:col-span-2 flex flex-col gap-8">
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
                      أدخل عدد النقاط المخصص
                    </label>
                    <div className="relative mt-3">
                      <input
                        className="w-full text-center text-5xl font-bold bg-transparent border-0 border-b-2 border-[#3A3A3A] focus:ring-0 focus:border-[#4A9EFF] text-white transition-colors duration-200 pb-2 noto-sans-arabic-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        id="custom-points"
                        placeholder="500"
                        type="number"
                        min="500"
                        value={customPoints}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow empty string while typing
                          if (value === "") {
                            setCustomPoints("");
                          } else {
                            const numValue = parseInt(value);
                            if (!isNaN(numValue) && numValue >= 0) {
                              setCustomPoints(numValue);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          // Enforce minimum on blur if empty or too small
                          const value = e.target.value;
                          if (value === "" || parseInt(value) < 500) {
                            setCustomPoints(500);
                          }
                        }}
                      />
                      <span className="absolute left-0 bottom-2 text-[#686868] text-lg font-medium noto-sans-arabic-medium pointer-events-none">
                        نقطة
                      </span>
                    </div>
                    <div className="mt-6 flex justify-center items-center gap-4 flex-wrap">
                      {[500, 1000, 2000, 5000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => handleQuickAmount(amount)}
                          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 noto-sans-arabic-medium ${
                            customPoints === amount
                              ? "bg-[#4A9EFF]/20 text-[#4A9EFF] border-2 border-[#4A9EFF]"
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
                    اختر طريقة الدفع
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Vodafone Cash */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "vodafone"
                        ? "ring-2 ring-[#4A9EFF]/80 border-[#4A9EFF]"
                        : "border-[#3A3A3A] hover:border-[#4A9EFF]/50"
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
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmUHToZUa7DzvuD7I-T9UDpE4fWjU4LmAr99AjEA5rZWug1w-g_f-fLpaJ6XnvRJyFFOXcoq_1eb0OG5aL2V83JHyetLXU9ZYk82oyhsSpdT8L_TEjZoqzeRX2VpAo4e2Hfh63jXMv9CVlUO8jrOLNjxALGHjcOF7LP6tqSz2hq3dSAzw6nN2Nv-0kX8YOi4GWjd-TAWo6Rj4XiEd6Aq4eT8N1Ngq8bz759k-lrqxeG4yC10anokgpqNsIi_48SHp1V35vjQRwDNDV"
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        Vodafone Cash
                      </p>
                    </label>

                    {/* InstaPay */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "instapay"
                        ? "ring-2 ring-[#4A9EFF]/80 border-[#4A9EFF]"
                        : "border-[#3A3A3A] hover:border-[#4A9EFF]/50"
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
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhXkCvlTATtfyR1dWEuybgYjaZt3Xwc2Nk-R8YiLXVgsTwOc-oCfHmv2hxREQKhm_PdFvAkJUfmE9srv6Utj8h7ZuPiH7Qn3IDBoACrNIQsewPkLOmMglAUlAu0FVTS6hSJwPxn0Bo2sCcIJLbLXnhsdrso4LgMJcUWudRABFsSmR7LoBm5oJH-fEbxlMcs6hljHFsCOGLsJdUxTM5A1SJJoui2KFJ5c3pq2bjhSZag0K1XLitoaL2fgFi9TlOEy9sBzjBKfste8vl"
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        InstaPay
                      </p>
                    </label>

                    {/* PayPal */}
                    <label className={`relative group cursor-pointer p-4 rounded-xl border flex-1 bg-transparent text-center transition-all duration-200 flex flex-col items-center justify-center h-28 ${
                      paymentMethod === "paypal"
                        ? "ring-2 ring-[#4A9EFF]/80 border-[#4A9EFF]"
                        : "border-[#3A3A3A] hover:border-[#4A9EFF]/50"
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
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuArl0clRxwKXlaJP81PsWzUvB798WEUmKkCIpRQXhe85Tpyog1bCGl33zNSUtpBvAIThjOE25_5amTlxfzhqVhdhVqi5boogfLDTaads1aRa8wOcGyorHL3cSV46TJedo-zuwdQdg8QjJctCUuYSbZuxrWFFrF0F_SW_5faoATHDC3qIs5sL3Nat3XsJ9nTy_1NOeWsP4S8xp5MfOCF34OMF1hgjx2mOoV_cfmgJYFKX2Y_KR1FiWGf7klBypp-WKHfes1BNILGUTtW"
                      />
                      <p className="text-sm font-medium text-[#B8B8B8] noto-sans-arabic-medium">
                        PayPal
                      </p>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-transparent border border-[#3A3A3A] rounded-xl p-6 sticky top-4">
                  <h3 className="text-white text-[22px] font-bold leading-tight tracking-tight pb-3 noto-sans-arabic-bold">
                    ملخص الطلب
                  </h3>
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between gap-x-6 py-2">
                      <p className="text-[#9db9a6] text-sm font-normal leading-normal noto-sans-arabic-regular">
                        النقاط المحددة
                      </p>
                      <p className="text-white text-sm font-medium leading-normal text-right noto-sans-arabic-medium">
                        {(customPoints || 0).toLocaleString("ar-EG")}
                      </p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2">
                      <p className="text-[#9db9a6] text-sm font-normal leading-normal noto-sans-arabic-regular">
                        السعر الأساسي
                      </p>
                      <p className="text-white text-sm font-medium leading-normal text-right noto-sans-arabic-medium">
                        {basePrice.toFixed(2)} جنيه
                      </p>
                    </div>
                    <div className="flex justify-between gap-x-6 py-2">
                      <p className="text-[#9db9a6] text-sm font-normal leading-normal flex items-center gap-1.5 noto-sans-arabic-regular">
                        رسوم المعاملة (10%)
                        <Info size={16} className="cursor-help text-[#686868]" title="هذه الرسوم تغطي تكاليف معالجة الدفع" />
                      </p>
                      <p className="text-white text-sm font-medium leading-normal text-right noto-sans-arabic-medium">
                        {transactionFee.toFixed(2)} جنيه
                      </p>
                    </div>
                  </div>
                  <div className="my-4 h-px bg-[#3A3A3A]"></div>
                  <div className="flex justify-between gap-x-6 py-2">
                    <p className="text-[#B8B8B8] text-base font-bold leading-normal noto-sans-arabic-bold">
                      الإجمالي
                    </p>
                    <p className="text-white text-xl font-bold leading-normal text-right noto-sans-arabic-bold">
                      {totalPrice.toFixed(2)} جنيه
                    </p>
                  </div>
                  <button
                    onClick={handleNext}
                    className="mt-6 w-full h-12 px-6 bg-[#4A9EFF] text-white font-bold rounded-lg text-base hover:bg-[#3A8EEF] focus:outline-none focus:ring-2 focus:ring-[#4A9EFF]/50 transition-colors duration-200 flex items-center justify-center gap-2 noto-sans-arabic-bold"
                  >
                    <span>إتمام الشراء</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Upload Proof */
          <div className="px-8 py-6">
            {/* Header with Close Button */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-2xl font-bold leading-tight tracking-tight noto-sans-arabic-bold">
                  تحميل إثبات الدفع
                </h2>
                <p className="text-[#9db9a6] text-sm font-normal leading-normal noto-sans-arabic-regular">
                  قم برفع لقطة شاشة للمعاملة الناجحة
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#B8B8B8] hover:text-white transition-colors flex-shrink-0"
              >
                <X size={24} />
              </button>
            </div>

            {/* Payment Details */}
            {(() => {
              const paymentDetails = getPaymentDetails();
              return (
                <div className="bg-transparent border border-[#3A3A3A] rounded-xl p-4 mb-6">
                  <h3 className="text-white text-base font-bold mb-3 noto-sans-arabic-bold">
                    معلومات الدفع
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[#9db9a6] text-xs mb-1.5 noto-sans-arabic-regular">
                        {paymentDetails.label}
                      </p>
                      <div className="flex items-center gap-2 bg-[#2C2C2C] rounded-lg px-3 py-2.5 border border-[#3A3A3A]">
                        <code className="flex-1 text-white text-sm font-mono select-all">
                          {paymentDetails.value}
                        </code>
                        <button
                          onClick={() => copyToClipboard(paymentDetails.value)}
                          className="p-1.5 text-[#B8B8B8] hover:text-white transition-colors flex-shrink-0"
                          title="نسخ"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#9db9a6] text-xs noto-sans-arabic-regular">
                      <span className="text-[#B8B8B8]">المبلغ:</span>{" "}
                      <span className="text-white font-bold noto-sans-arabic-bold">{totalPrice.toFixed(2)} جنيه</span>
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Upload Area or File Preview */}
            <div className="flex flex-col my-4">
              {!uploadedFile ? (
                <div
                  className={`flex flex-col items-center gap-6 rounded-xl border-2 border-dashed px-6 py-10 transition-colors cursor-pointer ${
                    isDragging
                      ? "border-[#4A9EFF] bg-[#4A9EFF]/5"
                      : "border-[#3A3A3A] hover:border-[#4A9EFF]/50"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={48} className="text-[#4A9EFF]" />
                  <div className="text-center">
                    <p className="text-white text-lg font-bold noto-sans-arabic-bold">
                      اسحب وأفلت لقطة الشاشة هنا
                    </p>
                    <p className="text-[#B8B8B8] text-sm mt-1 noto-sans-arabic-regular">
                      أو انقر للتصفح
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </div>
              ) : (
                <div className="flex flex-col">
                  <div className="flex items-center gap-4 rounded-xl border border-[#3A3A3A] bg-transparent px-6 py-6">
                    <ImageIcon size={32} className="text-[#4A9EFF] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm noto-sans-arabic-medium truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-[#686868] text-xs">
                        {formatFileSize(uploadedFile.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-[#B8B8B8] transition-colors hover:text-white flex-shrink-0"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex w-full flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#3A3A3A] text-white text-base font-bold leading-normal transition-colors hover:bg-[#4A4A4A] noto-sans-arabic-bold gap-2"
              >
                <ArrowLeft size={20} />
                <span>رجوع</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={!uploadedFile}
                className="flex flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-[#4A9EFF] text-white text-base font-bold leading-normal transition-colors hover:bg-[#3A8EEF] disabled:cursor-not-allowed disabled:opacity-50 noto-sans-arabic-bold"
              >
                <span>إرسال للتحقق</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RechargePointsModal;
