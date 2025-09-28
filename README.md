<p align="center">
  <img src="https://raw.githubusercontent.com/0xsaeed/sui-hackathon-2025/33baeaaad987e54844c7a85d73ab2f89c57c0ede/app/icon0.svg" alt="MatryoFund Logo" width="200"/>
</p>

# MatryoFund – Milestone-Based Crowdfunding on Sui

## 📌 Overview

MatryoFund(Matryoshka + Funding ) is a **decentralized crowdfunding platform**
built on the **Sui blockchain**.  
Unlike traditional platforms where project creators can withdraw all funds
immediately, MatryoFund introduces a **milestone-based escrow system**:

- Backers fund projects using **SUI**.
- Each contribution mints a **Pledge NFT**, which represents the backer’s stake.
- Funds are stored in a **project vault (escrow)** until milestones are
  approved.
- At each milestone, **backers vote with their Pledge NFTs** to either:
  - ✅ Approve release of funds to the project creator.
  - ❌ Reject, triggering refunds to backers.

This ensures **trust-minimized crowdfunding** where project creators only get
paid when they deliver.

---

## ✨ Features

- **Project Creation**: Creators set funding goals, deadlines, and milestones.
- **Vault Escrow**: Contributions are locked inside the project object.
- **Pledge NFTs**: Each backer gets a unique NFT tied to the project, tradable
  on marketplaces.
- **Weighted Voting**: Voting power = amount of SUI pledged.
- **Milestone Governance**: Funds released step by step, based on backer
  approval.
- **Refunds**: If a milestone fails or funding goal is not met, backers reclaim
  their SUI.

---

## 🔧 Technical Architecture

- **Project Object**
  - Stores metadata (title, description, links, image).
  - Holds an internal `vault: Balance<SUI>` as escrow.
  - Contains milestones with deadlines and release percentages.

- **Pledge Object (NFT)**
  - Minted when a backer funds a project.
  - Carries project ID, pledge amount, and metadata.
  - Tradable and usable for weighted voting.

- **Proposal / Voting System**
  - Backers submit votes tied to their pledge NFTs.
  - Ensures one vote per pledge, weighted by contribution.

---

## 🚀 Example Flow

1. **Create Project** → Alice launches a solar energy campaign with 3
   milestones.
2. **Fund Project** → Bob contributes 50 SUI → receives a **Pledge NFT**.
3. **Milestone Reached** → Backers vote. If approved, 30% of vault funds are
   released.
4. **Completion or Refund** → If milestones succeed, project receives all funds.
   Otherwise, backers can **refund** by returning their pledge NFT.

---

## 🛠️ Tech Stack

- **Smart Contracts**: Move (Sui blockchain)
- **Frontend**: Next.js + Sui SDK
- **Storage**: On-chain objects (`Project`, `Pledge`, `Proposal`)
- **Escrow**: `Balance<SUI>` vault inside each project

---

## 📅 Hackathon Scope

This MVP focuses on:

- Project creation with milestones.
- Funding flow with vault escrow.
- Minting of pledge NFTs.
- Voting with weighted pledges.
- Refunds if projects fail.

Future extensions:

- DAO governance for proposals.
- Secondary market for Pledge NFTs.
- Support for stablecoins (USDC).
- Off-chain indexer + frontend dashboard.

---

## ⚡ Why Sui?

Sui’s **object-centric model** makes milestone-based crowdfunding simpler and
safer than on Ethereum:

- Each project is an object with its own escrow vault.
- Each pledge is an NFT that can be traded or used in governance.
- State transitions are clean and composable.
