import { ShowcaseDeal, ShowcaseStage } from "./types";

export const SHOWCASE_DEALS: ShowcaseDeal[] = [
  {
    id: "deal-1",
    leadName: "David Miller",
    company: "TechCorp Global",
    phone: "+1 (555) 382-9102",
    avatarLetter: "D",
    incomingMessage:
      "Hello! We need 15 agent seats for our sales team. Can you send quotation and schedule onboarding?",
    incomingTime: "10:42 AM",
    agentReply:
      "Hi David! I have configured your 15-seat workspace with multi-agent WhatsApp inbox. Booking demo now!",
    dealTitle: "Enterprise Expansion",
    dealSeats: "15 Agent Seats • Annual Plan",
    dealValueUsd: 1450,
    initialStage: "Demo",
    assignedAgent: "Alex Morgan",
  },
  {
    id: "deal-2",
    leadName: "Sarah Jenkins",
    company: "Apex Retailers",
    phone: "+1 (555) 891-2304",
    avatarLetter: "S",
    incomingMessage:
      "We want to route customer support and sales queries to 5 dedicated agents automatically. Is routing live?",
    incomingTime: "11:15 AM",
    agentReply:
      "Welcome Sarah! Automated multi-agent skill routing is live on ConvoDeck. Setting up your trial right away.",
    dealTitle: "Retail Multi-Agent Suite",
    dealSeats: "5 Agent Seats • Growth Plan",
    dealValueUsd: 790,
    initialStage: "Contacted",
    assignedAgent: "Zainab Khan",
  },
  {
    id: "deal-3",
    leadName: "Elena Rostova",
    company: "Skyline Logistics",
    phone: "+44 20 7946 0912",
    avatarLetter: "E",
    incomingMessage:
      "Procurement approved our contract! Ready to connect our Meta WhatsApp Cloud API credentials.",
    incomingTime: "01:05 PM",
    agentReply:
      "Fantastic news Elena! Meta Cloud Webhooks are synchronized and your pipeline is activated. Congratulations!",
    dealTitle: "Custom Logistics Fleet",
    dealSeats: "30 Agent Seats • Enterprise Tier",
    dealValueUsd: 3200,
    initialStage: "Won",
    assignedAgent: "Tariq Siddiqui",
  },
];

export const STAGES: ShowcaseStage[] = ["New", "Contacted", "Demo", "Won"];

