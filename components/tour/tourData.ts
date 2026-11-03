import { ITourStep } from "./tourTypes";

export const SIDEBAR_TARGET_IDS = new Set<string>([
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

export function isSidebarTarget(targetId?: string): boolean {
  if (!targetId) return false;
  return SIDEBAR_TARGET_IDS.has(targetId);
}

export const TOUR_STEPS: ITourStep[] = [
  {
    id: "welcome-brand",
    targetId: "tour-brand-header",
    title: "Brand Logo & Home",
    category: "Navigation",
    description: "Click anytime to return instantly to your primary executive dashboard.",
    iconName: "Sparkles",
  },
  {
    id: "btn-collapse",
    targetId: "tour-btn-collapse",
    title: "Sidebar Toggle",
    category: "Control",
    description: "Expand or collapse the sidebar into an icon rail to maximize your workspace view.",
    iconName: "ChevronLeft",
  },
  {
    id: "nav-dashboard",
    targetId: "tour-nav-dashboard",
    title: "Sales Dashboard",
    category: "Navigation",
    description: "View real-time conversion rates, pipeline deal velocity, and unread customer messages.",
    iconName: "LayoutDashboard",
  },
  {
    id: "nav-chat",
    targetId: "tour-nav-chat",
    title: "WhatsApp Live Inbox",
    category: "Navigation",
    description: "Unified team inbox where multiple sales agents reply to customer chats in real-time.",
    iconName: "MessageSquare",
  },
  {
    id: "nav-pipeline",
    targetId: "tour-nav-pipeline",
    title: "Visual Kanban Pipeline",
    category: "Navigation",
    description: "Drag-and-drop leads across stages from Initial Contact to Deals Won.",
    iconName: "Kanban",
  },
  {
    id: "nav-team",
    targetId: "tour-nav-team",
    title: "Team & Permissions",
    category: "Navigation",
    description: "Invite sales agents, manage access roles, and monitor security audit logs.",
    iconName: "Users",
  },
  {
    id: "nav-billing",
    targetId: "tour-nav-billing",
    title: "Billing & Plans",
    category: "Navigation",
    description: "Manage your subscription plan, add agent seats, and download Stripe invoices.",
    iconName: "CreditCard",
  },
  {
    id: "nav-settings",
    targetId: "tour-nav-settings",
    title: "WhatsApp API & Settings",
    category: "Navigation",
    description: "Connect official Meta WhatsApp Cloud API credentials and webhooks.",
    iconName: "Settings",
  },
  {
    id: "nav-quick-add",
    targetId: "tour-nav-quick-add",
    title: "+ Add New Lead",
    category: "Action",
    description: "Capture fresh prospect contacts, expected deal values, and assign stages with 1 click.",
    iconName: "PlusCircle",
  },
  {
    id: "btn-whatsapp-status",
    targetId: "tour-btn-whatsapp-status",
    title: "WhatsApp Line Status",
    category: "Connection",
    description: "Displays your verified multi-agent WhatsApp phone number and active health.",
    iconName: "Phone",
  },
  {
    id: "btn-tour-launcher",
    targetId: "tour-btn-launcher",
    title: "Tour & Buttons Guide",
    category: "Control",
    description: "Restart this tour anytime or browse the complete directory of website controls.",
    iconName: "Compass",
  },
  {
    id: "btn-logout",
    targetId: "tour-btn-logout",
    title: "Sign Out",
    category: "Account",
    description: "Securely end your active session and sign out of this workspace.",
    iconName: "LogOut",
  },
  {
    id: "btn-dashboard-chat",
    targetId: "tour-btn-dashboard-chat",
    title: "Open Live Inbox",
    category: "Action",
    description: "One-click shortcut to immediately review and respond to waiting customer chats.",
    iconName: "MessageSquare",
  },
  {
    id: "btn-dashboard-pipeline",
    targetId: "tour-btn-dashboard-pipeline",
    title: "Open Pipeline Funnel",
    category: "Action",
    description: "One-click shortcut to switch directly to your visual deal Kanban board.",
    iconName: "ArrowUpRight",
  },
];

