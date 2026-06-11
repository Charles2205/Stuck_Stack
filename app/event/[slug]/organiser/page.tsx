import { notFound } from "next/navigation";
import { OrganiserDashboard } from "@/components/organiser/OrganiserDashboard";
import { prisma } from "@/lib/db";

export default async function OrganiserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      <OrganiserDashboard slug={event.slug} />
    </main>
  );
}
