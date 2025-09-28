"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { handleProjectCreation } from "@/lib/handlers/projectHandler";
import { toast } from "sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useConnectWallet,
  useWallets,
} from "@mysten/dapp-kit";
import type { SuiTransactionBlockResponse } from "@mysten/sui/client";
import type { SignAndExecuteFn } from "@/lib/services/projectService";

const statuses = ["active", "live", "funded"] as const;

export default function NewProjectPage() {
  const router = useRouter();

  // ✅ wallet/account hooks
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } =
    useSignAndExecuteTransaction();
  const { mutateAsync: connect } = useConnectWallet();
  const wallets = useWallets();

  // ✅ wrapper so our signer matches ProjectService's SignAndExecuteFn signature
  const signAndExecuteTransactionBlock: SignAndExecuteFn = React.useCallback(
    async ({ transactionBlock }) => {
      console.log("🟡 Sending transaction block to wallet:", transactionBlock);
      const res = await signAndExecuteTransaction({
        transaction: transactionBlock,
      });
      console.log("🟡 Wallet raw result:", res);
      return res as unknown as SuiTransactionBlockResponse;
    },
    [signAndExecuteTransaction],
  );

  const [submitting, setSubmitting] = React.useState(false);
  const [milestones, setMilestones] = React.useState<
    { title: string; percent: number; endDate: string }[]
  >([]);
  const [mTitle, setMTitle] = React.useState("");
  const [mPercent, setMPercent] = React.useState<number | "">("");
  const [mDate, setMDate] = React.useState("");

  // Calculate milestone percentage validation
  const totalPercent = milestones.reduce((sum, m) => sum + m.percent, 0);
  const remainingPercent = 100 - totalPercent;
  const isPercentageValid = totalPercent === 100;

  function addMilestone() {
    if (!mTitle || mPercent === "" || mPercent < 0 || mPercent > 100 || !mDate) {
      toast.error("Please fill all milestone fields with valid data");
      return;
    }

    const newPercent = Number(mPercent);
    const newTotal = totalPercent + newPercent;

    if (newTotal > 100) {
      toast.error(`Adding ${newPercent}% would exceed 100% (current: ${totalPercent}%)`);
      return;
    }

    const endDate = new Date(mDate);
    if (endDate <= new Date()) {
      toast.error("Milestone end date must be in the future");
      return;
    }

    setMilestones((arr) => [
      ...arr,
      { title: mTitle, percent: newPercent, endDate: mDate },
    ]);
    setMTitle("");
    setMPercent("");
    setMDate("");
    toast.success(`Milestone added! ${100 - newTotal}% remaining`);
  }

  async function handleSubmit(formData: FormData) {
    console.log("🟢 handleSubmit fired");

    setSubmitting(true);

    try {
      // ✅ check wallet
      if (!account) {
        console.warn("⚠️ No account connected, trying to auto-connect...");
        if (wallets.length === 0) {
          toast.error("No Sui wallets detected. Please install a wallet.");
          return;
        }
        await connect({ wallet: wallets[0] });
        toast.success(`Connected to ${wallets[0].name}. Please submit again.`);
        return;
      }

      if (milestones.length === 0) {
        console.warn("⚠️ No milestones added");
        toast.error("At least one milestone is required");
        return;
      }

      console.log("➡️ Calling handleProjectCreation with:", {
        formData: Object.fromEntries(formData.entries()),
        milestones,
        account: account.address,
      });

      toast.loading("Creating project on blockchain...", {
        id: "create-project",
      });

      const result = await handleProjectCreation(
        formData,
        milestones,
        account.address,
        signAndExecuteTransactionBlock,
      );

      console.log("📩 Result from handleProjectCreation:", result);
      console.log("🔍 Result success status:", result.success);
      console.log("🔍 Result error:", result.error);
      console.log("🔍 Result transaction hash:", result.transactionHash);

      if (result.success) {
        toast.success(
          `Project created! TX: ${result.transactionHash?.substring(0, 10)}...`,
          { id: "create-project" },
        );

        setTimeout(() => {
          router.push("/dashboard/projects");
        }, 1500);
      } else {
        console.error("❌ Project creation failed:", result.error);
        toast.error(result.error || "Failed to create project", {
          id: "create-project",
        });
      }
    } catch (error) {
      console.error("🔥 Project creation error in handleSubmit:", error);
      toast.error("Unexpected error occurred", { id: "create-project" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
              <CardDescription>
                Provide details for your fundraising project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  console.log("🟢 onSubmit triggered");
                  handleSubmit(new FormData(e.currentTarget));
                }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. SUI DeFi Aggregator"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Funding Goal (SUI)</Label>
                  <Input
                    id="fundingGoal"
                    name="fundingGoal"
                    type="number"
                    min={0}
                    step="1"
                    required
                    placeholder="15000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeLeft">Time Left</Label>
                  <Input
                    id="timeLeft"
                    name="timeLeft"
                    placeholder="e.g. 14 days"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={5}
                    placeholder="Tell backers what you're building, your roadmap, and how funds will be used."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="imageUrl">Project Image URL</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="projectLink">Project Website/Link</Label>
                  <Input
                    id="projectLink"
                    name="projectLink"
                    type="url"
                    placeholder="https://your-project-website.com"
                  />
                </div>
                {/* Milestones */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Milestones</Label>
                    <div className="text-xs">
                      <span className="text-foreground/60">
                        Total: {totalPercent}%
                      </span>
                      {remainingPercent > 0 && (
                        <span className="text-orange-500 ml-2">
                          (Need {remainingPercent}% more)
                        </span>
                      )}
                      {remainingPercent < 0 && (
                        <span className="text-red-500 ml-2">
                          ({Math.abs(remainingPercent)}% over limit)
                        </span>
                      )}
                      {isPercentageValid && (
                        <span className="text-green-500 ml-2">
                          ✓ Complete
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="mTitle">Title</Label>
                      <Input
                        id="mTitle"
                        value={mTitle}
                        onChange={(e) => setMTitle(e.target.value)}
                        placeholder="e.g. Alpha launch"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mPercent">Relative Share %</Label>
                      <Input
                        id="mPercent"
                        type="number"
                        min={0}
                        max={100}
                        value={mPercent}
                        onChange={(e) =>
                          setMPercent(
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                        placeholder="0-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mDate">End date</Label>
                      <Input
                        id="mDate"
                        type="date"
                        value={mDate}
                        onChange={(e) => setMDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addMilestone}
                    >
                      Add Milestone
                    </Button>
                  </div>

                  {milestones.length > 0 && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="p-3 border-b text-sm text-foreground/60">
                        Added milestones
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">
                                Title
                              </th>
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">
                                Relative Share %
                              </th>
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">
                                End Date
                              </th>
                              <th className="text-right p-3 text-sm font-medium text-foreground/80">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {milestones.map((m, idx) => (
                              <tr
                                key={idx}
                                className="border-b last:border-b-0 hover:bg-muted/20"
                              >
                                <td className="p-3 text-sm font-medium">
                                  {m.title}
                                </td>
                                <td className="p-3 text-sm text-foreground/80">
                                  {m.percent}%
                                </td>
                                <td className="p-3 text-sm text-foreground/80">
                                  {new Date(m.endDate).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setMilestones(
                                        milestones.filter((_, i) => i !== idx),
                                      )
                                    }
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    Remove
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting || !isPercentageValid || milestones.length === 0}
                  >
                    {submitting ? "Creating…" : "Create Project"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
