// What the earnings pages (/earnings, /authorsbenefits) tell authors about withdrawing: the API's rules since #22 and #27
// (Sareed-novels-backend), in the words of the terms of use (/terms, 5.5 «أرباح الكتّاب»), which leave the program's
// numbers to these pages. Change a sentence here when the rule behind it changes:
//   - only earnings (gifts and early-access subscriptions received) are paid out, never bought points (website top-ups,
//     Google Play packs); spending takes bought points first, then earnings on hold, then released ones:
//     Application/Wallet/WalletPools.cs
//   - each earning is held 30 days: Wallet:EarningsHoldDays (Infrastructure/Configuration/WalletSettings.cs, 30 by
//     default and never less in production)
//   - 10 points = 1 EGP, 10% deducted when withdrawing: Domain/Constants/PointsConstants.cs (the withdraw dialog uses
//     the same numbers)
//   - a refund of the purchase behind an earning still on hold can take it back: Application/Wallet/EarningsClawback.cs
// The minimum withdrawal (1000 points, PointsConstants.MinimumWithdrawal) is on each page's own card.
export const PAYOUT_RULES = [
  "تُسحب الأرباح وحدها: الهدايا واشتراكات الوصول المبكر التي تصلك من القرّاء.",
  "النقاط المشتراة، من الموقع أو من Google Play، تُستخدم داخل سرد ولا تُسحب أبدًا.",
  "تبقى الأرباح معلّقة 30 يومًا من تاريخ كسبها، ثم تصبح قابلة للسحب.",
  "تُحسب كل 10 نقاط بجنيه واحد، ويُقتطع 10% عند السحب، فتستلم 90 جنيهًا عن كل 1000 نقطة.",
  "عند إنفاق نقاطك تُخصم النقاط المشتراة أولًا، ثم الأرباح المعلّقة، ثم الأرباح القابلة للسحب.",
  "إذا استُرد مبلغ عملية شراء جاءت منها أرباح ما زالت معلّقة، قد تُسترجع تلك الأرباح.",
];

// The review time the terms (5.5) say the site publishes. An admin approves every request
// (PATCH /api/admin/withdraw/{id}/approve); 12 to 24 hours is the owner's commitment, which the withdraw dialog and the
// API's own message give too. /authorsbenefits shows it on its own card, /earnings at the end of the rules.
export const WITHDRAWAL_REVIEW = "تراجع إدارة سرد كل طلب سحب خلال 12 إلى 24 ساعة، وتحوّل المبلغ بعد الموافقة عليه.";
