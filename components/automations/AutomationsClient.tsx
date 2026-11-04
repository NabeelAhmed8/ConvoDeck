"use client";

import React, { useState, useMemo } from "react";
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
  const [savedConfig, setSavedConfig] = useState<IAutomationConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"rules" | "simulator" | "logs">("rules");
  const [isSaving, setIsSaving] = useState(false);

  // Dynamic unsaved changes detection
  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== JSON.stringify(savedConfig);
  }, [config, savedConfig]);

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
      setSavedConfig(config);
      toast.success("Settings Saved", "Automation rules updated successfully");
    } else {
      toast.error("Save Failed", res.error || "Could not save settings");
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden overflow-y-auto">
      {/* Header */}
      <AutomationsHeader
        activeRulesCount={activeRulesCount}
        totalLogsCount={initialLogs.length}
      />

      {/* Tabs & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-2 sm:pb-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0 w-full sm:w-auto -mx-1 px-1">
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === "rules"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Rules</span>
            {isDirty && (
              <span className="w-2 h-2 rounded-full bg-[#ff6422] animate-pulse" title="Unsaved changes" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === "simulator"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Play className="w-4 h-4 fill-current shrink-0" />
            <span>Live Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap ${
              activeTab === "logs"
                ? "border-[#ff6422] text-[#ff6422]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-4 h-4 shrink-0" />
            <span>Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-600 font-bold">
              {initialLogs.length}
            </span>
          </button>
        </div>

        {activeTab === "rules" && (
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 w-full sm:w-auto">
            {isDirty && (
              <span className="text-[11px] text-amber-600 font-medium hidden xs:inline-block">
                Unsaved changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                isDirty
                  ? "bg-[#ff6422] text-white hover:bg-[#e0551a] cursor-pointer"
                  : "bg-slate-200 text-slate-500 cursor-default opacity-80"
              }`}
            >
              {isSaving ? <Check className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Saving..." : isDirty ? "Save Rules" : "Saved"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
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
