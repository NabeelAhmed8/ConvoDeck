/**
 * routingService.ts
 * Single Responsibility: Distributes leads among active team agents via Round-Robin.
 */

import { User } from "@/models/User";
import { AutomationConfig } from "@/models/AutomationConfig";

export interface RoutingResult {
  assignedAgentId?: string;
  assignedAgentName?: string;
}

export async function routeLeadRoundRobin(
  workspaceId: string
): Promise<RoutingResult> {
  try {
    const eligibleAgents = await User.find({
      workspaceId,
      status: "active",
    })
      .sort({ createdAt: 1 })
      .lean();

    if (!eligibleAgents || eligibleAgents.length === 0) {
      return {};
    }

    const config = await AutomationConfig.findOne({ workspaceId });
    const currentIndex = config?.lastAssignedAgentIndex || 0;
    const nextIndex = (currentIndex + 1) % eligibleAgents.length;

    const assignedAgent = eligibleAgents[currentIndex % eligibleAgents.length];

    await AutomationConfig.updateOne(
      { workspaceId },
      { $set: { lastAssignedAgentIndex: nextIndex } },
      { upsert: true }
    );

    return {
      assignedAgentId: assignedAgent._id.toString(),
      assignedAgentName: assignedAgent.name,
    };
  } catch (error) {
    console.error("[RoundRobin Routing Error]:", error);
    return {};
  }
}
