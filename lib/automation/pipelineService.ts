/**
 * pipelineService.ts
 * Single Responsibility: Calculates stage transitions and tag mutations for a lead.
 */

import { LeadStage } from "@/types";
import { RuleEvaluationMatches } from "./ruleEvaluator";

export interface PipelineMutationPlan {
  newStage?: LeadStage;
  tagsToAdd: string[];
  suggestedDealValue?: number;
}

export function computePipelineMutation(
  currentStage: LeadStage,
  currentTags: string[],
  matches: RuleEvaluationMatches
): PipelineMutationPlan {
  const tagsToAdd: string[] = [];
  let newStage: LeadStage | undefined = undefined;
  let suggestedDealValue: number | undefined = undefined;

  // 1. Demo Scheduling Intent
  if (matches.hasDemoIntent) {
    if (currentStage === "NEW" || currentStage === "CONTACTED") {
      newStage = "DEMO_SCHEDULED";
    }
    if (!currentTags.includes("Demo Requested")) {
      tagsToAdd.push("Demo Requested");
    }
  }

  // 2. Pricing or Quotation Intent
  if (matches.hasPricingIntent) {
    if (!newStage && currentStage === "NEW") {
      newStage = "CONTACTED";
    }
    if (!currentTags.includes("Pricing Inquiry")) {
      tagsToAdd.push("Pricing Inquiry");
    }
  }

  // 3. Urgent Sentiment Flag
  if (matches.hasUrgentSentiment) {
    if (!currentTags.includes("Urgent")) {
      tagsToAdd.push("Urgent");
    }
  }

  // 4. Human Handoff Flag
  if (matches.hasHandoffRequest) {
    if (!currentTags.includes("Needs Human")) {
      tagsToAdd.push("Needs Human");
    }
  }

  return {
    newStage,
    tagsToAdd,
    suggestedDealValue,
  };
}
