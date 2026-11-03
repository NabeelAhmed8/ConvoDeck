export type ShowcaseStage = "New" | "Contacted" | "Demo" | "Won";

export interface ShowcaseDeal {
  id: string;
  leadName: string;
  company: string;
  phone: string;
  avatarLetter: string;
  incomingMessage: string;
  incomingTime: string;
  agentReply: string;
  dealTitle: string;
  dealSeats: string;
  dealValueUsd: number;
  initialStage: ShowcaseStage;
  assignedAgent: string;
}

