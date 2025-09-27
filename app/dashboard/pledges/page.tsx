"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Coins, Clock, CheckCircle, XCircle, ExternalLink, TrendingDown } from 'lucide-react'

const pledgesData = [
  {
    id: 1,
    projectName: "SUI DeFi Protocol",
    amount: 250,
    status: "active",
    pledgedDate: "2024-06-15",
    fundingGoal: 10000,
    currentFunding: 8500,
    category: "DeFi",
    timeLeft: "12 days",
  },
  {
    id: 2,
    projectName: "NFT Marketplace",
    amount: 180,
    status: "successful",
    pledgedDate: "2024-05-20",
    fundingGoal: 5000,
    currentFunding: 5200,
    category: "NFTs",
    timeLeft: "Completed",
  },
  {
    id: 3,
    projectName: "Gaming Platform",
    amount: 320,
    status: "active",
    pledgedDate: "2024-06-10",
    fundingGoal: 15000,
    currentFunding: 12000,
    category: "Gaming",
    timeLeft: "8 days",
  },
  {
    id: 4,
    projectName: "Social Impact Fund",
    amount: 150,
    status: "successful",
    pledgedDate: "2024-04-25",
    fundingGoal: 8000,
    currentFunding: 8500,
    category: "Social",
    timeLeft: "Completed",
  },
  {
    id: 5,
    projectName: "AI Research Lab",
    amount: 200,
    status: "active",
    pledgedDate: "2024-06-20",
    fundingGoal: 20000,
    currentFunding: 15000,
    category: "AI/ML",
    timeLeft: "15 days",
  },
  {
    id: 6,
    projectName: "Green Energy Initiative",
    amount: 100,
    status: "failed",
    pledgedDate: "2024-05-01",
    fundingGoal: 12000,
    currentFunding: 4500,
    category: "Energy",
    timeLeft: "Failed",
  },
  {
    id: 7,
    projectName: "Educational Platform",
    amount: 75,
    status: "successful",
    pledgedDate: "2024-03-15",
    fundingGoal: 6000,
    currentFunding: 6800,
    category: "Education",
    timeLeft: "Completed",
  },
  {
    id: 8,
    projectName: "Healthcare Analytics",
    amount: 300,
    status: "active",
    pledgedDate: "2024-06-25",
    fundingGoal: 18000,
    currentFunding: 14000,
    category: "Healthcare",
    timeLeft: "20 days",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "successful":
      return "bg-green-100 text-green-800 border-green-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Clock className="size-3" />
    case "successful":
      return <CheckCircle className="size-3" />
    case "failed":
      return <XCircle className="size-3" />
    default:
      return <Clock className="size-3" />
  }
}

export default function PledgesPage() {
  const totalPledged = pledgesData.reduce((sum, pledge) => sum + pledge.amount, 0)
  const activePledges = pledgesData.filter(p => p.status === "active").length
  const successfulPledges = pledgesData.filter(p => p.status === "successful").length
  const failedPledges = pledgesData.filter(p => p.status === "failed")
  const pendingRefunds = failedPledges.reduce((sum, pledge) => sum + pledge.amount, 0)

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

          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Pledged</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Coins className="size-5" />
                  {totalPledged} SUI
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Across {pledgesData.length} projects
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Pending Refunds</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <TrendingDown className="size-5" />
                  {failedPledges.length}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                {pendingRefunds} SUI to be refunded
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Active Pledges</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Clock className="size-5" />
                  {activePledges}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Projects currently funding
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Successful Backs</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <CheckCircle className="size-5" />
                  {successfulPledges}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                {((successfulPledges / pledgesData.length) * 100).toFixed(1)}% success rate
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Pledges</CardTitle>
              <CardDescription>Complete list of your project pledges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pledgesData.map((pledge) => (
                  <div key={pledge.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{pledge.projectName}</h3>
                          <Badge className={`text-xs ${getStatusColor(pledge.status)}`}>
                            {getStatusIcon(pledge.status)}
                            {pledge.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {pledge.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Pledged</p>
                        <p className="font-semibold">{pledge.amount} SUI</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Funding Goal</p>
                        <p className="font-semibold">{pledge.fundingGoal.toLocaleString()} SUI</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Current Funding</p>
                        <p className="font-semibold">{pledge.currentFunding.toLocaleString()} SUI</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Time Left</p>
                        <p className="font-semibold">{pledge.timeLeft}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Progress ({pledge.currentFunding.toLocaleString()}/{pledge.fundingGoal.toLocaleString()})
                        </span>
                        <span>{Math.round((pledge.currentFunding / pledge.fundingGoal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((pledge.currentFunding / pledge.fundingGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        Pledged {new Date(pledge.pledgedDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
