import { redirect } from "next/navigation";

export default function LegacyKanbanRedirect() {
  redirect("/pipeline");
}
