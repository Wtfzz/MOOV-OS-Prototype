import { useState } from "react";
import ConfigurationCenterPage from "./ConfigurationCenterPage";
import { loadState, saveState } from "@/lib/store";

export default function SystemConfigPage() {
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
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <div className="p-4">
          <ConfigurationCenterPage state={state} setState={handleStateChange} saveState={saveState} />
        </div>
      </div>
    </div>
  );
}
