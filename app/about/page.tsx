import { Header } from "@/components/header";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="home-scope">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-32 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/icon0.svg"
              alt="MatryoFund Logo"
              width={120}
              height={120}
              className="dark:invert"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">MatryoFund</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Milestone-Based Crowdfunding on Sui
          </p>
          <p className="text-lg text-muted-foreground italic">
            (Matryoshka + Funding)
          </p>
          <p className="text-lg text-muted-foreground italic">
            Team Members: Soodoo, Mostafa, Moein
          </p>
        </div>

        {/* Overview Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📌 Overview</h2>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <p className="text-lg mb-4">
              MatryoFund is a{" "}
              <strong>decentralized crowdfunding platform</strong> built on the{" "}
              <strong>Sui blockchain</strong>. Unlike traditional platforms
              where project creators can withdraw all funds immediately,
              MatryoFund introduces a{" "}
              <strong>milestone-based escrow system</strong>:
            </p>
            <ul className="space-y-2 mb-6">
              <li>
                Backers fund projects using <strong>SUI</strong>.
              </li>
              <li>
                Each contribution mints a <strong>Pledge NFT</strong>, which
                represents the backer&apos;s stake.
              </li>
              <li>
                Funds are stored in a <strong>project vault (escrow)</strong>{" "}
                until milestones are approved.
              </li>
              <li>
                At each milestone,{" "}
                <strong>backers vote with their Pledge NFTs</strong> to either:
                <ul className="ml-6 mt-2 space-y-1">
                  <li>✅ Approve release of funds to the project creator.</li>
                  <li>❌ Reject, triggering refunds to backers.</li>
                </ul>
              </li>
            </ul>
            <p className="text-lg font-medium">
              This ensures <strong>trust-minimized crowdfunding</strong> where
              project creators only get paid when they deliver.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">✨ Features</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Project Creation</h3>
              <p className="text-sm text-muted-foreground">
                Creators set funding goals, deadlines, and milestones.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Vault Escrow</h3>
              <p className="text-sm text-muted-foreground">
                Contributions are locked inside the project object.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Pledge NFTs</h3>
              <p className="text-sm text-muted-foreground">
                Each backer gets a unique NFT tied to the project, tradable on
                marketplaces.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Weighted Voting</h3>
              <p className="text-sm text-muted-foreground">
                Voting power = amount of SUI pledged.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Milestone Governance</h3>
              <p className="text-sm text-muted-foreground">
                Funds released step by step, based on backer approval.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Refunds</h3>
              <p className="text-sm text-muted-foreground">
                If a milestone fails or funding goal is not met, backers reclaim
                their SUI.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">
            🔧 Technical Architecture
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">Project Object</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Stores metadata (title, description, links, image).</li>
                <li>
                  • Holds an internal{" "}
                  <code className="bg-muted px-1 rounded">
                    vault: Balance&lt;SUI&gt;
                  </code>{" "}
                  as escrow.
                </li>
                <li>
                  • Contains milestones with deadlines and release percentages.
                </li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">Pledge Object (NFT)</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Minted when a backer funds a project.</li>
                <li>• Carries project ID, pledge amount, and metadata.</li>
                <li>• Tradable and usable for weighted voting.</li>
              </ul>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-2">Proposal / Voting System</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Backers submit votes tied to their pledge NFTs.</li>
                <li>
                  • Ensures one vote per pledge, weighted by contribution.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Example Flow Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🚀 Example Flow</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold">Create Project</h3>
                <p className="text-sm text-muted-foreground">
                  Alice launches a solar energy campaign with 3 milestones.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold">Fund Project</h3>
                <p className="text-sm text-muted-foreground">
                  Bob contributes 50 SUI → receives a{" "}
                  <strong>Pledge NFT</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold">Milestone Reached</h3>
                <p className="text-sm text-muted-foreground">
                  Backers vote. If approved, 30% of vault funds are released.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold">Completion or Refund</h3>
                <p className="text-sm text-muted-foreground">
                  If milestones succeed, project receives all funds. Otherwise,
                  backers can <strong>refund</strong> by returning their pledge
                  NFT.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">🛠️ Tech Stack</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Smart Contracts</h3>
              <p className="text-sm">Move (Sui blockchain)</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-sm">Next.js + Sui SDK</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Storage</h3>
              <p className="text-sm">
                On-chain objects (Project, Pledge, Proposal)
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Escrow</h3>
              <p className="text-sm">
                Balance&lt;SUI&gt; vault inside each project
              </p>
            </div>
          </div>
        </section>

        {/* Why Sui Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">⚡ Why Sui?</h2>
          <div className="bg-muted p-6 rounded-lg">
            <p className="mb-4">
              Sui&apos;s <strong>object-centric model</strong> makes
              milestone-based crowdfunding simpler and safer than on Ethereum:
            </p>
            <ul className="space-y-2">
              <li>• Each project is an object with its own escrow vault.</li>
              <li>
                • Each pledge is an NFT that can be traded or used in
                governance.
              </li>
              <li>• State transitions are clean and composable.</li>
            </ul>
          </div>
        </section>

        {/* Hackathon Scope Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">📅 Hackathon Scope</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-green-600">
                This MVP focuses on:
              </h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Project creation with milestones</li>
                <li>✅ Funding flow with vault escrow</li>
                <li>✅ Minting of pledge NFTs</li>
                <li>✅ Voting with weighted pledges</li>
                <li>✅ Refunds if projects fail</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-blue-600">
                Future extensions:
              </h3>
              <ul className="space-y-2 text-sm">
                <li>🔮 DAO governance for proposals</li>
                <li>🔮 Secondary market for Pledge NFTs</li>
                <li>🔮 Support for stablecoins (USDC)</li>
                <li>🔮 Off-chain indexer + frontend dashboard</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
