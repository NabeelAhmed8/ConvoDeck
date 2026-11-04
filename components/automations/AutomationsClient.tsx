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
    <div className="space-y-6 max-w-5xl mx-auto w-full text-slate-800">
      {/* 1. Header & 4 KPI Metric Cards */}
      <AutomationsHeader
        activeRulesCount={activeRulesCount}
        totalLogsCount={initialLogs.length}
        autoReplyEnabled={config.autoReplyEnabled}
        roundRobinEnabled={config.roundRobinEnabled}
      />

      {/* 2. Neumorphic Segmented Tab Navigation & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="neu-tab-container p-1 rounded-2xl sm:rounded-full w-full sm:w-auto grid grid-cols-3 sm:flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("rules")}
            className={`px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
              activeTab === "rules" ? "neu-tab-active" : "neu-tab"
            }`}
          >
            Rules &amp; Triggers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("simulator")}
            className={`px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
              activeTab === "simulator" ? "neu-tab-active" : "neu-tab"
            }`}
          >
            Live Simulator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`px-3 sm:px-5 py-2 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer text-center truncate ${
              activeTab === "logs" ? "neu-tab-active" : "neu-tab"
            }`}
          >
            Audit Trail ({initialLogs.length})
          </button>
        </div>

        {activeTab === "rules" && (
          <div className="flex items-center gap-2.5 self-end sm:self-auto shrink-0 w-full sm:w-auto justify-end">
            {isDirty && (
              <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Unsaved Changes
              </span>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="neu-btn-primary px-5 py-2.5 rounded-full text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              {isSaving ? <Check className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>{isSaving ? "Saving..." : isDirty ? "Save Rules" : "Saved"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Tab Content Panels */}
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
