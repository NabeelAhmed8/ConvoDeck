import { redirect } from "next/navigation";

export default async function AgentLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  if (params?.email) {
    redirect(`/agent/login?email=${encodeURIComponent(params.email)}`);
  }
  redirect("/agent/login");
}
