import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/authActions";
import { getAutomationSettings, getAutomationLogs } from "@/actions/automationActions";
import { AutomationsClient } from "@/components/automations/AutomationsClient";

export const dynamic = "force-dynamic";

export default async function AutomationsPage() {
  const authData = await getCurrentUser();

  if (!authData?.user) {
    redirect("/login");
  }

  // Agents don't have access to global automation rules configuration
  if (authData.user.role === "agent") {
    redirect("/agent/dashboard");
  }

  const [config, logs] = await Promise.all([
    getAutomationSettings(),
    getAutomationLogs(50),
  ]);

  return (
    <AutomationsClient initialConfig={config} initialLogs={logs} />
  );
}
