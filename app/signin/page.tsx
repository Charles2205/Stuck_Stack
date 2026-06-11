import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/workspace/SignInForm";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export default async function SignInPage() {
  const organizer = await getCurrentOrganizer();
  if (organizer) redirect("/workspace");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16 bg-[#fffbef]">
      <div className="max-w-md w-full flex flex-col gap-6 relative z-10">
        <div className="brutal-box bg-[#00e5ff] border-[4px] border-[#111] p-6 shadow-[8px_8px_0px_0px_#111] -rotate-1 mb-4">
          <p className="text-sm font-extrabold tracking-widest uppercase text-[#111] bg-white border-2 border-[#111] w-fit px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
            Stuck Stack
          </p>
          <h1 className="text-4xl font-black mt-4 uppercase tracking-tighter drop-shadow-[2px_2px_0px_#fff]">Organizer sign in</h1>
          <p className="text-lg font-bold text-[#111] mt-3 bg-white p-2 border-[3px] border-[#111] shadow-[4px_4px_0px_0px_#111]">
            One name, no password — hackathon rules. Your events live in your
            workspace.
          </p>
        </div>
        <div className="brutal-box border-[4px] border-[#111] bg-white p-8 shadow-[8px_8px_0px_0px_#111]">
          <SignInForm />
        </div>
        <p className="text-base font-bold text-[#111] bg-[#ffd200] border-[3px] border-[#111] p-3 shadow-[4px_4px_0px_0px_#111] w-fit mx-auto mt-4 rotate-1">
          Attending instead?{" "}
          <Link href="/" className="underline decoration-2 underline-offset-2 hover:text-white hover:bg-[#ff3d00] transition-colors">
            Join the event here
          </Link>
        </p>
      </div>
    </main>
  );
}
