"use client";

import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { TESTNET_COUNTER_PACKAGE_ID } from "./constants";

// Update constants to use the actual package ID for the matryofund contract
export const MATRYOFUND_PACKAGE_ID = TESTNET_COUNTER_PACKAGE_ID;

// Project structure matching the Move contract
export interface BlockchainProject {
  id: string;
  creator: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  funding_start: number;
  funding_deadline: number;
  funding_goal: number;
  total_raised: number;
  total_withdrawn_percentage: number;
  close_on_funding_goal: boolean;
  milestones: Milestone[];
  milestone_index: number;
  status: number;
}

export interface Milestone {
  title: string;
  deadline: number;
  is_claimed: boolean;
  release_percentage: number;
}

export interface ProjectFormData {
  name: string;
  description: string;
  fundingGoal: number;
  timeLeft: string;
  imageUrl: string;
  siteUrl: string;
  milestones: { title: string; percent: number; endDate: string }[];
}

// Convert days to milliseconds from now
export function daysToMs(days: number): number {
  return Date.now() + (days * 24 * 60 * 60 * 1000);
}

// Parse time left string to get deadline in milliseconds
export function parseTimeLeft(timeLeft: string): number {
  const match = timeLeft.match(/(\d+)\s*days?/i);
  if (match) {
    return daysToMs(parseInt(match[1]));
  }
  // Default to 30 days if parsing fails
  return daysToMs(30);
}

// Create a new project on the blockchain
export function createProjectTransaction(
  formData: ProjectFormData,
  signer: string
): Transaction {
  const tx = new Transaction();

  // Convert form data to contract parameters
  const title = formData.name;
  const description = formData.description;
  const image_url = formData.imageUrl || "https://via.placeholder.com/400x300"; // Use provided image or default
  const link = formData.siteUrl || "https://example.com"; // Use provided site URL or default
  const funding_deadline = parseTimeLeft(formData.timeLeft);
  const funding_goal = Math.floor(formData.fundingGoal * 1_000_000_000); // Convert SUI to MIST
  const close_on_funding_goal = true;

  // Prepare milestone data
  const milestone_titles: string[] = [];
  const milestone_deadlines: number[] = [];
  const milestone_percents: number[] = [];

  if (formData.milestones.length > 0) {
    // Use provided milestones, but validate and sort them
    const sortedMilestones = [...formData.milestones].sort((a, b) =>
      new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    );

    sortedMilestones.forEach((milestone) => {
      milestone_titles.push(milestone.title);
      const milestoneTime = new Date(milestone.endDate).getTime();
      // Ensure milestone is after funding deadline
      const adjustedTime = Math.max(milestoneTime, funding_deadline + (24 * 60 * 60 * 1000)); // At least 1 day after
      milestone_deadlines.push(adjustedTime);
      milestone_percents.push(milestone.percent);
    });
  } else {
    // Create a default milestone that's definitely after funding deadline
    milestone_titles.push("Project Completion");
    // Make sure milestone is at least 7 days after funding deadline
    const minimumMilestoneDelay = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    milestone_deadlines.push(funding_deadline + minimumMilestoneDelay);
    milestone_percents.push(100);
  }

  // Additional validation to ensure milestones are properly spaced
  for (let i = 1; i < milestone_deadlines.length; i++) {
    // Ensure each milestone is at least 1 day after the previous one
    if (milestone_deadlines[i] <= milestone_deadlines[i - 1]) {
      milestone_deadlines[i] = milestone_deadlines[i - 1] + (24 * 60 * 60 * 1000);
    }
  }

  // Validate all requirements match the Move contract
  const totalPercent = milestone_percents.reduce((a, b) => a + b, 0);
  const now = Date.now();

  // Debug logging
  console.log('Transaction parameters:');
  console.log('- Title:', title);
  console.log('- Description:', description);
  console.log('- Image URL:', image_url);
  console.log('- Site URL:', link);
  console.log('- Current time:', now, new Date(now));
  console.log('- Funding deadline:', funding_deadline, new Date(funding_deadline));
  console.log('- Funding goal:', funding_goal);
  console.log('- Milestone titles:', milestone_titles);
  console.log('- Milestone deadlines:', milestone_deadlines.map(d => new Date(d)));
  console.log('- Milestone percents:', milestone_percents);
  console.log('- Total percent:', totalPercent);

  // Validation checks (matching Move contract)
  console.log('Validation checks:');
  console.log('- Has milestones:', milestone_titles.length > 0);
  console.log('- Lengths match:', milestone_titles.length === milestone_deadlines.length && milestone_deadlines.length === milestone_percents.length);
  console.log('- Total percent is 100:', totalPercent === 100);
  console.log('- All milestones after funding deadline:', milestone_deadlines.every(d => d > funding_deadline));
  console.log('- Milestones properly ordered:', milestone_deadlines.every((d, i) => i === 0 || d > milestone_deadlines[i - 1]));

  if (totalPercent !== 100) {
    throw new Error(`Milestone percentages must total 100%, got ${totalPercent}%`);
  }

  // Create URL objects first
  const imageUrlObj = tx.moveCall({
    target: '0x2::url::new_unsafe_from_bytes',
    arguments: [tx.pure.vector("u8", Array.from(new TextEncoder().encode(image_url)))],
  });

  const linkUrlObj = tx.moveCall({
    target: '0x2::url::new_unsafe_from_bytes',
    arguments: [tx.pure.vector("u8", Array.from(new TextEncoder().encode(link)))],
  });

  tx.moveCall({
    target: `${MATRYOFUND_PACKAGE_ID}::project::create_project`,
    arguments: [
      tx.pure.string(title),
      tx.pure.string(description),
      imageUrlObj,
      linkUrlObj,
      tx.pure.u64(funding_deadline),
      tx.pure.u64(funding_goal),
      tx.pure.bool(close_on_funding_goal),
      tx.pure.vector("string", milestone_titles),
      tx.pure.vector("u64", milestone_deadlines),
      tx.pure.vector("u8", milestone_percents),
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}

// Get all projects from the blockchain
export async function getProjectsFromBlockchain(client: SuiClient): Promise<BlockchainProject[]> {
  console.log('🔍 Querying blockchain for projects...')
  console.log('📦 Using package ID:', MATRYOFUND_PACKAGE_ID)

  try {
    // Use queryEvents to find MilestoneCreated events (since ProjectCreatedEvent is not emitted)
    console.log('📡 Querying for MilestoneCreatedEvent...')
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${MATRYOFUND_PACKAGE_ID}::project::MilestoneCreatedEvent`
      },
      limit: 50, // Adjust as needed
      order: "descending"
    });

    console.log('📅 Events found:', events.data.length)
    console.log('📄 Event data:', events.data)

    const projects: BlockchainProject[] = [];
    const processedProjectIds = new Set<string>(); // To avoid duplicates

    // Get project objects from the milestone events
    for (const event of events.data) {
      console.log('🔍 Processing milestone event:', event)
      if (event.parsedJson) {
        const eventData = event.parsedJson as any;
        const projectId = eventData.project_id;
        console.log('📝 Found project ID from milestone:', projectId)

        // Skip if we already processed this project
        if (processedProjectIds.has(projectId)) {
          console.log('⏭️ Skipping duplicate project ID:', projectId)
          continue;
        }
        processedProjectIds.add(projectId);

        try {
          // Get the full project object
          console.log('📊 Fetching project object for ID:', projectId)
          const projectResponse = await client.getObject({
            id: projectId,
            options: {
              showContent: true,
              showType: true,
            }
          });

          console.log('📦 Project response:', projectResponse)

          if (projectResponse.data?.content && "fields" in projectResponse.data.content) {
            const fields = projectResponse.data.content.fields as any;

            // Convert the blockchain data to our Project format
            const project: BlockchainProject = {
              id: projectResponse.data.objectId,
              creator: fields.creator,
              title: fields.title,
              description: fields.description,
              image_url: fields.image_url?.url || fields.image_url,
              link: fields.link?.url || fields.link,
              funding_start: parseInt(fields.funding_start),
              funding_deadline: parseInt(fields.funding_deadline),
              funding_goal: parseInt(fields.funding_goal),
              total_raised: parseInt(fields.total_raised),
              total_withdrawn_percentage: parseInt(fields.total_withdrawn_percentage),
              close_on_funding_goal: fields.close_on_funding_goal,
              milestones: fields.milestones?.map((m: any) => ({
                title: m.title,
                deadline: parseInt(m.deadline),
                is_claimed: m.is_claimed,
                release_percentage: parseInt(m.release_percentage)
              })) || [],
              milestone_index: parseInt(fields.milestone_index),
              status: parseInt(fields.status)
            };

            projects.push(project);
          }
        } catch (objectError) {
          console.warn("Could not fetch project object:", projectId, objectError);
        }
      }
    }

    return projects;
  } catch (error) {
    console.error("Error fetching projects from blockchain:", error);
    return [];
  }
}

// Convert blockchain project to UI project format
export function blockchainToUIProject(blockchainProject: BlockchainProject): import('./projects').Project {
  const fundingGoalSui = blockchainProject.funding_goal / 1_000_000_000; // Convert MIST to SUI
  const totalRaisedSui = blockchainProject.total_raised / 1_000_000_000; // Convert MIST to SUI

  // Calculate time left
  const now = Date.now();
  const timeLeft = blockchainProject.funding_deadline > now
    ? `${Math.ceil((blockchainProject.funding_deadline - now) / (24 * 60 * 60 * 1000))} days`
    : "Ended";

  // Map status numbers to strings
  const statusMap: { [key: number]: "live" | "active" | "funded" } = {
    0: "active", // funding
    1: "active", // active
    2: "funded", // failed (but we'll show as funded for now)
    3: "funded"  // rejected (but we'll show as funded for now)
  };


  return {
    id: parseInt(blockchainProject.id.replace(/^0x/, ""), 16) || 1, // Convert hex ID to number
    name: blockchainProject.title,
    description: blockchainProject.description,
    status: statusMap[blockchainProject.status] || "active",
    createdDate: (() => {
      const createdDate = new Date(blockchainProject.funding_start);
      if (isNaN(createdDate.getTime())) {
        console.warn('Invalid funding_start date:', blockchainProject.funding_start);
        return new Date().toISOString().split('T')[0]; // fallback to today
      }
      return createdDate.toISOString().split('T')[0];
    })(),
    fundingGoal: fundingGoalSui,
    currentFunding: totalRaisedSui,
    backers: 1, // We'd need to query pledges to get accurate count
    timeLeft: timeLeft,
    milestones: blockchainProject.milestones.map(m => {
      console.log('Raw milestone deadline:', m.deadline, 'Type:', typeof m.deadline);

      // Handle different deadline formats from blockchain
      let date: Date;
      if (typeof m.deadline === 'string') {
        // Try parsing as number first (timestamp)
        const numericValue = parseInt(m.deadline);
        if (!isNaN(numericValue)) {
          // Convert from milliseconds to Date
          date = new Date(numericValue);
        } else {
          date = new Date(m.deadline);
        }
      } else if (typeof m.deadline === 'number') {
        date = new Date(m.deadline);
      } else {
        console.warn('Unknown deadline format:', m.deadline);
        date = new Date(); // fallback to current date
      }

      // Validate the date
      if (isNaN(date.getTime())) {
        console.warn('Invalid date for milestone:', m.deadline);
        date = new Date(); // fallback to current date
      }

      return {
        title: m.title,
        percent: m.release_percentage,
        endDate: date.toISOString().split('T')[0]
      };
    })
  };
}

// Fund a project
export function fundProjectTransaction(
  projectId: string,
  amount: number // in SUI
): Transaction {
  const tx = new Transaction();

  const amountMist = Math.floor(amount * 1_000_000_000); // Convert SUI to MIST

  const [coin] = tx.splitCoins(tx.gas, [amountMist]);

  tx.moveCall({
    target: `${MATRYOFUND_PACKAGE_ID}::project::deposit_funds`,
    arguments: [
      tx.object(projectId),
      coin,
      tx.object("0x6"), // Clock object
    ],
  });

  return tx;
}