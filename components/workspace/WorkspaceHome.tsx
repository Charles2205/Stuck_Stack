"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@progress/kendo-react-buttons";
import { Badge } from "@progress/kendo-react-indicators";
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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {organizer.name}
          </h1>
          <p className="text-sm text-slate-500">
            Your events and their live stats.
          </p>
        </div>
        <div className="flex gap-2">
          <Button themeColor="primary" onClick={() => setShowCreate(true)}>
            + Create event
          </Button>
          <Button fillMode="outline" onClick={handleSignOut}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {(events ?? []).map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="!text-base !font-semibold">
                {event.name}
              </CardTitle>
              <CardSubtitle className="!text-xs">
                {new Date(event.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · /event/{event.slug}
              </CardSubtitle>
            </CardHeader>
            <CardBody className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  Blockers
                  <Badge
                    themeColor="info"
                    rounded="full"
                    size="small"
                    position="inside"
                    cutoutBorder={false}
                  >
                    {event.counts.blockers}
                  </Badge>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Open
                  <Badge
                    themeColor="error"
                    rounded="full"
                    size="small"
                    position="inside"
                    cutoutBorder={false}
                  >
                    {event.counts.open}
                  </Badge>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Solved
                  <Badge
                    themeColor="success"
                    rounded="full"
                    size="small"
                    position="inside"
                    cutoutBorder={false}
                  >
                    {event.counts.solved}
                  </Badge>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  Attendees
                  <Badge
                    themeColor="secondary"
                    rounded="full"
                    size="small"
                    position="inside"
                    cutoutBorder={false}
                  >
                    {event.counts.attendees}
                  </Badge>
                </span>
              </div>
            </CardBody>
            <CardActions className="flex flex-wrap gap-2">
              <Link href={`/event/${event.slug}`}>
                <Button size="small">Open board</Button>
              </Link>
              <Link href={`/event/${event.slug}/organiser`}>
                <Button size="small" themeColor="primary">
                  Dashboard
                </Button>
              </Link>
              <Button size="small" fillMode="outline" onClick={() => setEditEvent(event)}>
                Edit
              </Button>
              <Button
                size="small"
                fillMode="outline"
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
