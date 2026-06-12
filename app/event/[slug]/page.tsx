import { notFound } from "next/navigation";
import { BlockerBoard } from "@/components/board/BlockerBoard";
import { prisma } from "@/lib/db";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export default async function EventBoardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  const organizer = await getCurrentOrganizer();
  const eventOwner =
    organizer && organizer.id === event.organizerId
      ? { name: organizer.name }
      : null;

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      <BlockerBoard
        slug={event.slug}
        eventName={event.name}
        eventOwner={eventOwner}
      />
    </main>
  );
}
