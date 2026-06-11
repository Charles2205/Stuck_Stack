-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "date" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Attendee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'ATTENDEE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Blocker" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Blocker_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Blocker_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Attendee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "StuckToo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockerId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StuckToo_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "Blocker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StuckToo_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "Attendee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HelpOffer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blockerId" TEXT NOT NULL,
    "helperId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OFFERED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HelpOffer_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "Blocker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HelpOffer_helperId_fkey" FOREIGN KEY ("helperId") REFERENCES "Attendee" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HelpSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "helpOfferId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "location" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 5,
    CONSTRAINT "HelpSlot_helpOfferId_fkey" FOREIGN KEY ("helpOfferId") REFERENCES "HelpOffer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_BlockerToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_BlockerToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Blocker" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_BlockerToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Attendee_eventId_idx" ON "Attendee"("eventId");

-- CreateIndex
CREATE INDEX "Blocker_eventId_status_idx" ON "Blocker"("eventId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StuckToo_blockerId_attendeeId_key" ON "StuckToo"("blockerId", "attendeeId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpOffer_blockerId_helperId_key" ON "HelpOffer"("blockerId", "helperId");

-- CreateIndex
CREATE UNIQUE INDEX "HelpSlot_helpOfferId_key" ON "HelpSlot"("helpOfferId");

-- CreateIndex
CREATE UNIQUE INDEX "_BlockerToTag_AB_unique" ON "_BlockerToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_BlockerToTag_B_index" ON "_BlockerToTag"("B");
