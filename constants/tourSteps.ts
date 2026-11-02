export interface ITourStep {
  id: string;
  targetId: string;
  title: string;
  description: string;
  badge: string;
  iconName: "Sparkles" | "MessageSquare" | "Kanban" | "Users" | "PlusCircle" | "Settings";
  preferredPosition?: "top" | "bottom" | "left" | "right" | "center";
}

export const TOUR_STEPS: ITourStep[] = [
  {
    id: "welcome",
    targetId: "tour-brand-header",
    title: "Welcome to ConvoDeck 👋",
    description:
      "ConvoDeck is your all-in-one Multi-Agent WhatsApp CRM and sales pipeline automation platform. Let's take a quick 1-minute walkthrough to get you started!",
    badge: "Step 1 of 6",
    iconName: "Sparkles",
    preferredPosition: "right",
  },
  {
    id: "chat",
    targetId: "tour-nav-chat",
    title: "WhatsApp Live Inbox 💬",
    description:
      "Manage customer conversations in real-time. Share workloads across multiple agents, send instant replies, and view customer chat history all in one place.",
    badge: "Step 2 of 6",
    iconName: "MessageSquare",
    preferredPosition: "right",
  },
  {
    id: "pipeline",
    targetId: "tour-nav-pipeline",
    title: "Visual Sales Pipeline 📊",
    description:
      "Drag and drop customer deals across pipeline stages (New, Contacted, Demo, Won). Keep full visibility over your sales velocity and total deal values.",
    badge: "Step 3 of 6",
    iconName: "Kanban",
    preferredPosition: "right",
  },
  {
    id: "team",
    targetId: "tour-nav-team",
    title: "Multi-Agent Team & Security 👥",
    description:
      "Add your sales agents, configure role permissions (Admin, Agent, Manager), and monitor comprehensive security audit logs for all team operations.",
    badge: "Step 4 of 6",
    iconName: "Users",
    preferredPosition: "right",
  },
  {
    id: "quick-add",
    targetId: "tour-nav-quick-add",
    title: "Quick Lead Creation ⚡",
    description:
      "Click '+ Add Lead' from anywhere to immediately register a prospect, set an estimated deal value, and assign them directly to your team pipeline.",
    badge: "Step 5 of 6",
    iconName: "PlusCircle",
    preferredPosition: "right",
  },
  {
    id: "settings",
    targetId: "tour-nav-settings",
    title: "WhatsApp API & Settings ⚙️",
    description:
      "Connect your official Meta WhatsApp Cloud API credentials, enforce Two-Factor Authentication (2FA), and adjust your company profile.",
    badge: "Step 6 of 6",
    iconName: "Settings",
    preferredPosition: "right",
  },
];
