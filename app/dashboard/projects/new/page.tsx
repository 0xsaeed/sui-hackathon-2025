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
import { useRouter } from 'next/navigation'
import React from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { createProjectTransaction, type ProjectFormData } from '@/lib/blockchain'
import { toast } from 'sonner'


export default function NewProjectPage() {
  const router = useRouter()
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()

  const [submitting, setSubmitting] = React.useState(false)
  const [milestones, setMilestones] = React.useState<{ title: string; percent: number; endDate: string }[]>([])
  const [mTitle, setMTitle] = React.useState("")
  const [mPercent, setMPercent] = React.useState<number | "">("")
  const [mDate, setMDate] = React.useState("")

  function addMilestone() {
    if (!mTitle || mPercent === "" || mPercent < 0 || mPercent > 100 || !mDate) return
    setMilestones((arr) => [...arr, { title: mTitle, percent: Number(mPercent), endDate: mDate }])
    setMTitle("")
    setMPercent("")
    setMDate("")
  }

  async function handleSubmit(formData: FormData) {
    console.log('Form submission started')

    if (!currentAccount) {
      console.log('No wallet connected')
      toast.error('Please connect your wallet first')
      return
    }

    console.log('Wallet connected:', currentAccount.address)
    setSubmitting(true)

    try {
      // Convert form data to our format
      const projectData: ProjectFormData = {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        fundingGoal: Number(formData.get('fundingGoal')),
        timeLeft: formData.get('timeLeft') as string,
        imageUrl: formData.get('imageUrl') as string,
        siteUrl: formData.get('siteUrl') as string,
        milestones: milestones
      }

      console.log('Project data:', projectData)

      // Validate milestones total to 100%
      const totalPercent = milestones.reduce((sum, m) => sum + m.percent, 0)
      if (milestones.length > 0 && totalPercent !== 100) {
        console.log('Milestone validation failed, total:', totalPercent)
        toast.error('Milestones must total exactly 100%')
        setSubmitting(false)
        return
      }

      console.log('Creating blockchain transaction...')
      // Create the blockchain transaction
      const tx = createProjectTransaction(projectData)
      console.log('Transaction created:', tx)

      // Sign and execute the transaction
      console.log('Signing transaction...')
      signAndExecuteTransaction(
        { transaction: tx },
        {
          onSuccess: (result) => {
            console.log('✅ Project created successfully!')
            console.log('Transaction result:', result)
            toast.success('Project created successfully!')
            console.log('Redirecting to /dashboard/projects')
            // Add a small delay to let the blockchain sync, then redirect
            setTimeout(() => {
              router.push('/dashboard/projects?refresh=true')
            }, 2000)
          },
          onError: (error) => {
            console.error('❌ Error creating project:', error)
            toast.error('Failed to create project: ' + error.message)
            setSubmitting(false)
          }
        }
      )
    } catch (error) {
      console.error('Error preparing transaction:', error)
      toast.error('Failed to prepare transaction')
      setSubmitting(false)
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
                {currentAccount && (
                  <span className="block text-sm text-green-600 mt-1">
                    Connected: {currentAccount.address.slice(0, 8)}...{currentAccount.address.slice(-4)}
                  </span>
                )}
                {!currentAccount && (
                  <span className="block text-sm text-orange-600 mt-1">
                    Please connect your wallet to create a project
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                handleSubmit(formData)
              }} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" required placeholder="e.g. SUI DeFi Aggregator" />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="fundingGoal">Funding Goal (SUI)</Label>
                  <Input id="fundingGoal" name="fundingGoal" type="number" min={0} step="1" required placeholder="15000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeLeft">Time Left</Label>
                  <Input id="timeLeft" name="timeLeft" placeholder="e.g. 14 days" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Project Image URL</Label>
                  <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://example.com/image.jpg" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Project Website URL</Label>
                  <Input id="siteUrl" name="siteUrl" type="url" placeholder="https://yourproject.com" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Project Description</Label>
                  <Textarea id="description" name="description" rows={6} required placeholder="Tell backers what you're building, your roadmap, and how funds will be used." />
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
                      <Input id="mPercent" type="number" min={0} max={100} value={mPercent} onChange={(e) => setMPercent(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mDate">End date</Label>
                      <Input id="mDate" type="date" value={mDate} onChange={(e) => setMDate(e.target.value)} />
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button type="button" variant="secondary" onClick={addMilestone}>Add Milestone</Button>
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
                  <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                  <Button
                    type="submit"
                    disabled={submitting || !currentAccount}
                  >
                    {submitting ? 'Creating…' : currentAccount ? 'Create Project' : 'Connect Wallet First'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
