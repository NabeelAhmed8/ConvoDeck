"use server";

import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/dbConnect";
import { AutomationConfig } from "@/models/AutomationConfig";
import { AutomationLog } from "@/models/AutomationLog";
import { getSession } from "@/lib/auth";
import { IAutomationConfig, IAutomationLogItem, AutomationExecutionResult } from "@/types/automation";
import { evaluateMessageRules } from "@/lib/automation/ruleEvaluator";
import { computePipelineMutation } from "@/lib/automation/pipelineService";
import { DEFAULT_WORKSPACE_ID } from "@/constants/config";

async function getActiveWorkspaceId(): Promise<string> {
  const session = await getSession();
  return session?.workspaceId || DEFAULT_WORKSPACE_ID;
}

export async function getAutomationSettings(): Promise<IAutomationConfig> {
  try {
    await dbConnect();
    const workspaceId = await getActiveWorkspaceId();

    let config = await AutomationConfig.findOne({ workspaceId }).lean();
    if (!config) {
      await AutomationConfig.create({ workspaceId });
      config = await AutomationConfig.findOne({ workspaceId }).lean();
    }

    if (!config) {
      throw new Error("Unable to create default automation config");
    }

    return JSON.parse(JSON.stringify(config));
  } catch (error) {
    console.error("Error fetching automation settings:", error);
    throw new Error("Failed to load automation configuration");
  }
}

export async function saveAutomationSettings(
  updates: Partial<IAutomationConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const workspaceId = await getActiveWorkspaceId();

    await AutomationConfig.findOneAndUpdate(
      { workspaceId },
      { $set: updates },
      { upsert: true, new: true }
    );

    revalidatePath("/automations");
    return { success: true };
  } catch (error) {
    console.error("Error saving automation settings:", error);
    return { success: false, error: "Failed to update automation settings" };
  }
}

export async function getAutomationLogs(limit: number = 30): Promise<IAutomationLogItem[]> {
  try {
    await dbConnect();
    const workspaceId = await getActiveWorkspaceId();

    const logs = await AutomationLog.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(logs));
  } catch (error) {
    console.error("Error fetching automation logs:", error);
    return [];
  }
}

export async function testAutomationSimulator(
  sampleMessage: string,
  sampleLeadName: string = "Preview Lead"
): Promise<{ success: boolean; result?: AutomationExecutionResult; error?: string }> {
  try {
    await dbConnect();
    const workspaceId = await getActiveWorkspaceId();
    const config = await AutomationConfig.findOne({ workspaceId }).lean();

    const activeConfig = config || {
      demoKeywords: ["demo", "schedule", "meeting", "presentation", "call"],
      pricingKeywords: ["price", "pricing", "cost", "quote", "rate"],
      urgentKeywords: ["urgent", "asap", "emergency", "complaint", "refund"],
      autoHandoffKeywords: ["human", "agent", "person", "representative"],
      autoReplyEnabled: true,
      greetingMessage: "Hello! Thank you for reaching out to us on WhatsApp.",
      pipelineAutomationEnabled: true,
      roundRobinEnabled: true,
    };

    const matches = evaluateMessageRules(sampleMessage, activeConfig);
    const mutation = computePipelineMutation("NEW", [], matches);

    const triggeredRules: AutomationExecutionResult["triggeredRules"] = [];
    if (activeConfig.roundRobinEnabled) triggeredRules.push("ROUND_ROBIN");
    if (mutation.newStage) triggeredRules.push("PIPELINE_MOVE");
    if (mutation.tagsToAdd.length > 0) triggeredRules.push("URGENT_TAG");
    if (matches.hasHandoffRequest) triggeredRules.push("HANDOFF");
    else if (activeConfig.autoReplyEnabled) triggeredRules.push("AUTO_REPLY");

    const simResult: AutomationExecutionResult = {
      triggeredRules,
      autoReplied: activeConfig.autoReplyEnabled,
      autoReplyText: matches.hasHandoffRequest
        ? "We have notified a human agent to join this conversation right away."
        : activeConfig.greetingMessage,
      stageUpdated: mutation.newStage,
      tagsAdded: mutation.tagsToAdd,
      assignedAgentName: activeConfig.roundRobinEnabled ? "Next Available Team Agent (Round-Robin)" : undefined,
    };

    return { success: true, result: simResult };
  } catch (error) {
    console.error("Error in automation simulator:", error);
    return { success: false, error: "Simulation failed" };
  }
}
