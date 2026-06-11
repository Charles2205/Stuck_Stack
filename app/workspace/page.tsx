import { redirect } from "next/navigation";
import { WorkspaceHome } from "@/components/workspace/WorkspaceHome";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export default async function WorkspacePage() {
  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/signin");

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      <WorkspaceHome
        organizer={{ id: organizer.id, name: organizer.name }}
      />
    </main>
  );
}
