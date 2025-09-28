// lib/services/projectService.ts

import { SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { networkConfig } from "@/lib/networkConfig";

// -----------------------------
// Types
// -----------------------------
export interface Milestone {
  title: string;
  percent: number;
  endDate: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  imageUrl: string;
  projectLink: string;
  fundingGoal: string;
  fundingDeadline: string; // date input from form
  closeOnFundingGoal: boolean;
  milestones: Milestone[];
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  projectId?: string;
  error?: string;
}

/** Wallet signer type the service expects. */
export type SignAndExecuteFn = (args: {
  transactionBlock: Transaction;
  options?: {
    showEffects?: boolean;
    showObjectChanges?: boolean;
  };
}) => Promise<SuiTransactionBlockResponse>;

// -----------------------------
// Constants
// -----------------------------
const MODULE_NAME = "project";
const FUNCTION_NAME = "create_project";
const CLOCK_OBJECT_ID = "0x6"; // shared Clock

// -----------------------------
// Service Class
// -----------------------------
class ProjectService {
  private client: SuiClient;
  private packageId: string;

  constructor() {
    const activeNetwork =
      (process.env.NEXT_PUBLIC_SUI_NETWORK as keyof typeof networkConfig) ||
      "testnet";

    const cfg = networkConfig[activeNetwork];

    this.client = new SuiClient({ url: cfg.url });

    // make sure networkConfig.variables.crowdfundingPackageId is set for the active network
    this.packageId = cfg.variables.crowdfundingPackageId;

    console.log("🌐 ProjectService initialized with network:", activeNetwork);
    console.log("📦 Using packageId:", this.packageId);
    console.log("🌐 Connecting to:", cfg.url);
  }

  validateProjectData(data: ProjectFormData): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push("Project name must be at least 3 characters long");
    }
    if (!data.fundingGoal || parseFloat(data.fundingGoal) <= 0) {
      errors.push("Funding goal must be greater than 0");
    }
    if (!data.description || data.description.trim().length < 10) {
      errors.push("Description must be at least 10 characters long");
    }

    if (data.milestones.length === 0) {
      errors.push("At least one milestone is required");
    } else {
      const totalPercent = data.milestones.reduce(
        (sum, m) => sum + m.percent,
        0,
      );
      if (totalPercent !== 100) {
        errors.push(
          `Milestone percentages must sum to 100% (currently ${totalPercent}%)`,
        );
      }
    }

    if (!this.packageId) {
      errors.push("Crowdfunding Package ID not configured in networkConfig");
    }

    return { isValid: errors.length === 0, errors };
  }

  private formatDataForBlockchain(data: ProjectFormData) {
    const formatted = {
      title: data.name.trim(),
      description: data.description.trim(),
      imageUrl: data.imageUrl.trim(),
      projectLink: data.projectLink.trim(),
      // SUI → MIST
      fundingGoal: BigInt(
        Math.floor(parseFloat(data.fundingGoal) * 1_000_000_000),
      ),
      // your Move uses timestamp_ms(clk), so pass ms
      fundingDeadline: Math.floor(new Date(data.fundingDeadline).getTime()),
      closeOnFundingGoal: data.closeOnFundingGoal,
      milestones: {
        titles: data.milestones.map((m) => m.title.trim()),
        deadlines: data.milestones.map((m) =>
          Math.floor(new Date(m.endDate).getTime()),
        ),
        percents: data.milestones.map((m) => m.percent),
      },
    };
    console.log("📝 Formatted blockchain data:", formatted);
    return formatted;
  }

  async createProjectTx(projectData: ProjectFormData): Promise<Transaction> {
    console.log("🛠️ createProjectTx called with:", projectData);

    const validation = this.validateProjectData(projectData);
    if (!validation.isValid) {
      console.warn("❌ Validation failed:", validation.errors);
      throw new Error(validation.errors.join(", "));
    }

    const data = this.formatDataForBlockchain(projectData);
    const tx = new Transaction();

    // ✅ Build sui::url::Url values using the correct Sui function
    // Docs: https://docs.sui.io/references/framework/sui/url
    const imageUrlArg = tx.moveCall({
      target: "0x2::url::new_unsafe",
      arguments: [tx.pure.string(data.imageUrl)],
    });

    const linkArg = tx.moveCall({
      target: "0x2::url::new_unsafe",
      arguments: [tx.pure.string(data.projectLink)],
    });

    const target = `${this.packageId}::${MODULE_NAME}::${FUNCTION_NAME}`;
    console.log("📜 Adding moveCall with target:", target);
    tx.moveCall({
      target,
      arguments: [
        tx.pure.string(data.title),
        tx.pure.string(data.description),
        imageUrlArg, // Url
        linkArg, // Url
        tx.pure.u64(data.fundingDeadline),
        tx.pure.u128(data.fundingGoal),
        tx.pure.bool(data.closeOnFundingGoal),
        tx.pure.vector("string", data.milestones.titles),
        tx.pure.vector("u64", data.milestones.deadlines),
        tx.pure.vector("u8", data.milestones.percents),
        tx.object(CLOCK_OBJECT_ID),
        // &mut TxContext is auto-injected by the VM for (entry/public) tx calls
      ],
    });

    tx.setGasBudget(10_000_000);
    console.log("⛽ Gas budget set to 10M");

    return tx;
  }

  async executeProjectTx(
    tx: Transaction,
    signAndExecuteTransactionBlock: SignAndExecuteFn,
  ): Promise<TransactionResult> {
    console.log("🚀 executeProjectTx called...");

    try {
      const result = await signAndExecuteTransactionBlock({
        transactionBlock: tx,
        options: { showEffects: true, showObjectChanges: true },
      });

      console.log("📩 Raw TX result:", result);

      if (result.effects?.status?.status === "success") {
        const createdObjects = result.objectChanges?.filter(
          (change) => change.type === "created",
        );
        const projectId = createdObjects?.[0]?.objectId;

        console.log("✅ Project created! ID:", projectId);

        return {
          success: true,
          transactionHash: result.digest,
          projectId,
        };
      } else {
        console.error("❌ TX failed:", result.effects?.status?.error);
        return {
          success: false,
          error: result.effects?.status?.error || "Transaction failed",
        };
      }
    } catch (error) {
      console.error("🔥 Error executing project tx:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getProject(projectId: string) {
    console.log("🔎 Fetching project:", projectId);
    return this.client.getObject({
      id: projectId,
      options: { showContent: true, showType: true },
    });
  }

  async getAllProjects() {
    console.log("📡 Querying all ProjectCreated events");
    return this.client.queryEvents({
      query: {
        MoveEventType: `${this.packageId}::${MODULE_NAME}::ProjectCreated`,
      },
    });
  }
}

// -----------------------------
// Export singleton
// -----------------------------
export const projectService = new ProjectService();
export default projectService;
