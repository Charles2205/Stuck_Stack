import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/workspace/SignInForm";
import { getCurrentOrganizer } from "@/lib/organizerSession";

export default async function SignInPage() {
  const organizer = await getCurrentOrganizer();
  if (organizer) redirect("/workspace");

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold tracking-widest uppercase text-indigo-600">
            Stuck Stack
          </p>
          <h1 className="text-3xl font-bold mt-2">Organizer sign in</h1>
          <p className="text-slate-600 mt-2">
            One name, no password — hackathon rules. Your events live in your
            workspace.
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <SignInForm />
        </div>
        <p className="text-sm text-slate-500">
          Attending instead?{" "}
          <Link href="/" className="underline">
            Join the event here
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
