export type TourIconName =
  | "Sparkles"
  | "MessageSquare"
  | "Kanban"
  | "Users"
  | "PlusCircle"
  | "Settings"
  | "ChevronLeft"
  | "CreditCard"
  | "Phone"
  | "LogOut"
  | "Compass"
  | "ArrowUpRight";

export interface ITourStep {
  id: string;
  targetId: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  iconName: TourIconName;
  shortcut?: string;
  preferredPosition?: "top" | "bottom" | "left" | "right" | "center";
}

export const SIDEBAR_TOUR_TARGET_IDS = new Set<string>([
  "tour-brand-header",
  "tour-btn-collapse",
  "tour-nav-dashboard",
  "tour-nav-chat",
  "tour-nav-pipeline",
  "tour-nav-team",
  "tour-nav-billing",
  "tour-nav-settings",
  "tour-nav-quick-add",
  "tour-btn-whatsapp-status",
  "tour-btn-launcher",
  "tour-btn-logout",
]);

export function isSidebarTourTarget(targetId?: string): boolean {
  if (!targetId) return false;
  return SIDEBAR_TOUR_TARGET_IDS.has(targetId);
}

export const TOUR_STEPS: ITourStep[] = [
  {
    id: "welcome-brand",
    targetId: "tour-brand-header",
    title: "Brand Logo & Home",
    subtitle: "Navigation Control",
    description:
      "Click the ConvoDeck brand logo at any time to return directly to the main executive overview dashboard.",
    badge: "Button 1 of 14",
    iconName: "Sparkles",
    preferredPosition: "right",
  },
  {
    id: "btn-collapse",
    targetId: "tour-btn-collapse",
    title: "Sidebar Collapse / Expand",
    subtitle: "Workspace Control",
    description:
      "Toggle between the full sidebar and a compact icon rail. Ideal for expanding your view when managing high-volume chat feeds or Kanban boards.",
    badge: "Button 2 of 14",
    iconName: "ChevronLeft",
    shortcut: "ArrowLeft / ArrowRight",
    preferredPosition: "right",
  },
  {
    id: "nav-dashboard",
    targetId: "tour-nav-dashboard",
    title: "Owner Dashboard Button",
    subtitle: "Navigation Control",
    description:
      "Takes you to your central analytics hub. View total leads, active pipeline value, closed revenue, and unread customer inquiries live.",
    badge: "Button 3 of 14",
    iconName: "Sparkles",
    preferredPosition: "right",
  },
  {
    id: "nav-chat",
    targetId: "tour-nav-chat",
    title: "WhatsApp Live Inbox Button",
    subtitle: "Navigation Control",
    description:
      "Opens your real-time WhatsApp multi-agent messaging inbox. Reply to incoming customer inquiries, send quick messages, and review conversation logs.",
    badge: "Button 4 of 14",
    iconName: "MessageSquare",
    preferredPosition: "right",
  },
  {
    id: "nav-pipeline",
    targetId: "tour-nav-pipeline",
    title: "Sales Pipeline Button",
    subtitle: "Navigation Control",
    description:
      "Launches the visual Kanban deal board. Drag and drop leads across stages (New, Contacted, Demo, Won, Lost) to keep your funnel updated.",
    badge: "Button 5 of 14",
    iconName: "Kanban",
    preferredPosition: "right",
  },
  {
    id: "nav-team",
    targetId: "tour-nav-team",
    title: "Team & Security Button",
    subtitle: "Navigation Control",
    description:
      "Invite sales representatives, configure roles (Admin, Agent, Manager), and monitor live security audit logs of all team activities.",
    badge: "Button 6 of 14",
    iconName: "Users",
    preferredPosition: "right",
  },
  {
    id: "nav-billing",
    targetId: "tour-nav-billing",
    title: "Billing & Plans Button",
    subtitle: "Navigation Control",
    description:
      "Review active subscriptions, add additional agent seats, manage Stripe billing, and download payment invoices.",
    badge: "Button 7 of 14",
    iconName: "CreditCard",
    preferredPosition: "right",
  },
  {
    id: "nav-settings",
    targetId: "tour-nav-settings",
    title: "API & Settings Button",
    subtitle: "Navigation Control",
    description:
      "Connect your official Meta WhatsApp Cloud API credentials (Phone Number ID, System Access Token), configure Webhooks, and verify 2FA.",
    badge: "Button 8 of 14",
    iconName: "Settings",
    preferredPosition: "right",
  },
  {
    id: "nav-quick-add",
    targetId: "tour-nav-quick-add",
    title: "+ Add New Lead Button",
    subtitle: "Primary Action Button",
    description:
      "Your most vital action! Click to instantly capture a customer contact, record expected deal value, assign initial stage, and tag leads.",
    badge: "Button 9 of 14",
    iconName: "PlusCircle",
    preferredPosition: "right",
  },
  {
    id: "btn-whatsapp-status",
    targetId: "tour-btn-whatsapp-status",
    title: "WhatsApp Business Status Card",
    subtitle: "Connection Health Indicator",
    description:
      "Displays your active WhatsApp phone number and verified multi-agent line status. Click to inspect or update connection credentials.",
    badge: "Button 10 of 14",
    iconName: "Phone",
    preferredPosition: "right",
  },
  {
    id: "btn-tour-launcher",
    targetId: "tour-btn-launcher",
    title: "Tour & Buttons Guide Launcher",
    subtitle: "Help & Discovery",
    description:
      "Click anytime to restart this step-by-step tour or open the complete searchable directory of every button on the platform.",
    badge: "Button 11 of 14",
    iconName: "Compass",
    preferredPosition: "right",
  },
  {
    id: "btn-logout",
    targetId: "tour-btn-logout",
    title: "Sign Out Button",
    subtitle: "Account Security",
    description:
      "Terminates your current agent/admin session securely and clears authentication cookies.",
    badge: "Button 12 of 14",
    iconName: "LogOut",
    preferredPosition: "right",
  },
  {
    id: "btn-dashboard-chat",
    targetId: "tour-btn-dashboard-chat",
    title: "Quick Action: Open WhatsApp Inbox",
    subtitle: "Dashboard Banner Action",
    description:
      "One-click shortcut from the dashboard overview to instantly view and respond to waiting customer inquiries.",
    badge: "Button 13 of 14",
    iconName: "MessageSquare",
    preferredPosition: "bottom",
  },
  {
    id: "btn-dashboard-pipeline",
    targetId: "tour-btn-dashboard-pipeline",
    title: "Quick Action: View Pipeline",
    subtitle: "Dashboard Banner Action",
    description:
      "One-click shortcut to immediately switch to your Kanban sales funnel and track revenue velocity.",
    badge: "Button 14 of 14",
    iconName: "ArrowUpRight",
    preferredPosition: "bottom",
  },
];
