import { useState } from "react";
import { Anchor, Ship } from "lucide-react";
import { masterDataSchemas } from "@/lib/masterDataSchemas";
import MasterDataEntityPage from "./MasterDataEntityPage";

export default function VesselsPage() {
  const [activeTab, setActiveTab] = useState<"vessel" | "voyage">("vessel");

  const tabs = [
    { id: "vessel" as const, label: "Vessel", icon: Ship },
    { id: "voyage" as const, label: "Voyage", icon: Anchor },
  ];

  const tabList = (
    <div className="flex gap-1 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? "bg-brand-soft text-brand-strong border border-brand-soft"
              : "hover:bg-card"
          }`}
        >
          <tab.icon size={16} />
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-w-0">
      {activeTab === "vessel" ? (
        <MasterDataEntityPage key="vessel" schema={masterDataSchemas.vessel} tableHeaderStart={tabList} />
      ) : (
        <MasterDataEntityPage key="voyage" schema={masterDataSchemas.voyage} tableHeaderStart={tabList} />
      )}
    </div>
  );
}
