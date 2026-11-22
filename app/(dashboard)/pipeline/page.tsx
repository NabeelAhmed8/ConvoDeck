import React from "react";
import { getLeads } from "@/actions/leadActions";
import { getCurrentUser } from "@/actions/authActions";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const [leads, userRes] = await Promise.all([
    getLeads(),
    getCurrentUser(),
  ]);

  const userRole = userRes?.user?.role || "admin";

  return (
    <div className="h-full">
      <KanbanBoard initialLeads={leads} userRole={userRole} />
    </div>
  );
}
