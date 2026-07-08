import { useState } from "react";
import { Workflow, UserCog, Clock, MousePointerClick, ClipboardList, Layers3, Play } from "lucide-react";
import AssignmentRulesTab from "./rules/AssignmentRulesTab";
import SlaTypesTab from "./rules/config/SlaTypesTab";
import ActionFirstWorkflowTab from "./rules/ActionFirstWorkflowTab";
import { loadState, saveState } from "@/lib/store";
import { t, getCurrentLanguage, type Language } from "@/lib/i18n";

const workflowTabs = [
  { id: "actions", labelKey: "actionRegistry", icon: MousePointerClick },
  { id: "tasks", labelKey: "taskLibrary", icon: ClipboardList },
  { id: "milestones", labelKey: "milestoneLibrary", icon: Layers3 },
  { id: "templates", labelKey: "processTemplates", icon: Workflow },
  { id: "assignment", labelKey: "assignmentRules", icon: UserCog },
  { id: "slaTypes", labelKey: "slaTypes", icon: Clock },
  { id: "simulation", labelKey: "workflowSimulation", icon: Play },
];

export default function WorkflowConfigPage() {
  const [lang] = useState<Language>(getCurrentLanguage());
  const [activeTab, setActiveTab] = useState("actions");
  const [state, setState] = useState(loadState());

  const handleStateChange = (updater: any) => {
    setState((prev: any) => {
      const newState = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      saveState(newState);
      return newState;
    });
  };

  return (
    <div className="space-y-4">
      {/* Main tabs */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="flex gap-1 p-2 border-b border-border bg-muted overflow-x-auto">
          {workflowTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-soft text-brand-strong border border-brand-soft"
                  : "hover:bg-card"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {t(lang, tab.labelKey)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === "actions" || activeTab === "tasks" || activeTab === "milestones" || activeTab === "templates" || activeTab === "simulation" ? (
            <ActionFirstWorkflowTab mode={activeTab === "templates" ? "processes" : activeTab as any} state={state} setState={handleStateChange} saveState={saveState} />
          ) : activeTab === "assignment" ? (
            <AssignmentRulesTab state={state} setState={handleStateChange} saveState={saveState} />
          ) : activeTab === "slaTypes" ? (
            <SlaTypesTab state={state} setState={handleStateChange} saveState={saveState} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
