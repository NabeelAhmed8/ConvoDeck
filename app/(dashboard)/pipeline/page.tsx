import React from "react";
import { getLeads } from "@/actions/leadActions";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const leads = await getLeads();

  return (
    <div className="h-full">
      <KanbanBoard initialLeads={leads} />
    </div>
  );
}
