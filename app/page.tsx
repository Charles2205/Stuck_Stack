import Link from "next/link";
import { JoinEventForm } from "@/components/JoinEventForm";
import { DEMO_EVENT_SLUG } from "@/lib/constants";
import { prisma } from "@/lib/db";

// Always read the event from the DB at request time (never bake build-time state).
export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const event = await prisma.event.findUnique({
    where: { slug: DEMO_EVENT_SLUG },
  });

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-xl w-full flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold tracking-widest uppercase text-indigo-600">
            Stuck Stack
          </p>
          <h1 className="text-4xl font-bold leading-tight">
            Networking based on pain, not profiles.
          </h1>
          <p className="text-lg text-slate-600">
            Post the one thing you&apos;re stuck on. Find the person in this
            building who&apos;s already solved it. Five minutes, problem gone.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4">
          {event ? (
            <>
              <div>
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-sm text-slate-500">
                  {event.date.toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <JoinEventForm slug={event.slug} />
              <p className="text-sm text-slate-500 border-t border-slate-100 pt-3">
                Organizer?{" "}
                <Link href="/signin" className="underline text-indigo-600">
                  Sign in to your workspace
                </Link>
              </p>
            </>
          ) : (
            <p className="text-slate-600">
              No event seeded yet. Run{" "}
              <code className="bg-slate-100 px-1 rounded">npx prisma db seed</code>{" "}
              and refresh.
            </p>
          )}
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
          <li className="rounded-lg bg-white border border-slate-200 p-3">
            <strong className="block text-slate-900">Post a blocker</strong>
            One specific thing you&apos;re stuck on.
          </li>
          <li className="rounded-lg bg-white border border-slate-200 p-3">
            <strong className="block text-slate-900">Find your people</strong>
            &ldquo;I&apos;m stuck too&rdquo; or &ldquo;I can help.&rdquo;
          </li>
          <li className="rounded-lg bg-white border border-slate-200 p-3">
            <strong className="block text-slate-900">5-minute slots</strong>
            Helpers claim a time and table. Done.
          </li>
        </ul>
      </div>
    </main>
  );
}
