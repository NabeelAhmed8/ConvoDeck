import { LucideIcon, Sparkles, Tag, MessageSquare } from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "features", label: "Features", href: "#features", icon: Sparkles },
  { id: "pricing", label: "Pricing", href: "#pricing", icon: Tag },
  { id: "contact", label: "Contact", href: "#contact", icon: MessageSquare },
];
