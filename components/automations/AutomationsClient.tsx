"use client";

import React, { useState } from "react";
import { Save, Sparkles, Play, History, Check } from "lucide-react";
import { toast } from "@/store/useToastStore";
import { saveAutomationSettings } from "@/actions/automationActions";
import { IAutomationConfig, IAutomationLogItem } from "@/types/automation";
import { AutomationsHeader } from "./AutomationsHeader";
import { GreetingBotCard } from "./GreetingBotCard";
import { PipelineProgressionCard } from "./PipelineProgressionCard";
import { RoundRobinCard } from "./RoundRobinCard";
import { UrgentAlertCard } from "./UrgentAlertCard";
import { AutomationSimulator } from "./AutomationSimulator";
import { AutomationLogsList } from "./AutomationLogsList";

interface AutomationsClientProps {
  initialConfig: IAutomationConfig;
  initialLogs: IAutomationLogItem[];
}

export function AutomationsClient({
  initialConfig,
  initialLogs,
}: AutomationsClientProps) {
  const [config, setConfig] = useState<IAutomationConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"rules" | "simulator" | "logs">("rules");
  const [isSaving, setIsSaving] = useState(false);

  const activeRulesCount = [
    config.autoReplyEnabled,
    config.pipelineAutomationEnabled,
    config.roundRobinEnabled,
    config.urgentDetectionEnabled,
  ].filter(Boolean).length;

  const handleSave = async () => {
    setIsSaving(true);
    const res = await saveAutomationSettings(config);
    setIsSaving(false);

    if (res.success) {
      toast.success("Settings Saved", "Automation rules updated successfully");
    } else {
      toast.error("Save Failed", res.error || "Could not save settings");
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
      {/* Header */}
      <AutomationsHeader
        activeRulesCount={activeRulesCount}
        totalLogsCount={initialLogs.length}
      />

      {/* Tabs Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "rules"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Automation Rules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "simulator"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            Live Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "logs"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4" />
            Activity Logs ({initialLogs.length})
          </button>
        </div>

        {activeTab === "rules" && (
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl bg-[#ff6422] text-white text-xs font-bold hover:bg-[#e0551a] disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isSaving ? <Check className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Rules"}
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <GreetingBotCard
            enabled={config.autoReplyEnabled}
            message={config.greetingMessage}
            onToggle={(enabled) => setConfig({ ...config, autoReplyEnabled: enabled })}
            onChangeMessage={(greetingMessage) => setConfig({ ...config, greetingMessage })}
          />

          <PipelineProgressionCard
            enabled={config.pipelineAutomationEnabled}
            demoKeywords={config.demoKeywords}
            pricingKeywords={config.pricingKeywords}
            onToggle={(enabled) => setConfig({ ...config, pipelineAutomationEnabled: enabled })}
            onUpdateDemoKeywords={(demoKeywords) => setConfig({ ...config, demoKeywords })}
            onUpdatePricingKeywords={(pricingKeywords) => setConfig({ ...config, pricingKeywords })}
          />

          <RoundRobinCard
            enabled={config.roundRobinEnabled}
            onToggle={(enabled) => setConfig({ ...config, roundRobinEnabled: enabled })}
          />

          <UrgentAlertCard
            enabled={config.urgentDetectionEnabled}
            urgentKeywords={config.urgentKeywords}
            onToggle={(enabled) => setConfig({ ...config, urgentDetectionEnabled: enabled })}
            onUpdateUrgentKeywords={(urgentKeywords) => setConfig({ ...config, urgentKeywords })}
          />
        </div>
      )}

      {activeTab === "simulator" && <AutomationSimulator />}

      {activeTab === "logs" && <AutomationLogsList logs={initialLogs} />}
    </div>
  );
}
