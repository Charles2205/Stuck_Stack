"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";

import {
  Card,
  CardActions,
  CardBody,
  CardHeader,
  CardSubtitle,
  CardTitle,
} from "@progress/kendo-react-layout";
import { postJson } from "@/lib/hooks/fetcher";
import { useWorkspaceEvents } from "@/lib/hooks/useWorkspaceEvents";
import type { OrganizerDTO, WorkspaceEventDTO } from "@/lib/types";
import { DeleteEventDialog } from "./DeleteEventDialog";
import { EventFormDialog } from "./EventFormDialog";

export function WorkspaceHome({ organizer }: { organizer: OrganizerDTO }) {
  const router = useRouter();
  const { events, isLoading, mutate } = useWorkspaceEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [editEvent, setEditEvent] = useState<WorkspaceEventDTO | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<WorkspaceEventDTO | null>(
    null,
  );

  async function handleSignOut() {
    await postJson("/api/auth/signout");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
        <div className="brutal-box bg-[#ffd200] p-6 border-[4px] border-[#111] shadow-[8px_8px_0px_0px_#111] -rotate-1">
          <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter drop-shadow-[2px_2px_0px_#fff]">
            Welcome back, <br className="hidden md:block"/> <span className="bg-white px-2 mt-2 inline-block border-[3px] border-[#111]">{organizer.name}</span>
          </h1>
          <p className="text-base font-bold text-[#111] mt-3">
            Your events and their live stats.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 rotate-1">
          <Button themeColor="primary" size="large" onClick={() => setShowCreate(true)}>
            + Create event
          </Button>
          <Button size="large" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      {isLoading && !events && (
        <p className="text-slate-500">Loading your events…</p>
      )}

      {events && events.length === 0 && (
        <p className="text-slate-500">
          No events yet — create your first one.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(events ?? []).map((event) => (
          <Card key={event.id} className="!border-[4px] !border-[#111] !shadow-[8px_8px_0px_0px_#111] hover:!shadow-[4px_4px_0px_0px_#111] hover:!translate-x-1 hover:!translate-y-1 transition-all bg-white">
            <CardHeader className="bg-[#00e5ff] border-b-[4px] border-[#111] p-4">
              <CardTitle className="!text-2xl !font-black !uppercase !tracking-tighter">
                {event.name}
              </CardTitle>
              <CardSubtitle className="!text-sm !font-bold !text-[#111] mt-2 bg-white px-2 py-1 border-[2px] border-[#111] w-fit">
                {new Date(event.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · /event/{event.slug}
              </CardSubtitle>
            </CardHeader>
            <CardBody className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm font-black uppercase tracking-widest text-[#111]">
                <div className="flex items-center justify-between border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
                  <span>Blockers</span>
                  <span className="bg-[#00e5ff] text-[#111] px-2 py-0.5 border-2 border-[#111]">{event.counts.blockers}</span>
                </div>
                <div className="flex items-center justify-between border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
                  <span>Open</span>
                  <span className="bg-[#ff3d00] text-white px-2 py-0.5 border-2 border-[#111]">{event.counts.open}</span>
                </div>
                <div className="flex items-center justify-between border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
                  <span>Solved</span>
                  <span className="bg-[#00e676] text-[#111] px-2 py-0.5 border-2 border-[#111]">{event.counts.solved}</span>
                </div>
                <div className="flex items-center justify-between border-[3px] border-[#111] px-2 py-1 shadow-[2px_2px_0px_0px_#111]">
                  <span>Attendees</span>
                  <span className="bg-[#ffd200] text-[#111] px-2 py-0.5 border-2 border-[#111]">{event.counts.attendees}</span>
                </div>
              </div>
            </CardBody>
            <CardActions className="flex flex-wrap gap-4 p-4 bg-[#fffbef] border-t-[4px] border-[#111]">
              <Link href={`/event/${event.slug}`} className="flex flex-1 min-w-[120px]">
                <Button className="w-full h-full">Open board</Button>
              </Link>
              <Link href={`/event/${event.slug}/organiser`} className="flex flex-1 min-w-[120px]">
                <Button themeColor="primary" className="w-full h-full">Dashboard</Button>
              </Link>
              <Button className="flex-1 min-w-[100px]" onClick={() => setEditEvent(event)}>Edit</Button>
              <Button
                className="flex-1 min-w-[100px]"
                themeColor="error"
                onClick={() => setDeleteEvent(event)}
              >
                Delete
              </Button>
            </CardActions>
          </Card>
        ))}
      </div>

      {showCreate && (
        <EventFormDialog
          onClose={() => setShowCreate(false)}
          onSaved={() => mutate()}
        />
      )}
      {editEvent && (
        <EventFormDialog
          event={editEvent}
          onClose={() => setEditEvent(null)}
          onSaved={() => mutate()}
        />
      )}
      {deleteEvent && (
        <DeleteEventDialog
          event={deleteEvent}
          onClose={() => setDeleteEvent(null)}
          onDeleted={() => mutate()}
        />
      )}
    </div>
  );
}
