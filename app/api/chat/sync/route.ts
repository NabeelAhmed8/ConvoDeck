import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import { Message } from "@/models/Message";
import { Lead } from "@/models/Lead";
import { getSession } from "@/lib/auth";

const DEFAULT_WORKSPACE_ID =
  process.env.DEFAULT_WORKSPACE_ID || "convodeck_default_workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");
    const after = searchParams.get("after");
    const lastSync = searchParams.get("lastSync");
    const requestedWorkspace = searchParams.get("workspaceId");

    await dbConnect();

    // Determine authorized workspace
    const session = await getSession();
    const workspaceId =
      session?.workspaceId || requestedWorkspace || DEFAULT_WORKSPACE_ID;

    const serverTime = new Date().toISOString();

    // 1. Fetch Delta Messages for the active lead
    let newMessages: unknown[] = [];
    let statusUpdates: unknown[] = [];

    if (leadId) {
      if (after) {
        const afterDate = new Date(after);
        if (!isNaN(afterDate.getTime())) {
          // Fetch newly created messages since 'after'
          newMessages = await Message.find({
            leadId,
            createdAt: { $gt: afterDate },
          })
            .sort({ createdAt: 1 })
            .lean();

          // Fetch messages whose delivery/read status changed since 'after'
          statusUpdates = await Message.find({
            leadId,
            updatedAt: { $gt: afterDate },
            createdAt: { $lte: afterDate },
          })
            .select("_id status updatedAt")
            .lean();
        }
      }
    }

    // 2. Fetch Delta or Updated Leads for Sidebar live sync
    let leads: unknown[] = [];
    if (lastSync) {
      const lastSyncDate = new Date(lastSync);
      if (!isNaN(lastSyncDate.getTime())) {
        const leadFilter: Record<string, unknown> = {
          updatedAt: { $gt: lastSyncDate },
        };
        // If an explicit non-default workspace is active, scope to it
        if (workspaceId && !workspaceId.includes("mongodb+srv") && workspaceId !== DEFAULT_WORKSPACE_ID) {
          leadFilter.workspaceId = workspaceId;
        }

        leads = await Lead.find(leadFilter)
          .sort({ updatedAt: -1 })
          .lean();
      }
    }

    return NextResponse.json(
      {
        success: true,
        messages: newMessages,
        statusUpdates,
        leads,
        serverTime,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("[Chat Delta Sync Error]:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed", messages: [], leads: [] },
      { status: 500 }
    );
  }
}
