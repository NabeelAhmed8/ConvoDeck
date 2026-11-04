export type AutomationRuleType =
  | "AUTO_REPLY"
  | "PIPELINE_MOVE"
  | "ROUND_ROBIN"
  | "URGENT_TAG"
  | "HANDOFF";

export interface IAutomationConfig {
  _id?: string;
  workspaceId: string;
  autoReplyEnabled: boolean;
  greetingMessage: string;
  pipelineAutomationEnabled: boolean;
  demoKeywords: string[];
  pricingKeywords: string[];
  roundRobinEnabled: boolean;
  lastAssignedAgentIndex: number;
  urgentDetectionEnabled: boolean;
  urgentKeywords: string[];
  autoHandoffKeywords: string[];
  updatedAt?: string | Date;
}

export interface IAutomationLogItem {
  _id?: string;
  workspaceId: string;
  ruleType: AutomationRuleType;
  leadName: string;
  leadPhone: string;
  triggerText: string;
  actionTaken: string;
  createdAt?: string | Date;
}

export interface AutomationExecutionResult {
  triggeredRules: AutomationRuleType[];
  autoReplied: boolean;
  autoReplyText?: string;
  stageUpdated?: string;
  tagsAdded: string[];
  assignedAgentName?: string;
  assignedAgentId?: string;
}
