import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { useState } from "react";
import { Check, ArrowRight, Zap, Building2, Star, Receipt } from "lucide-react";

export const Route = createFileRoute("/_protected/billing")({
  head: () => ({ meta: [{ title: `Billing & Top-Up | ${siteConfig.name}` }] }),
  component: BillingPage,
});

type PackageId = "starter" | "pro" | "business";

const packages: Record<PackageId, {
  name: string;
  icon: React.ReactNode;
  credits: number;
  price: string;
  pricePerCredit: string;
  popular?: boolean;
  features: string[];
}> = {
  starter: {
    name: "Starter",
    icon: <Zap className="size-5" />,
    credits: 50,
    price: "Rp 75.000",
    pricePerCredit: "Rp 1.500 / credit",
    features: [
      "5 Full Reports",
      "25 Micro-Reports",
      "Email support",
    ],
  },
  pro: {
    name: "Pro",
    icon: <Star className="size-5" />,
    credits: 200,
    price: "Rp 275.000",
    pricePerCredit: "Rp 1.375 / credit",
    popular: true,
    features: [
      "20 Full Reports",
      "100 Micro-Reports",
      "API Access",
      "Priority support",
    ],
  },
  business: {
    name: "Business",
    icon: <Building2 className="size-5" />,
    credits: 500,
    price: "Rp 625.000",
    pricePerCredit: "Rp 1.250 / credit",
    features: [
      "50 Full Reports",
      "250 Micro-Reports",
      "API Access",
      "Dedicated account manager",
    ],
  },
};

const purchaseHistory = [
  { date: "Oct 20, 2026", package: "Pro", credits: 200, amount: "Rp 275.000", paymentMethod: "Midtrans" },
  { date: "Sep 15, 2026", package: "Starter", credits: 50, amount: "Rp 75.000", paymentMethod: "Midtrans" },
  { date: "Aug 2, 2026", package: "Pro", credits: 200, amount: "Rp 275.000", paymentMethod: "Midtrans" },
];

function BillingPage() {
  const [selected, setSelected] = useState<PackageId>("pro");

  return (
    <div className="view-section animate-fade-in max-w-5xl mx-auto space-y-10 py-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold text-white">Upgrade your plan</h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Choose a credit package that fits your research needs. All plans include full access to Nexus Score features.
        </p>
      </div>

      {/* Balance badge */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-2 bg-dark-900 border border-dark-800 rounded-full px-5 py-2">
          <span className="text-gray-400 text-sm">Current balance:</span>
          <span className="text-white font-bold">1,240</span>
          <span className="text-brand-500 text-sm">Credits</span>
        </div>
      </div>

      {/* Package cards — ChatGPT-style side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {(Object.keys(packages) as PackageId[]).map((id) => {
          const pkg = packages[id];
          const isSelected = selected === id;
          return (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className={`
                relative flex flex-col text-left rounded-2xl p-6 transition-all duration-200
                ${isSelected
                  ? "border-2 border-brand-500 bg-dark-900 shadow-[0_0_30px_rgba(255,122,0,0.08)]"
                  : "border border-dark-700 bg-dark-900/60 hover:border-dark-600"
                }
              `}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-dark-950 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Best value
                </span>
              )}

              <div className="flex items-center gap-2 mb-3">
                <span className={isSelected ? "text-brand-500" : "text-gray-500"}>{pkg.icon}</span>
                <span className="text-white font-semibold">{pkg.name}</span>
              </div>

              <div className="mb-4">
                <span className="text-3xl font-extrabold text-white">{pkg.credits}</span>
                <span className="text-sm text-gray-400 ml-1">credits</span>
              </div>

              <p className="text-brand-500 font-bold text-lg mb-1">{pkg.price}</p>
              <p className="text-xs text-gray-500 mb-5">{pkg.pricePerCredit}</p>

              <ul className="space-y-2.5 mb-6 flex-1">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <Check className="size-4 text-emerald-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <span
                className={`
                  w-full inline-flex items-center justify-center gap-2 font-semibold text-sm py-2.5 rounded-xl transition-colors
                  ${isSelected
                    ? "bg-brand-500 hover:bg-brand-400 text-dark-950"
                    : "bg-dark-800 hover:bg-dark-700 text-white"
                  }
                `}
              >
                Get {pkg.name}
                <ArrowRight className="size-4" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Purchase History */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <Receipt className="size-4 text-brand-500" /> Purchase History
        </h3>
        <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Package</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Credits</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Amount</th>
                <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-6 py-3">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800">
              {purchaseHistory.map((tx, i) => (
                <tr key={i} className="hover:bg-dark-800/30 transition-colors">
                  <td className="px-6 py-3.5 text-sm text-gray-400 whitespace-nowrap">{tx.date}</td>
                  <td className="px-6 py-3.5 text-sm text-white font-medium">{tx.package}</td>
                  <td className="px-6 py-3.5 text-sm text-emerald-400 font-mono text-right">+{tx.credits.toLocaleString()}</td>
                  <td className="px-6 py-3.5 text-sm text-white font-mono text-right">{tx.amount}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="text-[10px] text-gray-500 border border-dark-700 bg-dark-950 px-2 py-0.5 rounded-md">{tx.paymentMethod}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
