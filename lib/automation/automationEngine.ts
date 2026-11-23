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
import { generateAiSupportReply } from "./aiAssistantService";

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
    let config = await AutomationConfig.findOne({ workspaceId });
    if (!config) {
      config = await AutomationConfig.create({ workspaceId });
    }

    const matches = evaluateMessageRules(messageText, config);

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

    if (result.triggeredRules.length > 0 && lead._id) {
      await Lead.findByIdAndUpdate(lead._id, {
        $set: {
          stage: lead.stage,
          tags: lead.tags,
          assignedTo: lead.assignedTo,
        },
      });
    }

    if (config.autoReplyEnabled && lead._id) {
      let replyText = "";
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://convodeck.com";

      if (matches.hasHandoffRequest) {
        replyText = "We have notified a human agent to join this conversation right away.";
        result.triggeredRules.push("HANDOFF");
      } else if (matches.hasPricingIntent) {
        // Direct answer with plans page link as requested by user
        replyText = `Here are our plans and pricing details: ${baseUrl}/pricing\n\nYou can explore our Starter, Growth, and Enterprise plans with a 14-day free trial. Let us know if you need help choosing!`;
        result.triggeredRules.push("AUTO_REPLY");
      } else {
        // AI Smart Solution & Question Answering
        const aiSolution = await generateAiSupportReply(messageText, baseUrl);
        if (aiSolution) {
          replyText = aiSolution;
          result.triggeredRules.push("AUTO_REPLY");
        } else if (lead.unreadCount === 1 || !lead.lastMessageAt) {
          // First message greeting fallback
          replyText = config.greetingMessage;
          result.triggeredRules.push("AUTO_REPLY");
        }
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
