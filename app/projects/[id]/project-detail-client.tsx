'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useConnectWallet,
  useWallets,
} from '@mysten/dapp-kit';
import type { SuiTransactionBlockResponse } from '@mysten/sui/client';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, ExternalLink, Target, Users } from 'lucide-react';
import projectService, { type SignAndExecuteFn } from '@/lib/services/projectService';
import { percentFunded, type UIProject } from '@/lib/project';

const formatSui = (value: number) =>
  Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : '0';

const formatTimeLeft = (project: UIProject) => {
  if (!project.fundingDeadline) return '—';
  const diff = project.fundingDeadline - Date.now();
  if (diff <= 0) return 'Funding closed';
  const hours = Math.round(diff / (1000 * 60 * 60));
  if (hours < 24) return `${Math.max(hours, 1)}h left`;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 14) return `${days} day${days === 1 ? '' : 's'} left`;
  const weeks = Math.ceil(days / 7);
  return `${weeks} wk${weeks === 1 ? '' : 's'} left`;
};

type Props = {
  project: UIProject;
};

export function ProjectDetailClient({ project }: Props) {
  const router = useRouter();
  const account = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const { mutateAsync: connect } = useConnectWallet();
  const wallets = useWallets();

  const signAndExecuteTransactionBlock = useCallback<SignAndExecuteFn>(
    async ({ transactionBlock, options }) => {
      const res = await signAndExecuteTransaction({
        transaction: transactionBlock,
        options,
      });
      return res as unknown as SuiTransactionBlockResponse;
    },
    [signAndExecuteTransaction],
  );

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pctFunded = useMemo(() => percentFunded(project), [project]);
  const timeLeft = useMemo(() => formatTimeLeft(project), [project]);

  const handleDeposit = useCallback(async () => {
    if (!amount.trim()) {
      toast.error('Enter an amount in SUI to deposit');
      return;
    }

    if (!account) {
      if (wallets.length === 0) {
        toast.error('No Sui wallet detected. Please install or connect a wallet.');
        return;
      }
      try {
        await connect({ wallet: wallets[0] });
        toast.success(`Connected to ${wallets[0].name}. Continue with your deposit.`);
      } catch (error) {
        console.error('Wallet connect error', error);
        toast.error('Unable to connect wallet');
      }
      return;
    }

    if (!project.sharedInitialVersion) {
      toast.error('Shared object metadata missing; cannot deposit to this project.');
      return;
    }

    setSubmitting(true);
    toast.loading('Submitting deposit...', { id: 'deposit-project' });
    try {
      const result = await projectService.depositToProject(
        {
          projectId: project.id,
          sharedInitialVersion: project.sharedInitialVersion,
          amount,
        },
        signAndExecuteTransactionBlock,
      );

      if (result.success) {
        toast.success(
          result.transactionHash
            ? `Deposit confirmed! TX: ${result.transactionHash.slice(0, 10)}...`
            : 'Deposit confirmed!',
          { id: 'deposit-project' },
        );
        setAmount('');
        router.refresh();
      } else {
        toast.error(result.error || 'Deposit failed', { id: 'deposit-project' });
      }
    } catch (error) {
      console.error('Deposit error', error);
      toast.error(
        error instanceof Error ? error.message : 'Unexpected error during deposit',
        { id: 'deposit-project' },
      );
    } finally {
      setSubmitting(false);
    }
  }, [account, amount, connect, project.id, project.sharedInitialVersion, router, signAndExecuteTransactionBlock, wallets]);

  return (
    <div className="container pt-28 md:pt-36 pb-12 space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground"
      >
        ← Back to Projects
      </Link>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-3xl font-semibold">{project.title}</CardTitle>
              <Badge className="capitalize">{project.status}</Badge>
              {project.category ? <Badge variant="outline">{project.category}</Badge> : null}
            </div>
            <CardDescription className="mt-2 text-foreground/80 whitespace-pre-line">
              {project.longDescription || project.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <p className="text-foreground/60">Funding Goal</p>
                <p className="text-lg font-semibold">{formatSui(project.fundingGoal)} SUI</p>
              </div>
              <div>
                <p className="text-foreground/60">Raised</p>
                <p className="text-lg font-semibold">{formatSui(project.currentFunding)} SUI</p>
              </div>
              <div>
                <p className="text-foreground/60">Time Left</p>
                <p className="text-lg font-semibold">{timeLeft}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(pctFunded)}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(pctFunded, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid gap-4 text-sm md:grid-cols-2">
              <div className="flex items-center gap-2 text-foreground/70">
                <Users className="size-4" />
                {project.backers ?? '—'} backers
              </div>
              <div className="flex items-center gap-2 text-foreground/70">
                <Calendar className="size-4" />
                Created {new Date(project.createdDate).toLocaleDateString()}
              </div>
              {project.creator ? (
                <div className="flex items-center gap-2 text-foreground/70">
                  <Target className="size-4" />
                  Creator {project.creator}
                </div>
              ) : null}
              {project.link ? (
                <div className="flex items-center gap-2 text-foreground/70">
                  <ExternalLink className="size-4" />
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    Visit project website
                  </a>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Back this Project</CardTitle>
              <CardDescription>Contribute SUI directly into the project vault.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="deposit-amount" className="text-sm text-foreground/70">
                  Amount (SUI)
                </label>
                <Input
                  id="deposit-amount"
                  placeholder="0.0"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  inputMode="decimal"
                  disabled={submitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                onClick={handleDeposit}
                disabled={submitting || !project.sharedInitialVersion}
                className="w-full"
              >
                {submitting ? 'Processing…' : 'Deposit SUI'}
              </Button>
              {!project.sharedInitialVersion ? (
                <p className="text-xs text-foreground/60">
                  Shared object metadata is missing; deposits are temporarily disabled.
                </p>
              ) : null}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funding Details</CardTitle>
              <CardDescription>Key parameters for this project.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/70">
              <div className="flex justify-between">
                <span>Close on funding goal</span>
                <span className="font-medium">
                  {project.closeOnFundingGoal ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Funding deadline</span>
                <span className="font-medium">
                  {project.fundingDeadline
                    ? new Date(project.fundingDeadline).toLocaleString()
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Object version</span>
                <span className="font-medium">{project.objectVersion ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>Shared version</span>
                <span className="font-medium">{project.sharedInitialVersion ?? '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {project.milestones.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
            <CardDescription>Funds release as milestones are reached.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.milestones.map((milestone, index) => (
            <div key={`${milestone.title}-${index}`} className="border rounded-md p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium">{milestone.title}</p>
                  <span className="text-xs text-foreground/60">
                    {milestone.endDate
                      ? new Date(milestone.endDate).toLocaleDateString()
                      : 'No deadline'}
                  </span>
                </div>
                <div className="mt-3 space-y-1 text-sm text-foreground/70">
                  <div className="flex justify-between">
                    <span>Release percentage</span>
                    <span>{milestone.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${Math.min(milestone.percent, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
