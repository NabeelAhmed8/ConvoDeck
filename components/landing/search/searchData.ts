export interface SearchItem {
  id: string;
  title: string;
  category: "Features" | "Navigation" | "Platform" | "Action";
  description: string;
  href: string;
  iconName:
    | "MessageSquare"
    | "Kanban"
    | "CreditCard"
    | "Phone"
    | "LogIn"
    | "UserPlus"
    | "ShieldCheck"
    | "Headphones"
    | "FileText";
  keywords: string[];
}

export const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "inbox",
    title: "Multi-Agent WhatsApp Inbox",
    category: "Features",
    description: "Shared team inbox for simultaneous agent messaging and live sync.",
    href: "#features",
    iconName: "MessageSquare",
    keywords: ["chat", "whatsapp", "inbox", "multi-agent", "messages", "team"],
  },
  {
    id: "pipeline",
    title: "Visual Sales Pipeline",
    category: "Features",
    description: "Kanban deal board with drag-and-drop lead stage management.",
    href: "#features",
    iconName: "Kanban",
    keywords: ["pipeline", "kanban", "leads", "deals", "stages", "crm"],
  },
  {
    id: "meta-api",
    title: "Meta WhatsApp Cloud API",
    category: "Platform",
    description: "Official Meta Cloud API integration with verified sender status.",
    href: "#features",
    iconName: "ShieldCheck",
    keywords: ["meta", "api", "cloud api", "official", "webhook", "verified"],
  },
  {
    id: "pricing",
    title: "Plans & Subscription Pricing",
    category: "Navigation",
    description: "Transparent pricing tiers: Starter, Growth, and Agency.",
    href: "#pricing",
    iconName: "CreditCard",
    keywords: ["pricing", "plans", "cost", "billing", "subscription", "price"],
  },
  {
    id: "contact",
    title: "Contact Sales & Consultation",
    category: "Action",
    description: "Direct sales consultation form for custom team onboarding.",
    href: "#contact",
    iconName: "Phone",
    keywords: ["contact", "sales", "demo", "help", "support", "consultation"],
  },
  {
    id: "agent-workstation",
    title: "Agent Workstation",
    category: "Platform",
    description: "Dedicated workstation portal for sales agents and representatives.",
    href: "/agent/dashboard",
    iconName: "Headphones",
    keywords: ["agent", "workstation", "seat", "operator", "portal"],
  },
  {
    id: "login",
    title: "Workspace Sign In",
    category: "Action",
    description: "Log in to your active ConvoDeck workspace account.",
    href: "/login",
    iconName: "LogIn",
    keywords: ["login", "signin", "auth", "account", "access"],
  },
  {
    id: "signup",
    title: "Create New Workspace",
    category: "Action",
    description: "Start free trial and set up your company WhatsApp CRM.",
    href: "/signup",
    iconName: "UserPlus",
    keywords: ["signup", "register", "join", "trial", "start", "create"],
  },
  {
    id: "terms",
    title: "Terms of Service",
    category: "Navigation",
    description: "Customer service agreement and WhatsApp Business policies.",
    href: "/terms",
    iconName: "FileText",
    keywords: ["terms", "policy", "legal", "compliance", "rules"],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    category: "Navigation",
    description: "Data encryption and confidential chat handling practices.",
    href: "/privacy",
    iconName: "ShieldCheck",
    keywords: ["privacy", "data", "security", "encryption", "gdpr"],
  },
];

