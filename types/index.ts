export type UserRole = "admin" | "agent" | "manager";
export type UserStatus = "active" | "suspended" | "deactivated";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: UserRole;
  status?: UserStatus;
  tokenVersion?: number;
  lastLoginAt?: string | Date;
  createdBy?: string;
  workspaceId: string;
  avatar?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type SubscriptionPlan = "trial" | "starter" | "growth" | "enterprise";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "canceled";
export type CurrencyCode = "USD" | "PKR" | "AED" | "EUR";
export type BillingFrequency = "monthly" | "yearly";

export interface IWorkspace {
  _id?: string;
  name: string;
  ownerEmail: string;
  whatsappPhoneNumber?: string;
  whatsappPhoneNumberId?: string;
  whatsappBusinessAccountId?: string;
  whatsappAccessToken?: string;
  webhookVerifyToken?: string;
  // Subscription & Billing
  plan?: SubscriptionPlan;
  planStatus?: SubscriptionStatus;
  billingFrequency?: BillingFrequency;
  planCurrency?: CurrencyCode;
  amountPaid?: number;
  planExpiresAt?: string | Date;
  lastPaymentDate?: string | Date;
  paymentMethod?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type LeadStage =
  | "NEW"
  | "CONTACTED"
  | "DEMO_SCHEDULED"
  | "PROPOSAL_SENT"
  | "WON"
  | "LOST";

export interface ILead {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  stage: LeadStage;
  dealValue: number;
  assignedTo?: string | IUser;
  workspaceId: string;
  tags?: string[];
  lastMessage?: string;
  lastMessageAt?: string | Date;
  unreadCount?: number;
  isMuted?: boolean;
  isBlocked?: boolean;
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type MessageSender = "customer" | "agent" | "bot";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";
export type MessageType = "text" | "image" | "document" | "template";

export interface IMessage {
  _id?: string;
  leadId: string;
  workspaceId: string;
  sender: MessageSender;
  senderName?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  text: string;
  mediaUrl?: string;
  type: MessageType;
  status: MessageStatus;
  whatsappMessageId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export type AuditAction =
  | "SENT_MESSAGE"
  | "UPDATED_LEAD_STAGE"
  | "CREATED_LEAD"
  | "DELETED_LEAD"
  | "CREATED_AGENT"
  | "UPDATED_AGENT"
  | "DEACTIVATED_AGENT"
  | "ACTIVATED_AGENT"
  | "REVOKED_ACCESS"
  | "AGENT_LOGIN";

export interface IAuditLog {
  _id?: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  action: AuditAction;
  targetType: "lead" | "message" | "agent" | "workspace";
  targetId?: string;
  targetName?: string;
  details: string;
  createdAt?: string | Date;
}

export interface KanbanColumnDef {
  id: LeadStage;
  title: string;
  color: string;
  badgeBg: string;
}
