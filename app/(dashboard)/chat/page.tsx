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
    <div className="fixed inset-x-2 sm:inset-x-4 bottom-2 top-[68px] sm:top-[76px] lg:static lg:inset-auto lg:h-full flex-1 w-auto lg:w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-[8px_8px_24px_rgba(160,178,204,0.2),-8px_-8px_24px_#ffffff] overflow-hidden flex flex-col md:flex-row min-h-0 z-20">
      <ChatSidebar initialLeads={leads} />
      <ChatWindow />
    </div>
  );
}
