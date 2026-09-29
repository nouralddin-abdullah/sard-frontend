// What the earnings pages (/earnings, /authorsbenefits) tell authors about withdrawing, as the API enforces it since
// #22 and #27 (Sareed-novels-backend). Change a sentence here when the API changes the rule behind it:
//   - only earnings (gifts and early-access subscriptions received) are paid out, never bought points (website top-ups,
//     Google Play packs); spending takes bought points first, then earnings on hold, then released ones:
//     Application/Wallet/WalletPools.cs
//   - each earning is held 30 days: Wallet:EarningsHoldDays (Infrastructure/Configuration/WalletSettings.cs, 30 by
//     default and never less in production)
//   - 10 points = 1 EGP, 10% deducted when withdrawing: Domain/Constants/PointsConstants.cs (the withdraw dialog uses
//     the same numbers)
//   - a refund of the purchase behind an earning still on hold can take it back: Application/Wallet/EarningsClawback.cs
//   - an admin approves every withdrawal request: PATCH /api/admin/withdraw/{id}/approve
// The minimum withdrawal (1000 points, PointsConstants.MinimumWithdrawal) is on each page's own card.
export const PAYOUT_RULES = [
  "تُسحب الأرباح وحدها: الهدايا واشتراكات الوصول المبكر التي تصلك من القرّاء.",
  "النقاط المشتراة، من الموقع أو من Google Play، تُستخدم داخل سرد ولا تُسحب أبدًا.",
  "تبقى الأرباح معلّقة 30 يومًا من تاريخ كسبها، ثم تصبح قابلة للسحب.",
  "تُحسب كل 10 نقاط بجنيه واحد، ويُقتطع 10% عند السحب، فتستلم 90 جنيهًا عن كل 1000 نقطة.",
  "عند إنفاق نقاطك تُخصم النقاط المشتراة أولًا، ثم الأرباح المعلّقة، ثم الأرباح القابلة للسحب.",
  "إذا استُرد مبلغ عملية شراء جاءت منها أرباح ما زالت معلّقة، قد تُسترجع تلك الأرباح.",
  "تراجع إدارة سرد كل طلب سحب قبل تحويل المبلغ.",
];
