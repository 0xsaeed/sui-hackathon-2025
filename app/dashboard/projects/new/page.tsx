"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useRouter } from 'next/navigation'
import React from 'react'
import { toast } from 'sonner'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

const categories = ["DeFi", "NFTs", "Gaming", "Sustainability", "AI/ML", "Social"] as const
const statuses = ["active", "live", "funded"] as const
const CLOCK_OBJECT_ID = '0x6'
const MIST_PER_SUI = BigInt(1_000_000_000)

export default function NewProjectPage() {
  const router = useRouter()
  const account = useCurrentAccount()
  const formRef = React.useRef<HTMLFormElement>(null)
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction({
    mutationKey: ['create-project'],
  })
  const [submitting, setSubmitting] = React.useState(false)
  const [milestones, setMilestones] = React.useState<{ title: string; percent: number; endDate: string }[]>([])
  const [mTitle, setMTitle] = React.useState("")
  const [mPercent, setMPercent] = React.useState<number | "">("")
  const [mDate, setMDate] = React.useState("")
  const [closeOnGoal, setCloseOnGoal] = React.useState(true)

  function addMilestone() {
    if (!mTitle || mPercent === "" || mPercent <= 0 || mPercent > 100 || !mDate) return
    setMilestones((arr) => [...arr, { title: mTitle.trim(), percent: Number(mPercent), endDate: mDate }])
    setMTitle("")
    setMPercent("")
    setMDate("")
  }

  const handleSubmit = async (formData: FormData) => {
    if (submitting) return
    setSubmitting(true)

    try {
      if (!account) {
        toast.error('Connect your wallet to create a project.')
        return
      }

      const packageId = process.env.NEXT_PUBLIC_CROWDFUNDING_PACKAGE_ID
      if (!packageId) {
        throw new Error('Crowdfunding package ID is not configured.')
      }

      const name = (formData.get('name') as string | null)?.trim() ?? ''
      const description = (formData.get('description') as string | null)?.trim() ?? ''
      const longDescription = (formData.get('longDescription') as string | null)?.trim() ?? ''
      const imageUrl = (formData.get('imageUrl') as string | null)?.trim() ?? ''
      const projectLink = (formData.get('projectLink') as string | null)?.trim() ?? ''
      const fundingGoalRaw = (formData.get('fundingGoal') as string | null)?.trim() ?? ''
      const fundingDeadlineRaw = (formData.get('fundingDeadline') as string | null)?.trim() ?? ''

      if (!name) {
        throw new Error('Project name is required.')
      }
      if (!imageUrl) {
        throw new Error('Image URL is required.')
      }
      if (!projectLink) {
        throw new Error('Project link is required.')
      }
      if (!fundingGoalRaw) {
        throw new Error('Funding goal is required.')
      }
      if (!fundingDeadlineRaw) {
        throw new Error('Funding deadline is required.')
      }
      if (!milestones.length) {
        throw new Error('Add at least one milestone before creating a project.')
      }

      const fundingGoalNumber = Number(fundingGoalRaw)
      if (!Number.isFinite(fundingGoalNumber) || fundingGoalNumber <= 0) {
        throw new Error('Funding goal must be a positive number.')
      }
      if (!Number.isInteger(fundingGoalNumber)) {
        throw new Error('Funding goal must be an integer value in SUI.')
      }

      const fundingDeadlineDate = new Date(fundingDeadlineRaw)
      const fundingDeadlineMs = fundingDeadlineDate.getTime()
      if (Number.isNaN(fundingDeadlineMs)) {
        throw new Error('Funding deadline is invalid.')
      }
      if (fundingDeadlineMs <= Date.now()) {
        throw new Error('Funding deadline must be in the future.')
      }

      const milestoneTitles = milestones.map((m) => m.title.trim())
      const milestonePercents = milestones.map((m) => m.percent)
      const milestoneDeadlines = milestones.map((m) => new Date(m.endDate).getTime())

      if (milestoneTitles.some((title) => !title)) {
        throw new Error('Milestone titles cannot be empty.')
      }
      if (milestonePercents.reduce((acc, curr) => acc + curr, 0) !== 100) {
        throw new Error('Milestone percentages must total 100%.')
      }
      if (milestoneDeadlines.some((deadline) => Number.isNaN(deadline))) {
        throw new Error('Milestone deadlines are invalid.')
      }
      if (milestoneDeadlines.some((deadline) => deadline <= fundingDeadlineMs)) {
        throw new Error('Milestone deadlines must be after the funding deadline.')
      }
      for (let i = 1; i < milestoneDeadlines.length; i += 1) {
        if (milestoneDeadlines[i] <= milestoneDeadlines[i - 1]) {
          throw new Error('Milestone deadlines must be in increasing order.')
        }
      }

      const encoder = new TextEncoder()
      const tx = new Transaction()
      tx.setSender(account.address)

      const imageUrlArg = tx.moveCall({
        target: '0x2::url::new_unsafe_from_bytes',
        arguments: [tx.pure.vector('u8', encoder.encode(imageUrl))],
      })
      const linkArg = tx.moveCall({
        target: '0x2::url::new_unsafe_from_bytes',
        arguments: [tx.pure.vector('u8', encoder.encode(projectLink))],
      })

      tx.moveCall({
        target: `${packageId}::project::create_project`,
        arguments: [
          tx.pure.string(name),
          tx.pure.string(longDescription || description),
          imageUrlArg,
          linkArg,
          tx.pure.u64(BigInt(fundingDeadlineMs).toString()),
          tx.pure.u64((BigInt(fundingGoalRaw) * MIST_PER_SUI).toString()),
          tx.pure.bool(closeOnGoal),
          tx.pure.vector('string', milestoneTitles),
          tx.pure.vector('u64', milestoneDeadlines.map((deadline) => BigInt(deadline).toString())),
          tx.pure.vector('u8', milestonePercents),
          tx.object(CLOCK_OBJECT_ID),
        ],
      })

      const result = await signAndExecuteTransaction({ transaction: tx })

      toast.success('Project created on Sui!', {
        description: `Digest: ${result.digest}`,
      })

      setMilestones([])
      setMTitle("")
      setMPercent("")
      setMDate("")
      setCloseOnGoal(true)
      formRef.current?.reset()

      router.push('/dashboard/projects')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred.'
      console.error('Failed to create project', error)
      toast.error('Failed to create project', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    void handleSubmit(formData)
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
              <CardDescription>Provide details for your fundraising project</CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. SUI DeFi Aggregator" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Project Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" type="url" required placeholder="https://example.com/cover.png" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectLink">Project Link</Label>
                  <Input id="projectLink" name="projectLink" type="url" required placeholder="https://example.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select id="category" name="category" className="bg-transparent border rounded-md px-3 py-2">
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" name="status" className="bg-transparent border rounded-md px-3 py-2">
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Funding Goal (SUI)</Label>
                  <Input id="fundingGoal" name="fundingGoal" type="number" min={1} step="1" required placeholder="15000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fundingDeadline">Funding Deadline</Label>
                  <Input id="fundingDeadline" name="fundingDeadline" type="date" required />
                </div>

                <div className="md:col-span-2 flex items-start gap-3 rounded-md border p-4">
                  <Checkbox
                    id="closeOnGoal"
                    checked={closeOnGoal}
                    onCheckedChange={(value) => setCloseOnGoal(value === true)}
                    disabled={submitting}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="closeOnGoal">Close funding when goal is reached</Label>
                    <p className="text-xs text-muted-foreground">
                      If enabled, new pledges are disabled once the funding goal is met.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea id="description" name="description" rows={3} placeholder="One-line summary of your project" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="longDescription">Long Description</Label>
                  <Textarea id="longDescription" name="longDescription" rows={6} placeholder="Tell backers what you’re building, your roadmap, and how funds will be used." />
                </div>

                {/* Milestones */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Milestones</Label>
                    <span className="text-xs text-foreground/60">Add one milestone at a time</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="mTitle">Title</Label>
                      <Input id="mTitle" value={mTitle} onChange={(e) => setMTitle(e.target.value)} placeholder="e.g. Alpha launch" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mPercent">Relative Share %</Label>
                      <Input id="mPercent" type="number" min={1} max={100} value={mPercent} onChange={(e) => setMPercent(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mDate">End date</Label>
                      <Input id="mDate" type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button type="button" variant="secondary" onClick={addMilestone} disabled={submitting}>Add Milestone</Button>
                  </div>

                  {milestones.length > 0 && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <div className="p-3 border-b text-sm text-foreground/60">Added milestones</div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/30">
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">Title</th>
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">Relative Share %</th>
                              <th className="text-left p-3 text-sm font-medium text-foreground/80">End Date</th>
                              <th className="text-right p-3 text-sm font-medium text-foreground/80">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {milestones.map((m, idx) => (
                              <tr key={idx} className="border-b last:border-b-0 hover:bg-muted/20">
                                <td className="p-3 text-sm font-medium">{m.title}</td>
                                <td className="p-3 text-sm text-foreground/80">{m.percent}%</td>
                                <td className="p-3 text-sm text-foreground/80">{new Date(m.endDate).toLocaleDateString()}</td>
                                <td className="p-3 text-right">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    disabled={submitting}
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
                  <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create Project'}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
