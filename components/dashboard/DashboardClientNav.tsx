"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Kanban,
  MessageSquare,
  Users,
  Settings,
  CreditCard,
  Plus,
  Headphones,
} from "lucide-react";
import { AddLeadModal } from "@/components/kanban/AddLeadModal";

export function DashboardClientNav({
  userRole = "admin",
  onNavigate,
  isCollapsed = false,
  onOpenAddLead,
}: {
  userRole?: string;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onOpenAddLead?: () => void;
}) {
  const pathname = usePathname();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isAgent = userRole === "agent";

  // Logical groups mirroring Dribbble Neumorphic side menu
  const navigationGroups = isAgent
    ? [
        {
          id: "ops",
          items: [
            {
              name: "Agent Workstation",
              href: "/agent/dashboard",
              icon: Headphones,
            },
            {
              name: "WhatsApp Inbox",
              href: "/chat",
              icon: MessageSquare,
              badge: "Live",
              badgeColor: "bg-emerald-500 text-white",
            },
            {
              name: "Sales Pipeline",
              href: "/pipeline",
              icon: Kanban,
            },
          ],
        },
      ]
    : [
        {
          id: "core",
          items: [
            {
              name: "Owner Dashboard",
              href: "/dashboard",
              icon: LayoutDashboard,
            },
            {
              name: "Sales Pipeline",
              href: "/pipeline",
              icon: Kanban,
            },
            {
              name: "WhatsApp Inbox",
              href: "/chat",
              icon: MessageSquare,
              badge: "Live",
              badgeColor: "bg-emerald-500 text-white",
            },
          ],
        },
        {
          id: "team",
          items: [
            {
              name: "Agent Workstation",
              href: "/agent/dashboard",
              icon: Headphones,
            },
            {
              name: "Team & Security",
              href: "/team",
              icon: Users,
            },
          ],
        },
        {
          id: "system",
          items: [
            {
              name: "Billing & Plans",
              href: "/billing",
              icon: CreditCard,
            },
            {
              name: "API & Settings",
              href: "/settings",
              icon: Settings,
            },
          ],
        },
      ];

  return (
    <>
      <nav
        aria-label="Main Application Menu"
        className={`flex-1 overflow-y-auto ${
          isCollapsed
            ? "px-2 py-2 flex flex-col items-center space-y-1"
            : "px-3 sm:px-4 py-2 space-y-1"
        }`}
      >
        {navigationGroups.map((group, groupIdx) => (
          <React.Fragment key={group.id}>
            {groupIdx > 0 && (
              <div
                className={
                  isCollapsed
                    ? "neu-dribbble-divider my-1.5"
                    : "neu-dribbble-divider-full my-2"
                }
                aria-hidden="true"
              />
            )}

            <div className={`w-full flex flex-col ${isCollapsed ? "items-center space-y-1.5" : "space-y-1"}`}>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const tourId =
                  item.href === "/chat"
                    ? "tour-nav-chat"
                    : item.href === "/pipeline"
                    ? "tour-nav-pipeline"
                    : item.href === "/team"
                    ? "tour-nav-team"
                    : item.href === "/billing"
                    ? "tour-nav-billing"
                    : item.href === "/settings"
                    ? "tour-nav-settings"
                    : item.href === "/dashboard"
                    ? "tour-nav-dashboard"
                    : undefined;

                if (isCollapsed) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      id={tourId}
                      onClick={() => {
                        if (onNavigate) onNavigate();
                      }}
                      title={item.name}
                      aria-label={item.name}
                      aria-current={isActive ? "page" : undefined}
                      className={`group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "neu-dribbble-active text-slate-900 font-bold"
                          : "text-slate-900 hover:neu-tab hover:text-black"
                      }`}
                    >
                      <Icon
                        className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 transition-transform group-hover:scale-105"
                        aria-hidden="true"
                      />
                      {item.badge && (
                        <span
                          aria-hidden="true"
                          className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                        />
                      )}
                    </Link>
                  );
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    id={tourId}
                    onClick={() => {
                      if (onNavigate) onNavigate();
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "neu-dribbble-active text-slate-900 font-bold"
                        : "text-slate-800 hover:text-slate-900 hover:neu-tab"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className="w-5 h-5 text-slate-900 transition-colors"
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold border ${
                          item.badgeColor
                            ? `${item.badgeColor} border-emerald-500/30 shadow-xs`
                            : "bg-[#e2e8f1] text-slate-700 border-white/50 neu-pressed"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </React.Fragment>
        ))}

        {/* Divider before Add Lead */}
        <div
          className={
            isCollapsed
              ? "neu-dribbble-divider my-2"
              : "neu-dribbble-divider-full my-2.5"
          }
          aria-hidden="true"
        />

        <div className={isCollapsed ? "pt-1 flex justify-center w-full" : "pt-1 px-1"}>
          <button
            type="button"
            id="tour-nav-quick-add"
            onClick={() => {
              if (onOpenAddLead) {
                onOpenAddLead();
              } else {
                if (onNavigate) onNavigate();
                setIsAddModalOpen(true);
              }
            }}
            aria-label="Add new lead to sales pipeline"
            title="Add New Lead"
            className={
              isCollapsed
                ? "w-11 h-11 sm:w-12 sm:h-12 neu-btn-primary rounded-full flex items-center justify-center text-white cursor-pointer shadow-md hover:scale-105 transition-transform"
                : "w-full py-2.5 px-4 neu-btn-primary rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 text-white cursor-pointer shadow-md"
            }
          >
            <Plus className="w-5 h-5 text-white" aria-hidden="true" />
            {!isCollapsed && <span>Add New Lead</span>}
          </button>
        </div>
      </nav>

      {!onOpenAddLead && (
        <AddLeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onLeadCreated={() => {
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
