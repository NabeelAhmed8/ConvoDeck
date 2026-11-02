import { NextResponse } from "next/server";
import packageJson from "@/package.json";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const latestVersion =
    process.env.APP_LATEST_VERSION || packageJson.version || "0.2.0";
  const minSupportedVersion =
    process.env.APP_MIN_SUPPORTED_VERSION || "0.1.0";
  const downloadUrl =
    process.env.APP_DOWNLOAD_URL ||
    "https://github.com/NabeelAhmed8/ConvoDeck/releases";
  const releaseNotes =
    process.env.APP_RELEASE_NOTES ||
    "ConvoDeck v0.2.0: Performance upgrades, chat auto-scroll snap, sticky navigation headers, mobile responsive polish, and strict JWT authentication.";
  const mandatory = process.env.APP_FORCE_UPDATE === "true";

  return NextResponse.json(
    {
      appName: "ConvoDeck",
      latestVersion,
      minSupportedVersion,
      downloadUrl,
      releaseNotes,
      mandatory,
      checkedAt: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      },
    }
  );
}
