import React, { useState } from "react";
import { Loader2, Search, CreditCard, ArrowDownToLine } from "lucide-react";
import RechargePointsModal from "./RechargePointsModal";
import WithdrawPointsModal from "./WithdrawPointsModal";
import { useGetWithdrawHistory } from "../../hooks/wallet/useGetWithdrawHistory";
import { useGetRechargeHistory } from "../../hooks/wallet/useGetRechargeHistory";
import { useGetTransactionHistory } from "../../hooks/wallet/useGetTransactionHistory";
import { useGetWalletBalance } from "../../hooks/wallet/useGetWalletBalance";

const PointsWallet = ({ userId }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("recharge"); // "recharge", "transactions", or "withdraw"
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch wallet balance
  const { 
    data: walletData, 
    isLoading: isLoadingBalance,
    refetch: refetchBalance 
  } = useGetWalletBalance();

  const currentBalance = walletData?.currentBalance || 0;

  // Fetch withdrawal history
  const { 
    data: withdrawData, 
    isLoading: isLoadingWithdraw,
    refetch: refetchWithdraw 
  } = useGetWithdrawHistory(
    currentPage, 
    pageSize, 
    filterStatus !== "all" ? filterStatus : null
  );

  // Fetch recharge history
  const { 
    data: rechargeData, 
    isLoading: isLoadingRecharge,
    refetch: refetchRecharge 
  } = useGetRechargeHistory(
    currentPage, 
    pageSize, 
    filterStatus !== "all" ? filterStatus : null
  );

  // Fetch transaction history
  const { 
    data: transactionData, 
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions 
  } = useGetTransactionHistory(
    currentPage, 
    pageSize
  );
  
  // Map API recharge data to component format
  const rechargeHistory = rechargeData?.requests?.map((request) => ({
    id: `#${request.id.split('-')[0]}`,
    date: request.requestedAt,
    points: request.pointsRequested,
    amount: request.totalAmountEGP, // Total including fee
    baseAmount: request.baseAmountEGP,
    fee: request.transactionFee,
    paymentMethod: request.paymentMethod,
    paymentProofUrl: request.paymentProofUrl,
    status: request.status.toLowerCase(), // "pending", "approved", "rejected"
    processedAt: request.processedAt,
    rejectionReason: request.rejectionReason
  })) || [];

  // Map API transaction data to component format
  const transactionHistory = transactionData?.transactions?.map((transaction) => ({
    id: `#${transaction.id.split('-')[0]}`,
    date: transaction.createdAt,
    type: transaction.type.toLowerCase(), // "recharge", "withdrawal", etc.
    description: transaction.description,
    points: transaction.amount, // Already includes sign (+ or -)
    balanceAfter: transaction.balanceAfter,
    status: "completed" // All transactions in history are completed
  })) || [];

  // Map API withdrawal data to component format
  const withdrawHistory = withdrawData?.requests?.map((request) => ({
    id: `#${request.id.split('-')[0]}`,
    date: request.requestedAt,
    points: request.pointsRequested,
    amount: request.netAmountEGP, // Amount after tax
    baseAmount: request.baseAmountEGP,
    tax: request.taxDeducted,
    withdrawalMethod: request.withdrawalMethod,
    paymentDetails: request.paymentDetails,
    status: request.status.toLowerCase(), // "pending", "approved", "rejected"
    processedAt: request.processedAt,
    rejectionReason: request.rejectionReason
  })) || [];

  const isLoading = activeTab === "recharge" ? isLoadingRecharge : activeTab === "withdraw" ? isLoadingWithdraw : isLoadingTransactions;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status, rejectionReason = null) => {
    const statusConfig = {
      approved: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "مقبول"
      },
      completed: {
        bg: "bg-green-500/20",
        text: "text-green-400",
        label: "مكتمل"
      },
      rejected: {
        bg: "bg-red-500/20",
        text: "text-red-400",
        label: "مرفوض"
      },
      pending: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-400",
        label: "قيد المراجعة"
      }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-x-1.5 rounded-full ${config.bg} px-3 py-1 text-xs font-medium ${config.text} noto-sans-arabic-medium`}>
        <svg className={`h-1.5 w-1.5 fill-current`} viewBox="0 0 6 6">
          <circle cx="3" cy="3" r="3" />
        </svg>
        {config.label}
        {status === "rejected" && rejectionReason && (
          <span className="relative group">
            <svg 
              className="h-3.5 w-3.5 cursor-help" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-max max-w-xs bg-zinc-900 text-white text-xs rounded-lg p-2 shadow-lg border border-zinc-700 z-10">
              <span className="block text-right noto-sans-arabic-regular">{rejectionReason}</span>
              <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-zinc-900"></span>
            </span>
          </span>
        )}
      </span>
    );
  };

  const getTransactionTypeIcon = (type) => {
    return "";
  };

  const currentData = activeTab === "recharge" ? rechargeHistory : activeTab === "withdraw" ? withdrawHistory : transactionHistory;
  
  const filteredData = currentData.filter(item => {
    const matchesSearch = searchQuery === "" || 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.includes(searchQuery)) ||
      (item.amount && item.amount.toString().includes(searchQuery)) ||
      (item.points && Math.abs(item.points).toString().includes(searchQuery));
    
    const matchesFilter = filterStatus === "all" || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="bg-zinc-800 min-h-screen flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4A9EFF]" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-800 min-h-screen">
      <div className="p-6 md:p-10">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row flex-wrap justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight noto-sans-arabic-bold">
              المحفظة
            </h1>
            <p className="text-[#9db9a6] text-base font-normal leading-normal noto-sans-arabic-regular">
              {activeTab === "recharge" 
                ? "عرض حالة جميع طلبات شحن النقاط السابقة"
                : activeTab === "withdraw"
                ? "عرض حالة جميع طلبات سحب النقاط السابقة"
                : "عرض جميع المعاملات والنفقات الخاصة بالنقاط"
              }
            </p>
          </div>
          
          {/* Balance and Action Buttons - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
            {/* Balance Display */}
            <div className="flex items-center justify-center gap-2 bg-[#2C2C2C] px-4 py-2 rounded-lg">
              <svg className="w-5 h-5 text-[#4A9EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isLoadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <span className="text-white font-bold noto-sans-arabic-bold">{currentBalance.toLocaleString("ar-EG")} نقطة</span>
              )}
            </div>
            
            {/* Action Buttons - Stack on mobile only */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button 
                className="flex items-center justify-center gap-2 h-10 px-5 bg-[#4A9EFF] text-white font-medium rounded-lg whitespace-nowrap hover:bg-[#3A8EEF] transition-colors noto-sans-arabic-bold"
                onClick={() => setIsRechargeModalOpen(true)}
              >
                <CreditCard size={20} />
                <span>شحن النقاط</span>
              </button>
              <button 
                className="flex items-center justify-center gap-2 h-10 px-5 bg-[#16a34a] text-white font-medium rounded-lg whitespace-nowrap hover:bg-[#15803d] transition-colors noto-sans-arabic-bold"
                onClick={() => setIsWithdrawModalOpen(true)}
              >
                <ArrowDownToLine size={20} />
                <span>سحب النقاط</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#3A3A3A] overflow-x-auto">
          <button
            className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors noto-sans-arabic-medium relative whitespace-nowrap ${
              activeTab === "recharge"
                ? "text-[#4A9EFF] border-b-2 border-[#4A9EFF]"
                : "text-[#B8B8B8] hover:text-white"
            }`}
            onClick={() => {
              setActiveTab("recharge");
              setFilterStatus("all");
              setSearchQuery("");
            }}
          >
            سجل الشحن
          </button>
          <button
            className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors noto-sans-arabic-medium relative whitespace-nowrap ${
              activeTab === "withdraw"
                ? "text-[#4A9EFF] border-b-2 border-[#4A9EFF]"
                : "text-[#B8B8B8] hover:text-white"
            }`}
            onClick={() => {
              setActiveTab("withdraw");
              setFilterStatus("all");
              setSearchQuery("");
            }}
          >
            سجل السحب
          </button>
          <button
            className={`px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors noto-sans-arabic-medium relative whitespace-nowrap ${
              activeTab === "transactions"
                ? "text-[#4A9EFF] border-b-2 border-[#4A9EFF]"
                : "text-[#B8B8B8] hover:text-white"
            }`}
            onClick={() => {
              setActiveTab("transactions");
              setFilterStatus("all");
              setSearchQuery("");
            }}
          >
            سجل المعاملات
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="flex items-center h-12 w-full rounded-lg border border-[#3A3A3A] bg-[#2C2C2C] overflow-hidden">
              <div className="flex items-center justify-center pl-4">
                <Search size={20} className="text-[#686868]" />
              </div>
              <input
                type="text"
                className="flex-1 h-full bg-transparent text-white px-4 focus:outline-none placeholder:text-[#686868] noto-sans-arabic-regular"
                placeholder="البحث بالمبلغ، التاريخ، أو المعرف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 p-1 bg-[#2C2C2C] rounded-lg items-center">
            <button
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 transition-colors noto-sans-arabic-medium ${
                filterStatus === "all"
                  ? "bg-[#4A9EFF]/20 text-[#4A9EFF]"
                  : "text-[#B8B8B8] hover:bg-[#3A3A3A]"
              }`}
              onClick={() => setFilterStatus("all")}
            >
              <p className="text-sm font-medium leading-normal">الكل</p>
            </button>
            <button
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 transition-colors noto-sans-arabic-medium ${
                filterStatus === "pending"
                  ? "bg-[#4A9EFF]/20 text-[#4A9EFF]"
                  : "text-[#B8B8B8] hover:bg-[#3A3A3A]"
              }`}
              onClick={() => setFilterStatus("pending")}
            >
              <p className="text-sm font-medium leading-normal">قيد المراجعة</p>
            </button>
            <button
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 transition-colors noto-sans-arabic-medium ${
                filterStatus === (activeTab === "recharge" || activeTab === "withdraw" ? "approved" : "completed")
                  ? "bg-[#4A9EFF]/20 text-[#4A9EFF]"
                  : "text-[#B8B8B8] hover:bg-[#3A3A3A]"
              }`}
              onClick={() => setFilterStatus(activeTab === "recharge" || activeTab === "withdraw" ? "approved" : "completed")}
            >
              <p className="text-sm font-medium leading-normal">
                {activeTab === "recharge" || activeTab === "withdraw" ? "مقبول" : "مكتمل"}
              </p>
            </button>
            {(activeTab === "recharge" || activeTab === "withdraw") && (
              <button
                className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 transition-colors noto-sans-arabic-medium ${
                  filterStatus === "rejected"
                    ? "bg-[#4A9EFF]/20 text-[#4A9EFF]"
                    : "text-[#B8B8B8] hover:bg-[#3A3A3A]"
                }`}
                onClick={() => setFilterStatus("rejected")}
              >
                <p className="text-sm font-medium leading-normal">مرفوض</p>
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-xl border border-[#3A3A3A] bg-transparent">
              <table className="min-w-full divide-y divide-[#3A3A3A]">
                <thead className="bg-[#2C2C2C]">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                      التاريخ
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                      معرف المعاملة
                    </th>
                    {activeTab === "transactions" && (
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                        الوصف
                      </th>
                    )}
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                      النقاط
                    </th>
                    {(activeTab === "recharge" || activeTab === "withdraw") && (
                      <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                        المبلغ
                      </th>
                    )}
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-[#B8B8B8] uppercase tracking-wider noto-sans-arabic-medium">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3A3A3A] bg-transparent">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={activeTab === "recharge" ? "5" : "5"} className="px-6 py-12 text-center">
                        <p className="text-[#686868] text-lg noto-sans-arabic-medium">
                          لا توجد نتائج
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-[#2C2C2C] transition-colors">
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#9db9a6] noto-sans-arabic-regular">
                          {formatDate(item.date)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-sm text-[#9db9a6] font-mono">
                          {item.id}
                        </td>
                        {activeTab === "transactions" && (
                          <td className="px-6 py-5 text-sm text-white noto-sans-arabic-regular max-w-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{getTransactionTypeIcon(item.type)}</span>
                              <span>{item.description}</span>
                            </div>
                          </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-5 text-sm font-medium noto-sans-arabic-medium">
                          <span className={activeTab === "transactions" 
                            ? (item.points > 0 ? "text-green-400" : "text-[#FF4444]") 
                            : "text-white"
                          }>
                            {activeTab === "recharge" || activeTab === "withdraw"
                              ? `${item.points.toLocaleString("ar-EG")} نقطة`
                              : `${item.points > 0 ? '+' : ''}${item.points.toLocaleString("ar-EG")} نقطة`
                            }
                          </span>
                        </td>
                        {(activeTab === "recharge" || activeTab === "withdraw") && (
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-white noto-sans-arabic-medium">
                            ${item.amount.toFixed(2)}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-5 text-sm">
                          {getStatusBadge(item.status, item.rejectionReason)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <nav className="flex items-center justify-between border-t border-[#3A3A3A] px-4 sm:px-0 mt-8 pt-6">
          <div className="hidden sm:block">
            <p className="text-sm text-[#B8B8B8] noto-sans-arabic-regular">
              عرض <span className="font-medium text-white">1</span> إلى{" "}
              <span className="font-medium text-white">{filteredData.length}</span> من{" "}
              <span className="font-medium text-white">{currentData.length}</span> نتيجة
            </p>
          </div>
          <div className="flex flex-1 justify-between sm:justify-end gap-2">
            <button className="relative inline-flex items-center rounded-md border border-[#3A3A3A] bg-transparent px-4 py-2 text-sm font-medium text-[#B8B8B8] hover:bg-[#2C2C2C] transition-colors noto-sans-arabic-medium">
              السابق
            </button>
            <button className="relative inline-flex items-center rounded-md border border-[#3A3A3A] bg-transparent px-4 py-2 text-sm font-medium text-[#B8B8B8] hover:bg-[#2C2C2C] transition-colors noto-sans-arabic-medium">
              التالي
            </button>
          </div>
        </nav>

        {/* Recharge Modal */}
        <RechargePointsModal 
          isOpen={isRechargeModalOpen}
          onClose={() => setIsRechargeModalOpen(false)}
          onSuccess={() => {
            refetchRecharge();
            refetchBalance();
            setCurrentPage(1);
          }}
        />

        {/* Withdraw Modal */}
        <WithdrawPointsModal 
          isOpen={isWithdrawModalOpen}
          onClose={() => setIsWithdrawModalOpen(false)}
          currentBalance={currentBalance}
          onSuccess={() => {
            refetchWithdraw();
            refetchBalance();
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
};

export default PointsWallet;
