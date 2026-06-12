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
    <main className="flex-1 flex items-center justify-center px-6 py-12 lg:py-24 bg-[#fffbef] overflow-hidden">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative">
        
        {/* Left Column - Hero */}
        <div className="flex flex-col gap-8 relative z-10">
          <div className="flex flex-col gap-6 items-start">
            <p className="text-sm font-extrabold tracking-widest uppercase text-[#111] bg-[#ff3d00] border-[3px] border-[#111] w-fit px-4 py-2 shadow-[4px_4px_0px_0px_#111] -rotate-2">
              Stuck Stack
            </p>
            <h1 
              className="text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tighter text-white uppercase"
              style={{ WebkitTextStroke: "2.5px #111", textShadow: "4px 4px 0px #111" }}
            >
              Networking <br/> based on <br/> pain.
            </h1>
            <div className="text-xl lg:text-2xl text-[#111] font-bold bg-[#ffd200] border-[3px] border-[#111] p-5 shadow-[6px_6px_0px_0px_#111] mt-2 rotate-1">
              Post the one thing you&apos;re stuck on. Find the person who&apos;s already solved it. <br/> 
              <span className="bg-white px-2 mt-2 inline-block border-[3px] border-[#111]">Five minutes. Problem gone.</span>
            </div>
          </div>

          <ul className="flex flex-col gap-4 text-lg lg:text-xl font-bold mt-4">
            <li className="flex items-center gap-4">
              <span className="bg-[#00e5ff] border-[3px] border-[#111] w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_#111] text-2xl">1</span>
              Post a specific blocker.
            </li>
            <li className="flex items-center gap-4">
              <span className="bg-[#ff9100] border-[3px] border-[#111] w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_#111] text-2xl">2</span>
              Say &ldquo;I&apos;m stuck too&rdquo; or &ldquo;I can help.&rdquo;
            </li>
            <li className="flex items-center gap-4">
              <span className="bg-[#00e676] border-[3px] border-[#111] w-12 h-12 flex items-center justify-center shadow-[4px_4px_0px_0px_#111] text-2xl">3</span>
              Claim a 5-minute table slot.
            </li>
          </ul>
        </div>

        {/* Right Column - Form */}
        <div className="relative mt-8 lg:mt-0">
          {/* Decorative offset box */}
          <div className="absolute inset-0 bg-[#00e5ff] border-[3px] border-[#111] translate-x-6 translate-y-6"></div>
          
          <div className="brutal-box p-8 lg:p-10 flex flex-col gap-6 bg-white relative z-10 border-[3px] border-[#111] shadow-none">
            {event ? (
              <>
                <div className="border-b-[3px] border-[#111] pb-4 mb-2">
                  <h2 className="text-3xl font-extrabold uppercase">{event.name}</h2>
                  <p className="text-lg font-bold text-[#ff3d00] mt-1">
                    {event.date.toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <JoinEventForm slug={event.slug} />
              </>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="border-b-[3px] border-[#111] pb-4">
                  <h2 className="text-3xl font-extrabold uppercase">Get started</h2>
                  <p className="text-lg font-bold text-[#111] mt-2">
                    No events are live on this install yet. Organizers can sign in
                    and create one — attendees join from the event link or QR
                    code their organizer shares.
                  </p>
                </div>
                <div className="brutal-box bg-[#ffd200] p-5 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111] flex flex-col gap-3">
                  <p className="text-base font-extrabold uppercase tracking-widest">
                    Running an event?
                  </p>
                  <p className="text-base font-bold text-[#111]">
                    Sign in or create an organizer account, then create your
                    first event in the workspace.
                  </p>
                  <Link
                    href="/signin"
                    className="inline-flex w-fit min-h-10 items-center brutal-box bg-[#ff3d00] px-5 py-2 text-base font-black uppercase tracking-wider text-white hover:bg-[#111] transition-colors border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]"
                  >
                    Sign in to your workspace
                  </Link>
                </div>
                <p className="text-base font-bold text-[#111]">
                  Attending? Open the join link or scan the QR code from your
                  organizer — you don&apos;t need anything on this page.
                </p>
              </div>
            )}
            <div className="mt-2 pt-4 border-t-[3px] border-[#111]">
              {event &&
                <p className="text-base font-bold text-[#111]">
                  Organizer?{" "}
                  <Link
                    href="/signin"
                    className="underline text-[#111] hover:text-white hover:bg-[#ff3d00] bg-[#ffd200] px-1 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111] transition-colors"
                  >
                    Sign in to your workspace
                  </Link>
                </p>
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
