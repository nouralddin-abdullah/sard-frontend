import React, { useState } from "react";
import { Loader2, Search, CreditCard } from "lucide-react";
import RechargePointsModal from "./RechargePointsModal";

const PointsWallet = ({ userId }) => {
  // TODO: Add hook to fetch user points balance and transactions
  // const { data: pointsData, isLoading } = useGetUserPoints(userId);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("recharge"); // "recharge" or "transactions"
  const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
  
  // Dummy data for now
  const balance = 1250;
  
  // Recharge History Data
  const rechargeHistory = [
    {
      id: "#A1B2C3D4",
      date: "2023-10-26T10:30:00Z",
      points: 1000,
      amount: 10.00,
      status: "approved"
    },
    {
      id: "#E5F6G7H8",
      date: "2023-10-24T20:15:00Z",
      points: 500,
      amount: 5.00,
      status: "approved"
    },
    {
      id: "#I9J0K1L2",
      date: "2023-10-22T11:00:00Z",
      points: 2000,
      amount: 20.00,
      status: "rejected"
    },
    {
      id: "#M3N4O5P6",
      date: "2023-10-21T15:45:00Z",
      points: 1500,
      amount: 15.00,
      status: "pending"
    },
  ];

  // Transaction History Data (Spending)
  const transactionHistory = [
    {
      id: "#TX001",
      date: "2023-10-28T14:20:00Z",
      type: "premium_pass",
      description: "شراء باقة مميزة للرواية 'قصة البطل'",
      points: -200,
      status: "completed"
    },
    {
      id: "#TX002",
      date: "2023-10-27T09:15:00Z",
      type: "unlock_chapter",
      description: "فتح الفصل المميز 'الفصل 42'",
      points: -50,
      status: "completed"
    },
    {
      id: "#TX003",
      date: "2023-10-26T16:30:00Z",
      type: "gift",
      description: "إهداء نقاط لـ @أحمد123",
      points: -100,
      status: "completed"
    },
    {
      id: "#TX004",
      date: "2023-10-25T11:45:00Z",
      type: "withdraw",
      description: "سحب نقاط إلى حساب بنكي",
      points: -500,
      status: "pending"
    },
    {
      id: "#TX005",
      date: "2023-10-24T08:00:00Z",
      type: "premium_pass",
      description: "شراء باقة مميزة للرواية 'عالم الخيال'",
      points: -200,
      status: "completed"
    },
  ];

  const isLoading = false;

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

  const getStatusBadge = (status) => {
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
      </span>
    );
  };

  const getTransactionTypeIcon = (type) => {
    switch (type) {
      case "premium_pass":
        return "👑";
      case "unlock_chapter":
        return "🔓";
      case "gift":
        return "🎁";
      case "withdraw":
        return "💰";
      default:
        return "📝";
    }
  };

  const currentData = activeTab === "recharge" ? rechargeHistory : transactionHistory;
  
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
                : "عرض جميع المعاملات والنفقات الخاصة بالنقاط"
              }
            </p>
          </div>
          <button 
            className="flex items-center justify-center gap-2 h-10 px-5 bg-[#4A9EFF] text-white font-medium rounded-lg whitespace-nowrap hover:bg-[#3A8EEF] transition-colors noto-sans-arabic-bold"
            onClick={() => setIsRechargeModalOpen(true)}
          >
            <CreditCard size={20} />
            <span>شحن النقاط</span>
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#3A3A3A]">
          <button
            className={`px-6 py-3 text-base font-medium transition-colors noto-sans-arabic-medium relative ${
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
            className={`px-6 py-3 text-base font-medium transition-colors noto-sans-arabic-medium relative ${
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
                filterStatus === (activeTab === "recharge" ? "approved" : "completed")
                  ? "bg-[#4A9EFF]/20 text-[#4A9EFF]"
                  : "text-[#B8B8B8] hover:bg-[#3A3A3A]"
              }`}
              onClick={() => setFilterStatus(activeTab === "recharge" ? "approved" : "completed")}
            >
              <p className="text-sm font-medium leading-normal">
                {activeTab === "recharge" ? "مقبول" : "مكتمل"}
              </p>
            </button>
            {activeTab === "recharge" && (
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
                    {activeTab === "recharge" && (
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
                          <span className={activeTab === "transactions" ? "text-[#FF4444]" : "text-white"}>
                            {activeTab === "recharge" 
                              ? `${item.points.toLocaleString("ar-EG")} نقطة`
                              : `${item.points.toLocaleString("ar-EG")} نقطة`
                            }
                          </span>
                        </td>
                        {activeTab === "recharge" && (
                          <td className="whitespace-nowrap px-6 py-5 text-sm font-medium text-white noto-sans-arabic-medium">
                            ${item.amount.toFixed(2)}
                          </td>
                        )}
                        <td className="whitespace-nowrap px-6 py-5 text-sm">
                          {getStatusBadge(item.status)}
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
        />
      </div>
    </div>
  );
};

export default PointsWallet;
