/* eslint-disable @typescript-eslint/no-explicit-any */
import { suiClient, PACKAGE_ID } from "./sui";

export type Milestone = {
  title: string;
  endDate?: number; // ms
  percent: number; // 0..100
};

export type UIProject = {
  id: string; // Sui object id
  title: string;
  description: string;
  image?: string | null;
  link?: string | null;
  fundingGoal: number; // SUI (not Mist)
  currentFunding: number; // SUI (not Mist)
  status: string; // derived label
  milestoneIndex: number;
  milestones: Milestone[];
  createdDate: number; // ms (use funding_start)
  fundingDeadline?: number; // ms
  closeOnFundingGoal?: boolean;
  creator?: string;
  sharedInitialVersion?: string | null;
  objectVersion?: string | null;
  objectDigest?: string | null;
  backers?: number; // optional if you later compute from events
  longDescription?: string;
  category?: string | null;
};

const MIST_PER_SUI = 1_000_000_000n;

// Robust URL extractor for sui::url::Url which may serialize differently
function parseUrl(u: any): string | null {
  if (!u) return null;
  if (typeof u === "string") return u;
  if (typeof u.url === "string") return u.url;
  // Sometimes parsed as { fields: { url: "..." } }
  if (u.fields?.url) return String(u.fields.url);
  // Sometimes as bytes vector: { url: { bytes: "..." } }
  if (u.url?.bytes) {
    try {
      if (typeof Buffer !== "undefined") {
        return Buffer.from(u.url.bytes, "base64").toString("utf8");
      }
      if (typeof atob === "function") {
        const decoded = atob(u.url.bytes);
        return decodeURIComponent(escape(decoded));
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

function fromMistToSui(n: any): number {
  // Move u64 may arrive as number or string; coerce to BigInt safely.
  const bi = typeof n === "bigint" ? n : BigInt(String(n));
  // convert to JS number (losing sub-sui precision, fine for UI)
  return Number(bi) / Number(MIST_PER_SUI);
}

function statusLabel(s: number): string {
  // matches your config module semantics
  switch (s) {
    case 0:
      return "inactive";
    case 1:
      return "funding";
    case 2:
      return "active";
    case 3:
      return "voting";
    case 4:
      return "failed";
    case 5:
      return "rejected";
    case 6:
      return "closed";
    default:
      return `status_${s}`;
  }
}

function mapProject(o: any): UIProject | null {
  const content = o.data?.content ?? o.content; // works for getObject and queryObjects
  if (!content || content.dataType !== "moveObject") return null;
  const f = content.fields as any;

  const msRaw: any[] = Array.isArray(f.milestones)
    ? f.milestones.map((m) => (m?.fields ? m.fields : m))
    : [];
  const milestones: Milestone[] = msRaw.map((m) => ({
    title: m.title ?? m.name ?? "",
    endDate: m.deadline ? Number(m.deadline) : undefined,
    percent: Number(m.release_percentage ?? m.releasePercentage ?? 0),
  }));

  const owner = (o.data?.owner ?? (o as any).owner) as any;
  const sharedInitialVersion = owner?.Shared?.initial_shared_version
    ? String(owner.Shared.initial_shared_version)
    : null;
  const objectVersion = o.data?.version ?? (o as any).version ?? null;
  const objectDigest = o.data?.digest ?? (o as any).digest ?? null;
  const creator = f.creator ? String(f.creator) : undefined;

  return {
    id: o.data?.objectId || o.objectId,
    title: f.title,
    description: f.description,
    image: parseUrl(f.image_url),
    link: parseUrl(f.link),
    fundingGoal: fromMistToSui(f.funding_goal ?? 0),
    currentFunding: fromMistToSui(f.total_raised ?? 0),
    status: statusLabel(Number(f.status ?? 0)),
    milestoneIndex: Number(f.milestone_index ?? 0),
    milestones,
    createdDate: Number(f.funding_start ?? Date.now()),
    fundingDeadline: f.funding_deadline ? Number(f.funding_deadline) : undefined,
    closeOnFundingGoal: Boolean(f.close_on_funding_goal ?? false),
    creator,
    sharedInitialVersion,
    objectVersion: objectVersion ? String(objectVersion) : null,
    objectDigest: objectDigest ? String(objectDigest) : null,
    backers: undefined, // you can compute from Funded events later
    longDescription: f.description,
    category: null,
  };
}

// Fetch ONE project by object id (recommended for detail page)
export async function getProjectServer(
  objectId: string,
): Promise<UIProject | null> {
  const res = await suiClient.getObject({
    id: objectId,
    options: { showContent: true, showType: true, showOwner: true },
  });
  if ((res as any).error) return null;
  return mapProject(res);
}

async function queryProjectsVia(
  queryFn: (args: {
    filter: { StructType: string };
    options: { showContent: boolean; showType: boolean; showOwner: boolean };
    cursor?: string | null;
    limit?: number;
  }) => Promise<any>,
): Promise<UIProject[]> {
  const out: UIProject[] = [];
  let cursor: string | null = null;

  do {
    const res = await queryFn({
      filter: { StructType: `${PACKAGE_ID}::project::Project` },
      options: { showContent: true, showType: true, showOwner: true },
      cursor: cursor ?? null,
      limit: 50,
    });

    for (const o of res?.data ?? []) {
      const mapped = mapProject(o);
      if (mapped) out.push(mapped);
    }
    cursor = res?.hasNextPage ? res?.nextCursor ?? null : null;
  } while (cursor);

  return out;
}


async function hydrateProjectsByIds(ids: string[]): Promise<UIProject[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return [];
  }

  const projects: UIProject[] = [];
  for (let i = 0; i < uniqueIds.length; i += 50) {
    const chunk = uniqueIds.slice(i, i + 50);
    const objects = await suiClient.multiGetObjects({
      ids: chunk,
      options: { showContent: true, showType: true, showOwner: true },
    });

    for (const obj of objects ?? []) {
      if ((obj as any)?.error) continue;
      const mapped = mapProject(obj);
      if (mapped) {
        projects.push(mapped);
      }
    }
  }

  return projects;
}

async function collectProjectIdsFromEvents(): Promise<string[]> {
  const eventType = `${PACKAGE_ID}::project::ProjectCreatedEvent`;
  const projectIds: string[] = [];
  let cursor: string | null = null;

  try {
    do {
      const res = await suiClient.queryEvents({
        query: { MoveEventType: eventType },
        cursor: cursor ?? undefined,
        limit: 50,
      });

      for (const evt of res.data ?? []) {
        const parsed = (evt as any).parsedJson ?? {};
        const candidate =
          parsed.project_id ??
          parsed.projectId ??
          parsed.projectID ??
          parsed.id ??
          null;

        let id: string | null = null;
        if (typeof candidate === 'string') {
          id = candidate;
        } else if (candidate?.id) {
          id = String(candidate.id);
        } else if (candidate?.fields?.id) {
          id = String(candidate.fields.id);
        }

        if (id) {
          projectIds.push(id);
        }
      }
      cursor = res.hasNextPage ? (res.nextCursor ?? null) : null;
    } while (cursor);
  } catch (error) {
    console.warn('⚠️ queryEvents fallback failed', error);
  }

  return projectIds;
}

async function collectProjectIdsFromTransactions(): Promise<string[]> {
  const ids: string[] = [];
  let cursor: string | null = null;

  try {
    do {
      const res = await suiClient.queryTransactionBlocks({
        filter: {
          MoveFunction: {
            package: PACKAGE_ID,
            module: 'project',
            function: 'create_project',
          },
        },
        cursor: cursor ?? undefined,
        limit: 20,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: false,
          showInput: false,
        },
      });

      for (const tx of res.data ?? []) {
        const changes = (tx as any).objectChanges ?? (tx as any).effects?.objectChanges ?? [];
        for (const change of changes ?? []) {
          if (change?.type === 'created' && typeof change.objectType === 'string') {
            if (change.objectType.includes('::project::Project')) {
              ids.push(change.objectId);
            }
          }
        }
      }

      cursor = res.hasNextPage ? (res.nextCursor ?? null) : null;
    } while (cursor);
  } catch (error) {
    console.warn('⚠️ queryTransactionBlocks fallback failed', error);
  }

  return ids;
}

// Fetch ALL projects of this package (for listing page)
export async function getProjectsServer(): Promise<UIProject[]> {
  const fn: any = (suiClient as any).queryObjects;

  if (typeof fn === "function") {
    return await queryProjectsVia((args) => fn.call(suiClient, args));
  }

  const transport: any = (suiClient as any).transport;
  if (transport?.request) {
    const rpcQuery = async (args: any) => {
      return transport.request({
        method: "suix_queryObjects",
        params: [args],
      });
    };

    try {
      return await queryProjectsVia(rpcQuery);
    } catch (error) {
      console.warn("⚠️ suix_queryObjects fallback failed", error);
    }
  }

  // Fallback path for environments where queryObjects is unavailable
  const ids = new Set<string>();

  const eventIds = await collectProjectIdsFromEvents();
  eventIds.forEach((id) => ids.add(id));

  if (ids.size === 0) {
    const txIds = await collectProjectIdsFromTransactions();
    txIds.forEach((id) => ids.add(id));
  }

  if (ids.size === 0) {
    return [];
  }

  return await hydrateProjectsByIds(Array.from(ids));
}

export function percentFunded(p: UIProject): number {
  if (!p.fundingGoal) return 0;
  return Math.max(0, Math.min(100, (p.currentFunding / p.fundingGoal) * 100));
}
