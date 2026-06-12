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
        <div className="brutal-box border-[4px] border-[#111] bg-[#ff3d00] p-8 max-w-xl shadow-[8px_8px_0px_0px_#111] rotate-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white drop-shadow-[2px_2px_0px_#111]">
            This isn&apos;t your event
          </h2>
          <p className="text-lg font-bold text-[#111] mt-4 bg-white p-4 border-[3px] border-[#111]">
            The live dashboard for <strong className="bg-[#ffd200] px-1 border-2 border-[#111]">{event.name}</strong> is only
            available to the organizer who owns it. You&apos;re signed in as{" "}
            <strong className="bg-[#00e5ff] px-1 border-2 border-[#111]">{organizer.name}</strong>.{" "}
            <br/><br/>
            <Link href="/workspace" className="underline decoration-2 underline-offset-4 text-[#ff3d00] hover:bg-[#111] hover:text-white transition-colors">
              Back to your workspace
            </Link>
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
