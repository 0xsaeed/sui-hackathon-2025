export type Milestone = {
  title: string
  percent: number
  endDate: string
}

export type Project = {
  id: number
  name: string
  description: string
  status: "live" | "active" | "funded"
  createdDate: string
  fundingGoal: number
  currentFunding: number
  backers: number
  timeLeft: string
  milestones?: Milestone[]
}

export const DEFAULT_CATEGORIES = [
  "All",
  "DeFi",
  "NFTs",
  "Gaming",
  "Sustainability",
  "AI/ML",
  "Social",
] as const

export const SEED_PROJECTS: Project[] = [
  {
    id: 1,
    name: "SUI DeFi Aggregator",
    description: "A meta‑yield protocol that routes liquidity across leading Sui DEXs and lending markets. Vault strategies auto‑compound rewards, rebalance positions, and optimize fees using on‑chain execution. The protocol shares performance fees with backers and governance token holders.",
    status: "active",
    createdDate: "2024-07-08",
    fundingGoal: 15000,
    currentFunding: 12500,
    backers: 47,
    timeLeft: "12 days",
    milestones: [
      { title: "Vault beta on testnet", percent: 25, endDate: "2024-07-20" },
      { title: "Audit + mainnet launch", percent: 60, endDate: "2024-08-10" },
      { title: "Strategy marketplace", percent: 100, endDate: "2024-09-01" },
    ],
  },
  {
    id: 2,
    name: "NFT Creator Studio",
    description: "A creator‑first toolkit for generative and 1/1 drops on Sui. Artists can design with AI assists, schedule mints, create allowlists, and launch storefronts. Royalties are enforced on‑chain with open marketplace adapters.",
    status: "funded",
    createdDate: "2024-05-20",
    fundingGoal: 8000,
    currentFunding: 8500,
    backers: 32,
    timeLeft: "Completed",
    milestones: [
      { title: "AI model integration", percent: 40, endDate: "2024-05-01" },
      { title: "Mint launch", percent: 80, endDate: "2024-05-15" },
      { title: "Marketplace adapters", percent: 100, endDate: "2024-05-20" },
    ],
  },
  {
    id: 3,
    name: "Sustainable Energy Tracker",
    description: "Enterprises, producers, and auditors issue verifiable renewable‑energy certificates on Sui. Credits are tokenized, tradable, and retired with public attestations. Tooling includes IoT oracles, validator dashboards, and APIs for ESG reporting.",
    status: "live",
    createdDate: "2024-06-15",
    fundingGoal: 20000,
    currentFunding: 18500,
    backers: 73,
    timeLeft: "8 days",
    milestones: [
      { title: "IoT oracle prototype", percent: 30, endDate: "2024-06-25" },
      { title: "Credit marketplace", percent: 70, endDate: "2024-07-20" },
      { title: "ESG dashboards", percent: 100, endDate: "2024-08-10" },
    ],
  },
  {
    id: 4,
    name: "On‑chain Gaming SDK",
    description: "A TypeScript + Move SDK that makes it trivial to compose on‑chain game loops, items, and marketplaces. Comes with Unity/Unreal bindings, signer abstractions, and battle‑tested templates for PvP and PvE titles.",
    status: "active",
    createdDate: "2024-06-11",
    fundingGoal: 12000,
    currentFunding: 5400,
    backers: 21,
    timeLeft: "18 days",
    milestones: [
      { title: "Unity bindings", percent: 30, endDate: "2024-06-20" },
      { title: "Example PvP template", percent: 70, endDate: "2024-07-15" },
      { title: "Mainnet demo", percent: 100, endDate: "2024-08-05" },
    ],
  },
  {
    id: 5,
    name: "AI Strategy Vaults",
    description: "Research‑grade ML signals power delta‑neutral and momentum strategies on perpetual venues. Vaults execute with risk limits, circuit breakers, and transparent performance. Backers earn a share of fees and performance carry.",
    status: "active",
    createdDate: "2024-06-28",
    fundingGoal: 22000,
    currentFunding: 9100,
    backers: 36,
    timeLeft: "22 days",
    milestones: [
      { title: "Signal research", percent: 25, endDate: "2024-07-05" },
      { title: "Delta-neutral strat", percent: 60, endDate: "2024-07-28" },
      { title: "Risk engine v1", percent: 100, endDate: "2024-08-20" },
    ],
  },
  {
    id: 6,
    name: "Impact Grants",
    description: "A quadratic‑funding style grants platform. Applicants submit lightweight proposals; community attestations and matching pools determine allocations. Milestones release funds and on‑chain attestations track delivery.",
    status: "live",
    createdDate: "2024-07-01",
    fundingGoal: 10000,
    currentFunding: 6200,
    backers: 40,
    timeLeft: "10 days",
    milestones: [
      { title: "Attestations MVP", percent: 35, endDate: "2024-07-10" },
      { title: "Matching pools", percent: 70, endDate: "2024-07-28" },
      { title: "Milestone disbursements", percent: 100, endDate: "2024-08-15" },
    ],
  },
]

// Server-side loader (build-time or RSC): uses PROJECTS_API if provided
export async function getProjectsServer(): Promise<Project[]> {
  const api = process.env.PROJECTS_API
  if (api) {
    try {
      const res = await fetch(api, { next: { revalidate: 60 } })
      if (!res.ok) throw new Error(`Failed ${res.status}`)
      const json = (await res.json()) as Project[]
      return json?.length ? json : SEED_PROJECTS
    } catch (e) {
      return SEED_PROJECTS
    }
  }
  return SEED_PROJECTS
}

// Client-side loader: uses NEXT_PUBLIC_PROJECTS_API if provided, else seeds
export async function getProjectsClient(): Promise<Project[]> {
  const api = process.env.NEXT_PUBLIC_PROJECTS_API
  if (api) {
    try {
      const res = await fetch(api)
      if (!res.ok) throw new Error(`Failed ${res.status}`)
      const json = (await res.json()) as Project[]
      return json?.length ? json : SEED_PROJECTS
    } catch (e) {
      return SEED_PROJECTS
    }
  }
  return SEED_PROJECTS
}

export function percentFunded(p: Project) {
  return Math.min((p.currentFunding / p.fundingGoal) * 100, 100)
}

export type SortKey = "trending" | "newest" | "ending"

export function sortProjects(list: Project[], sort: SortKey): Project[] {
  const copy = [...list]
  const toDays = (p: Project) => {
    const m = /([0-9]+)/.exec(p.timeLeft)
    return m ? parseInt(m[1], 10) : Number.POSITIVE_INFINITY
  }
  switch (sort) {
    case "trending":
      // Rank by percent funded, then backers
      return copy.sort((a, b) => percentFunded(b) - percentFunded(a) || b.backers - a.backers)
    case "newest":
      return copy.sort((a, b) => +new Date(b.createdDate) - +new Date(a.createdDate))
    case "ending":
      return copy.sort((a, b) => toDays(a) - toDays(b))
    default:
      return copy
  }
}
