import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { OrganiserDashboard } from "@/components/organiser/OrganiserDashboard";
import { prisma } from "@/lib/db";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export default async function OrganiserPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event) notFound();

  const organizer = await getCurrentOrganizer();
  if (!organizer) redirect("/signin");

  if (event.organizerId !== organizer.id) {
    return (
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 max-w-xl">
          <h2 className="font-semibold text-amber-900">
            This isn&apos;t your event
          </h2>
          <p className="text-sm text-amber-800 mt-1">
            The live dashboard for <strong>{event.name}</strong> is only
            available to the organizer who owns it. You&apos;re signed in as{" "}
            <strong>{organizer.name}</strong>.{" "}
            <Link href="/workspace" className="underline">
              Back to your workspace
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
      <OrganiserDashboard slug={event.slug} />
    </main>
  );
}
