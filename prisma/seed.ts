/**
 * Seeds "GitNation Conf 2026" with realistic blockers so the demo script
 * works from a clean clone. Wipes existing data first (safe: dev-only DB).
 *
 * Demo-critical shapes:
 *  - "RAG vs fine-tuning" with 8 stuck-too / 2 helpers (the hero card)
 *  - 4 OPEN "AI Deployment" blockers with helpers -> clinic suggestion fires
 *  - 3 OPEN "RAG" blockers with helpers -> "RAG Help Desk" suggestion
 *  - one MATCHED blocker (claimed slot) and one SOLVED for board variety
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  "AI/LLMs",
  "RAG",
  "AI Deployment",
  "DevOps",
  "Next.js",
  "Databases",
  "Pitching",
] as const;

type SeedBlocker = {
  title: string;
  description: string;
  author: string;
  tags: string[];
  status: "OPEN" | "MATCHED" | "SOLVED";
  stuckToo: string[]; // attendee names
  helpers: string[]; // attendee names with an open/claimed offer
};

const ATTENDEES = [
  "Maya Chen",
  "Tom Okafor",
  "Lena Fischer",
  "Ravi Patel",
  "Sofia Martins",
  "Jonas Berg",
  "Aisha Bello",
  "Pedro Alves",
  "Hana Kim",
  "Marco Rossi",
  "Ines Dubois",
  "Felix Wagner",
  "Nadia Haddad",
  "Oliver Stone",
];

const BLOCKERS: SeedBlocker[] = [
  {
    title: "I don't understand when to use RAG vs fine-tuning",
    description:
      "Building a support assistant over our product docs. Everyone says something different — when is retrieval enough and when do I actually need to fine-tune? What are the cost/quality trade-offs?",
    author: "Maya Chen",
    tags: ["AI/LLMs", "RAG"],
    status: "OPEN",
    stuckToo: [
      "Tom Okafor",
      "Lena Fischer",
      "Ravi Patel",
      "Sofia Martins",
      "Jonas Berg",
      "Aisha Bello",
      "Pedro Alves",
      "Hana Kim",
    ],
    helpers: ["Marco Rossi", "Ines Dubois"],
  },
  {
    title: "How do I evaluate my RAG pipeline without ground-truth answers?",
    description:
      "We shipped a RAG chatbot but have no idea if retrieval is actually good. No labelled dataset. How do people measure faithfulness and retrieval quality in practice?",
    author: "Tom Okafor",
    tags: ["RAG", "AI/LLMs"],
    status: "OPEN",
    stuckToo: [
      "Maya Chen",
      "Lena Fischer",
      "Felix Wagner",
      "Nadia Haddad",
      "Hana Kim",
      "Pedro Alves",
    ],
    helpers: ["Ines Dubois"],
  },
  {
    title: "Chunking strategy for RAG over PDFs is producing garbage",
    description:
      "Tables and multi-column PDFs get shredded by naive chunking, so retrieval returns nonsense fragments. What chunking/parsing setup actually works for messy PDFs?",
    author: "Felix Wagner",
    tags: ["RAG"],
    status: "OPEN",
    stuckToo: ["Sofia Martins", "Jonas Berg"],
    helpers: ["Marco Rossi"],
  },
  {
    title: "My Docker container works locally but fails on deploy",
    description:
      "Image builds and runs fine on my machine, crashes with exit code 139 on the cloud runner. Same Dockerfile. I've lost a day on this.",
    author: "Lena Fischer",
    tags: ["DevOps"],
    status: "OPEN",
    stuckToo: [
      "Ravi Patel",
      "Pedro Alves",
      "Nadia Haddad",
      "Oliver Stone",
      "Tom Okafor",
    ],
    helpers: ["Jonas Berg"],
  },
  {
    title: "LLM endpoint times out under load on serverless",
    description:
      "Our model proxy runs fine for one user, but during a demo with ~30 concurrent users every request starts timing out. Where do I even start?",
    author: "Ravi Patel",
    tags: ["AI Deployment", "DevOps"],
    status: "OPEN",
    stuckToo: ["Maya Chen", "Felix Wagner", "Hana Kim"],
    helpers: ["Marco Rossi"],
  },
  {
    title: "GPU costs exploding when self-hosting open-source models",
    description:
      "Moved from an API to self-hosted Llama for cost reasons — and now the GPU bill is worse. Batching? Quantisation? Spot instances? What actually moves the needle?",
    author: "Sofia Martins",
    tags: ["AI Deployment"],
    status: "OPEN",
    stuckToo: ["Jonas Berg", "Ravi Patel", "Aisha Bello", "Oliver Stone"],
    helpers: ["Ines Dubois"],
  },
  {
    title: "How do I version and roll back prompt + model combos in prod?",
    description:
      "A prompt tweak silently degraded answers for two days. I want deploys/rollbacks for the prompt+model+params bundle, like we have for code.",
    author: "Aisha Bello",
    tags: ["AI Deployment", "AI/LLMs"],
    status: "OPEN",
    stuckToo: ["Maya Chen", "Sofia Martins"],
    helpers: [],
  },
  {
    title: "Streaming LLM responses break behind our reverse proxy",
    description:
      "Token streaming works in dev, but in production behind nginx the response arrives in one blob at the end. Buffering settings? SSE config? Help.",
    author: "Pedro Alves",
    tags: ["AI Deployment", "DevOps"],
    status: "OPEN",
    stuckToo: ["Tom Okafor", "Felix Wagner"],
    helpers: ["Jonas Berg"],
  },
  {
    title: "Next.js hydration mismatch errors I can't trace",
    description:
      "Random 'text content does not match server-rendered HTML' errors that only show in production. No obvious date/locale rendering. How do people debug these systematically?",
    author: "Hana Kim",
    tags: ["Next.js"],
    status: "MATCHED",
    stuckToo: ["Pedro Alves", "Nadia Haddad", "Oliver Stone"],
    helpers: ["Felix Wagner"],
  },
  {
    title: "Postgres connection pool exhausted on serverless",
    description:
      "Every traffic spike kills the app with 'too many connections'. PgBouncer? Driver-level pooling? A different serverless driver? What's the 2026 answer?",
    author: "Jonas Berg",
    tags: ["Databases", "DevOps"],
    status: "OPEN",
    stuckToo: ["Lena Fischer", "Ravi Patel", "Hana Kim", "Maya Chen"],
    helpers: ["Oliver Stone", "Marco Rossi"],
  },
  {
    title: "Server vs client components — where does data fetching go?",
    description:
      "I keep fetching in client components out of habit and my app waterfalls. What's the right mental model for where data loading lives in the App Router?",
    author: "Nadia Haddad",
    tags: ["Next.js"],
    status: "OPEN",
    stuckToo: ["Hana Kim", "Sofia Martins"],
    helpers: [],
  },
  {
    title: "How do I pitch a dev-tool to non-technical judges?",
    description:
      "Our product is genuinely useful but the demo is just terminals and YAML. How do I make judges who've never deployed anything care in 3 minutes?",
    author: "Marco Rossi",
    tags: ["Pitching"],
    status: "SOLVED",
    stuckToo: ["Aisha Bello", "Felix Wagner", "Nadia Haddad"],
    helpers: ["Ines Dubois"],
  },
  {
    title: "Choosing between Prisma and Drizzle for a new project",
    description:
      "Greenfield TypeScript app. Everyone on the team has a different opinion. What actually matters for this decision beyond vibes?",
    author: "Ines Dubois",
    tags: ["Databases"],
    status: "OPEN",
    stuckToo: ["Oliver Stone"],
    helpers: [],
  },
];

async function main() {
  // Wipe in dependency order (cascades handle children, but be explicit).
  await prisma.helpSlot.deleteMany();
  await prisma.helpOffer.deleteMany();
  await prisma.stuckToo.deleteMany();
  await prisma.blocker.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.attendee.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();

  const organizer = await prisma.organizer.create({
    data: { name: "Demo Organizer", nameKey: "demo organizer" },
  });

  const event = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      name: "GitNation Conf 2026",
      slug: "gitnation-2026",
      date: new Date("2026-06-11T09:00:00Z"),
    },
  });

  await prisma.attendee.create({
    data: { eventId: event.id, name: "Olive (Organiser)", role: "ORGANISER" },
  });

  const attendeeByName = new Map<string, string>();
  for (const name of ATTENDEES) {
    const a = await prisma.attendee.create({
      data: { eventId: event.id, name },
    });
    attendeeByName.set(name, a.id);
  }

  for (const tag of TAGS) {
    await prisma.tag.create({ data: { name: tag } });
  }

  const id = (name: string): string => {
    const found = attendeeByName.get(name);
    if (!found) throw new Error(`Unknown seed attendee: ${name}`);
    return found;
  };

  let createdAt = new Date(Date.now() - BLOCKERS.length * 9 * 60_000);
  for (const b of BLOCKERS) {
    createdAt = new Date(createdAt.getTime() + 9 * 60_000);
    const blocker = await prisma.blocker.create({
      data: {
        eventId: event.id,
        authorId: id(b.author),
        title: b.title,
        description: b.description,
        status: b.status,
        createdAt,
        tags: { connect: b.tags.map((name) => ({ name })) },
      },
    });

    for (const name of b.stuckToo) {
      await prisma.stuckToo.create({
        data: { blockerId: blocker.id, attendeeId: id(name) },
      });
    }

    for (const [i, name] of b.helpers.entries()) {
      const isClaimed = b.status === "MATCHED" && i === 0;
      const isCompleted = b.status === "SOLVED" && i === 0;
      const offer = await prisma.helpOffer.create({
        data: {
          blockerId: blocker.id,
          helperId: id(name),
          status: isClaimed ? "CLAIMED" : isCompleted ? "COMPLETED" : "OFFERED",
        },
      });
      if (isClaimed || isCompleted) {
        await prisma.helpSlot.create({
          data: {
            helpOfferId: offer.id,
            startTime: new Date(Date.now() + 30 * 60_000),
            location: "Help Desk — Table 1",
            durationMinutes: 5,
          },
        });
      }
    }
  }

  const counts = {
    attendees: await prisma.attendee.count(),
    blockers: await prisma.blocker.count(),
    stuckToos: await prisma.stuckToo.count(),
    helpOffers: await prisma.helpOffer.count(),
  };
  console.log(
    `Seeded "${event.name}" (${event.slug}) owned by "${organizer.name}":`,
    counts,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
