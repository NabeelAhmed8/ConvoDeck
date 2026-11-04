/**
 * automationEngine.ts
 * Single Responsibility: Orchestrator for smart CRM automations & rule executions.
 */

import { AutomationConfig } from "@/models/AutomationConfig";
import { AutomationLog } from "@/models/AutomationLog";
import { Lead } from "@/models/Lead";
import { ILead } from "@/types";
import { AutomationExecutionResult, AutomationRuleType } from "@/types/automation";
import { evaluateMessageRules } from "./ruleEvaluator";
import { routeLeadRoundRobin } from "./routingService";
import { computePipelineMutation } from "./pipelineService";
import { dispatchAutoReply } from "./autoReplyService";

export interface ProcessAutomationParams {
  lead: any;
  messageText: string;
  workspaceId: string;
}

export async function processSmartAutomation({
  lead,
  messageText,
  workspaceId,
}: ProcessAutomationParams): Promise<AutomationExecutionResult> {
  const result: AutomationExecutionResult = {
    triggeredRules: [],
    autoReplied: false,
    tagsAdded: [],
  };

  try {
    // 1. Fetch or initialize workspace automation settings
    let config = await AutomationConfig.findOne({ workspaceId });
    if (!config) {
      config = await AutomationConfig.create({ workspaceId });
    }

    // 2. Evaluate keyword & intent rules
    const matches = evaluateMessageRules(messageText, config);

    // 3. Smart Round-Robin Agent Routing (if lead unassigned & enabled)
    if (config.roundRobinEnabled && !lead.assignedTo) {
      const routing = await routeLeadRoundRobin(workspaceId);
      if (routing.assignedAgentId) {
        lead.assignedTo = routing.assignedAgentId;
        result.assignedAgentId = routing.assignedAgentId;
        result.assignedAgentName = routing.assignedAgentName;
        result.triggeredRules.push("ROUND_ROBIN");

        await AutomationLog.create({
          workspaceId,
          ruleType: "ROUND_ROBIN",
          leadName: lead.name,
          leadPhone: lead.phone,
          triggerText: messageText.slice(0, 80),
          actionTaken: `Assigned lead to agent ${routing.assignedAgentName}`,
        });
      }
    }

    // 4. Pipeline & Tagging Automations
    if (config.pipelineAutomationEnabled) {
      const currentTags = Array.isArray(lead.tags) ? lead.tags : [];
      const mutation = computePipelineMutation(lead.stage, currentTags, matches);

      if (mutation.newStage && mutation.newStage !== lead.stage) {
        const oldStage = lead.stage;
        lead.stage = mutation.newStage;
        result.stageUpdated = mutation.newStage;
        result.triggeredRules.push("PIPELINE_MOVE");

        await AutomationLog.create({
          workspaceId,
          ruleType: "PIPELINE_MOVE",
          leadName: lead.name,
          leadPhone: lead.phone,
          triggerText: messageText.slice(0, 80),
          actionTaken: `Moved lead stage from ${oldStage} to ${mutation.newStage}`,
        });
      }

      if (mutation.tagsToAdd.length > 0) {
        const updatedTags = Array.from(new Set([...currentTags, ...mutation.tagsToAdd]));
        lead.tags = updatedTags;
        result.tagsAdded = mutation.tagsToAdd;
        result.triggeredRules.push("URGENT_TAG");

        await AutomationLog.create({
          workspaceId,
          ruleType: "URGENT_TAG",
          leadName: lead.name,
          leadPhone: lead.phone,
          triggerText: messageText.slice(0, 80),
          actionTaken: `Added tags: ${mutation.tagsToAdd.join(", ")}`,
        });
      }
    }

    // 5. Update Lead in Database if mutated
    if (result.triggeredRules.length > 0 && lead._id) {
      await Lead.findByIdAndUpdate(lead._id, {
        $set: {
          stage: lead.stage,
          tags: lead.tags,
          assignedTo: lead.assignedTo,
        },
      });
    }

    // 6. Automated WhatsApp Response
    if (config.autoReplyEnabled && lead._id) {
      let replyText = "";

      if (matches.hasHandoffRequest) {
        replyText = "We have notified a human agent to join this conversation right away.";
        result.triggeredRules.push("HANDOFF");
      } else if (lead.unreadCount === 1 || !lead.lastMessageAt) {
        // First message greeting
        replyText = config.greetingMessage;
        result.triggeredRules.push("AUTO_REPLY");
      }

      if (replyText) {
        const sent = await dispatchAutoReply({
          leadId: lead._id.toString(),
          leadPhone: lead.phone,
          workspaceId,
          replyText,
        });

        if (sent) {
          result.autoReplied = true;
          result.autoReplyText = replyText;

          await AutomationLog.create({
            workspaceId,
            ruleType: matches.hasHandoffRequest ? "HANDOFF" : "AUTO_REPLY",
            leadName: lead.name,
            leadPhone: lead.phone,
            triggerText: messageText.slice(0, 80),
            actionTaken: `Dispatched auto-reply: "${replyText.slice(0, 60)}..."`,
          });
        }
      }
    }

    return result;
  } catch (error) {
    console.error("[Automation Engine Execution Error]:", error);
    return result;
  }
}
