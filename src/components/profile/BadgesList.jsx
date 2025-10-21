import { useState } from "react";
import { X } from "lucide-react";

const BadgesList = () => {
  const badges = [
    {
      title: "سليل الكلمة",
      description:
        "كاتب تفيض كلماته من عمق الإلهام، يحمل سلالة الحروف في قلبه.",
      levels: [
        {
          level: 1,
          achievedDate: "2023-01-15",
          achievedNumber: 42,
          goal: "نشر أول رواية",
          achieved: true,
        },
        {
          level: 2,
          achievedDate: "2023-06-20",
          achievedNumber: 18,
          goal: "نشر 5 روايات",
          achieved: true,
        },
        {
          level: 3,
          achievedDate: "2024-03-10",
          achievedNumber: 5,
          goal: "نشر 10 روايات",
          achieved: true,
        },
        {
          level: 4,
          achievedDate: null,
          achievedNumber: null,
          goal: "نشر 25 رواية",
          achieved: false,
        },
      ],
    },
    {
      title: "نعم أنا هنا",
      description: "إشارة إلى الحضور الدائم والمشاركة المستمرة في عالم السرد.",
      levels: [
        {
          level: 1,
          achievedDate: "2022-09-08",
          achievedNumber: 120,
          goal: "مسجل منذ أكثر من سنة",
          achieved: true,
        },
        {
          level: 2,
          achievedDate: "2023-12-11",
          achievedNumber: 65,
          goal: "مسجل منذ أكثر من 3 سنوات",
          achieved: true,
        },
        {
          level: 3,
          achievedDate: null,
          achievedNumber: null,
          goal: "مسجل منذ أكثر من 5 سنوات",
          achieved: false,
        },
        {
          level: 4,
          achievedDate: null,
          achievedNumber: null,
          goal: "مسجل منذ أكثر من 10 سنوات",
          achieved: false,
        },
      ],
    },
    {
      title: "سيد السرد",
      description: "يمتلك مهارة حبك الأحداث وصياغة القصص بطريقة تأسر القارئ.",
      levels: [
        {
          level: 1,
          achievedDate: "2023-02-14",
          achievedNumber: 88,
          goal: "الحصول على 100 إعجاب",
          achieved: true,
        },
        {
          level: 2,
          achievedDate: "2023-08-22",
          achievedNumber: 34,
          goal: "الحصول على 500 إعجاب",
          achieved: true,
        },
        {
          level: 3,
          achievedDate: null,
          achievedNumber: null,
          goal: "الحصول على 1000 إعجاب",
          achieved: false,
        },
        {
          level: 4,
          achievedDate: null,
          achievedNumber: null,
          goal: "الحصول على 5000 إعجاب",
          achieved: false,
        },
      ],
    },
    {
      title: "أسطورة السرد",
      description:
        "وصل إلى مرحلة يتحدث عنه فيها الجميع، قصصه تُروى كما تُروى الأساطير.",
      levels: [
        {
          level: 1,
          achievedDate: "2023-04-05",
          achievedNumber: 56,
          goal: "الحصول على 1000 متابع",
          achieved: true,
        },
        {
          level: 2,
          achievedDate: null,
          achievedNumber: null,
          goal: "الحصول على 5000 متابع",
          achieved: false,
        },
        {
          level: 3,
          achievedDate: null,
          achievedNumber: null,
          goal: "الحصول على 10000 متابع",
          achieved: false,
        },
        {
          level: 4,
          achievedDate: null,
          achievedNumber: null,
          goal: "الحصول على 50000 متابع",
          achieved: false,
        },
      ],
    },
    {
      title: "نصل الكلمة",
      description:
        "مزيج من القوة والإبداع؛ فارس يكتب كما يقاتل، بالكلمة كسلاح.",
      levels: [
        {
          level: 1,
          achievedDate: "2023-07-18",
          achievedNumber: 92,
          goal: "كتابة 50 فصل",
          achieved: true,
        },
        {
          level: 2,
          achievedDate: null,
          achievedNumber: null,
          goal: "كتابة 200 فصل",
          achieved: false,
        },
        {
          level: 3,
          achievedDate: null,
          achievedNumber: null,
          goal: "كتابة 500 فصل",
          achieved: false,
        },
        {
          level: 4,
          achievedDate: null,
          achievedNumber: null,
          goal: "كتابة 1000 فصل",
          achieved: false,
        },
      ],
    },
  ];

  const [selectedBadge, setSelectedBadge] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Convert number to Roman numerals
  const toRoman = (num) => {
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    return romanNumerals[num - 1] || num;
  };

  const handleSelectBadge = (badge, idx) => {
    const selected = { ...badge, image: `/badge-${idx + 1}.png` };
    setSelectedBadge(selected);
    setSelectedLevel(0);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-zinc-800 flex items-center justify-between flex-wrap p-3">
      {badges.map((badge, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-3 items-center text-zinc-100 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleSelectBadge(badge, idx)}
        >
          <img src={`/badge-${idx + 1}.png`} className="w-36" alt={badge.title} />
          <p className="noto-sans-arabic-medium">{badge.title}</p>
        </div>
      ))}

      {/* Badge Details Modal */}
      {isModalOpen && selectedBadge && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setIsModalOpen(false);
            setSelectedBadge(null);
          }}
        >
          <div
            className="relative bg-[#3A3A3A] rounded-lg max-w-xl w-full max-h-[90vh] overflow-hidden"
            style={{ boxShadow: "0 4px 4px 0 rgba(0, 0, 0, 0.25)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedBadge(null);
              }}
              className="absolute top-4 left-4 z-10 text-white hover:text-[#4A9EFF] transition-colors"
              aria-label="إغلاق"
            >
              <X size={24} />
            </button>

            {/* Modal Header */}
            <div className="bg-[#2C2C2C] px-8 py-6 text-center border-b border-[#5A5A5A]">
              <h2 className="text-white text-2xl noto-sans-arabic-bold">
                تفاصيل الشارة
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: "calc(90vh - 120px)" }}>
              {/* Badge Level Navigation */}
              <div className="flex justify-center items-center gap-4 mb-8">
                {selectedBadge.levels.map((levelData, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedLevel(idx)}
                    className={`relative transition-all inline-block cursor-pointer ${
                      selectedLevel === idx
                        ? "scale-110"
                        : levelData.achieved
                        ? "opacity-70 hover:opacity-100"
                        : "opacity-40 hover:opacity-60"
                    }`}
                    style={{
                      filter: !levelData.achieved ? "grayscale(100%)" : "none",
                      width: "36px",
                      height: "55px",
                      color: selectedLevel === idx ? "rgb(59, 102, 245)" : "inherit",
                    }}
                  >
                    <img
                      src={selectedBadge.image}
                      alt={`${selectedBadge.title} المستوى ${levelData.level}`}
                      className="w-full h-full object-contain"
                      style={{ background: "none" }}
                    />
                  </button>
                ))}
              </div>

              {/* Badge Details Card */}
              <div className="text-center">
                {/* Badge Image with Decorative Element */}
                <div className="relative inline-block mb-6">
                  <img
                    src={selectedBadge.image}
                    alt={selectedBadge.title}
                    className="w-36 h-auto mx-auto"
                    style={{
                      filter: !selectedBadge.levels[selectedLevel].achieved
                        ? "grayscale(100%)"
                        : "none",
                    }}
                  />
                  {/* Decorative leaf/ribbon (optional - you can add your own SVG) */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-r from-[#4A9EFF]/20 to-[#4A9EFF]/40 rounded-full blur-sm"></div>
                </div>

                {/* Badge Title with Level */}
                <h3 className="text-white text-2xl noto-sans-arabic-bold mb-2 flex items-center justify-center gap-3">
                  <span>{selectedBadge.title}</span>
                  <i
                    className="inline-block w-4 h-4 rounded-sm text-center align-middle italic uppercase"
                    style={{
                      backgroundColor: "rgb(255, 213, 214)",
                      color: "rgb(162, 32, 35)",
                      fontSize: "12px",
                      lineHeight: "16px",
                      textIndent: "-2px",
                      fontFamily: "serif",
                    }}
                  >
                    {toRoman(selectedBadge.levels[selectedLevel].level)}
                  </i>
                </h3>

                {/* Achievement Date or Status */}
                <p className="text-[#686868] text-sm noto-sans-arabic-medium mb-6">
                  {selectedBadge.levels[selectedLevel].achieved ? (
                    <>
                      {selectedBadge.levels[selectedLevel].achievedDate} تم
                      الإنجاز | رقم {selectedBadge.levels[selectedLevel].achievedNumber}
                    </>
                  ) : (
                    "لم يتم الإنجاز"
                  )}
                </p>

                {/* Goal Description */}
                <div className="mb-4">
                  <p className="text-[#686868] text-sm noto-sans-arabic-medium mb-2">
                    الهدف:
                  </p>
                  <p className="text-white text-base noto-sans-arabic-medium leading-relaxed">
                    {selectedBadge.levels[selectedLevel].goal}
                  </p>
                </div>

                {/* Badge Description (shown only on first level or all levels - your choice) */}
                {selectedLevel === 0 && (
                  <div className="mt-2">
                    <p className="text-[#686868] text-sm noto-sans-arabic-medium mb-2">
                      عن هذه الشارة:
                    </p>
                    <p className="text-white text-base noto-sans-arabic-medium leading-relaxed">
                      {selectedBadge.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgesList;
