import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/authActions";
import { getTeamMembers, getWorkspaceAuditLogs } from "@/actions/teamActions";
import { TeamManagementClient } from "@/components/team/TeamManagementClient";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const authData = await getCurrentUser();

  if (!authData?.user) {
    redirect("/login");
  }

  // Enforce RBAC: Agents cannot access Team Management
  if (authData.user.role === "agent") {
    redirect("/agent/dashboard");
  }

  const membersRes = await getTeamMembers();
  const logsRes = await getWorkspaceAuditLogs(80);

  return (
    <TeamManagementClient
      initialMembers={membersRes.members || []}
      initialLogs={logsRes.logs || []}
      currentUserId={authData.user._id || ""}
      currentUserRole={authData.user.role || "agent"}
    />
  );
}
