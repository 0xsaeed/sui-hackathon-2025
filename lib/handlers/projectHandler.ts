// lib/handlers/projectHandler.ts

"use client";

import {
  projectService,
  type ProjectFormData,
  type Milestone,
  type TransactionResult,
  type SignAndExecuteFn,
} from "@/lib/services/projectService";

// Local storage type
interface StoredProject extends ProjectFormData {
  projectId: string;
  transactionHash: string;
  createdAt: string;
  creator: string;
}

/**
 * Handles project creation from form data
 * Uses connected wallet signer (passed from useSui hook)
 */
export async function handleProjectCreation(
  formData: FormData,
  milestones: Milestone[],
  account: string,
  signAndExecuteTransactionBlock: SignAndExecuteFn,
): Promise<TransactionResult> {
  try {
    console.log("🔥 handleProjectCreation called");

    // ✅ Build project data from form
    const projectData: ProjectFormData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      projectLink: formData.get("projectLink") as string,
      fundingGoal: formData.get("fundingGoal") as string,
      fundingDeadline: formData.get("fundingDeadline") as string,
      closeOnFundingGoal: formData.get("closeOnFundingGoal") === "on",
      milestones,
    };

    console.log("📝 Built projectData:", projectData);

    // ✅ Validate before building tx
    const validation = projectService.validateProjectData(projectData);
    if (!validation.isValid) {
      console.warn("❌ Validation failed:", validation.errors);
      return { success: false, error: validation.errors.join(", ") };
    }

    console.log("➡️ About to call createProjectTx with:", projectData);

    // ✅ Build transaction block
    const txb = await projectService.createProjectTx(projectData);

    console.log("✅ Got Transaction block:", txb);

    // ✅ Execute transaction using wallet signer
    const result = await projectService.executeProjectTx(
      txb,
      signAndExecuteTransactionBlock,
    );

    console.log("📩 Result from executeProjectTx:", result);

    // ✅ If success, save locally for reference
    if (result.success) {
      const stored: StoredProject = {
        ...projectData,
        projectId: result.projectId!,
        transactionHash: result.transactionHash!,
        createdAt: new Date().toISOString(),
        creator: account,
      };
      storeProjectLocally(stored);
      console.log("💾 Project stored locally:", stored);
    }

    return result;
  } catch (error) {
    console.error("🔥 Project creation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Store project data locally (browser only)
 */
function storeProjectLocally(projectData: StoredProject) {
  try {
    const existingProjects: StoredProject[] = JSON.parse(
      localStorage.getItem("createdProjects") || "[]",
    );
    existingProjects.push(projectData);
    localStorage.setItem("createdProjects", JSON.stringify(existingProjects));

    localStorage.setItem("lastCreatedProject", JSON.stringify(projectData));
  } catch (error) {
    console.error("⚠️ Failed to store project locally:", error);
  }
}

/**
 * Retrieve locally stored projects
 */
export function getLocalProjects(): StoredProject[] {
  try {
    return JSON.parse(localStorage.getItem("createdProjects") || "[]");
  } catch {
    return [];
  }
}

/**
 * Validate form before submission
 */
export function validateProjectForm(
  formData: FormData,
  milestones: Milestone[],
): { isValid: boolean; errors: string[] } {
  const projectData: ProjectFormData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    imageUrl: formData.get("imageUrl") as string,
    projectLink: formData.get("projectLink") as string,
    fundingGoal: formData.get("fundingGoal") as string,
    fundingDeadline: formData.get("fundingDeadline") as string,
    closeOnFundingGoal: formData.get("closeOnFundingGoal") === "on",
    milestones,
  };

  return projectService.validateProjectData(projectData);
}
