import React from "react";
import { getLeads } from "@/actions/leadActions";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ILead } from "@/types";

export const dynamic = "force-dynamic";

interface ChatPageProps {
  searchParams: Promise<{ leadId?: string }>;
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
  const resolvedParams = await searchParams;
  const leads: ILead[] = await getLeads();

  return (
    <div className="flex-1 min-h-0 w-full bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-[8px_8px_24px_rgba(160,178,204,0.2),-8px_-8px_24px_#ffffff] overflow-hidden flex flex-col md:flex-row z-20">
      <ChatSidebar initialLeads={leads} />
      <ChatWindow />
    </div>
  );
}
