export interface IGuideStep {
  id: string;
  number: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  iconName: string;
  highlights: string[];
  shortcutHref?: string;
  shortcutLabel?: string;
}

export const GUIDE_STEPS: IGuideStep[] = [
  {
    id: "overview",
    number: 1,
    badge: "Executive Hub",
    title: "Central Sales Dashboard",
    subtitle: "Real-time Metrics & Conversion Tracking",
    description:
      "Monitor your entire sales velocity at a glance. Track active leads, closed won revenue, conversion funnel stages, and unread customer inquiries live.",
    iconName: "LayoutDashboard",
    highlights: [
      "Total Active Prospects",
      "Won Deal Velocity & Value",
      "Real-time Unread Alerts",
    ],
    shortcutHref: "/dashboard",
    shortcutLabel: "Open Dashboard",
  },
  {
    id: "inbox",
    number: 2,
    badge: "Live Communications",
    title: "WhatsApp Multi-Agent Inbox",
    subtitle: "One Official Line, Unlimited Sales Reps",
    description:
      "Never pass a single phone around the office again. Your entire sales team can read, reply, tag, and assign incoming WhatsApp conversations from one shared inbox.",
    iconName: "MessageSquare",
    highlights: [
      "Simultaneous Multi-Agent Chat",
      "Quick Reply Templates",
      "Conversation Search & Filter",
    ],
    shortcutHref: "/chat",
    shortcutLabel: "Open Live Inbox",
  },
  {
    id: "pipeline",
    number: 3,
    badge: "Sales Funnel",
    title: "Sales Pipeline",
    subtitle: "Drag-and-Drop Revenue Funnel",
    description:
      "Move deals smoothly across stages from New Inquiry to Won. Set expected deal sizes in USD, assign ownership to reps, and prevent hot opportunities from slipping through.",
    iconName: "Kanban",
    highlights: [
      "6 Conversion Stages (New to Won)",
      "Instant Dynamic Deal Values",
      "1-Click + Add Lead Modal",
    ],
    shortcutHref: "/pipeline",
    shortcutLabel: "View Pipeline",
  },
  {
    id: "team",
    number: 4,
    badge: "Security & Governance",
    title: "Team & Role Management",
    subtitle: "Access Controls & Audit Trails",
    description:
      "Invite sales representatives with RBAC roles (Admin, Agent, Manager). Instantly suspend offboarded staff access and review immutable security audit logs.",
    iconName: "Users",
    highlights: [
      "Role-Based Access Control (RBAC)",
      "Instant Session Revocation",
      "Immutable Audit Activity Logs",
    ],
    shortcutHref: "/team",
    shortcutLabel: "Manage Team",
  },
  {
    id: "settings",
    number: 5,
    badge: "Cloud Connectivity",
    title: "Meta WhatsApp API Setup",
    subtitle: "Official Cloud API & Webhook Health",
    description:
      "Connect your official Meta WhatsApp Business Cloud API with Phone Number ID and System Access Token. Verify webhook endpoints with real-time health checks.",
    iconName: "Settings",
    highlights: [
      "Official Meta Cloud API",
      "Automated Webhook Handshake",
      "Live Connection Health Monitor",
    ],
    shortcutHref: "/settings",
    shortcutLabel: "Open Settings",
  },
  {
    id: "billing",
    number: 6,
    badge: "Subscription & Seats",
    title: "Billing & Plans",
    subtitle: "Scale Your Sales Capacity",
    description:
      "Manage your active subscription, add additional sales agent seats as your volume grows, and download verified Stripe invoices anytime.",
    iconName: "CreditCard",
    highlights: [
      "Flexible Agent Team Seats",
      "Stripe Customer Portal",
      "Transparent Multi-Currency Pricing",
    ],
    shortcutHref: "/billing",
    shortcutLabel: "View Billing",
  },
];

