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
import { Folder, Users, Calendar, Target, TrendingUp, ExternalLink, Edit } from 'lucide-react'

const projectsData = [
  {
    id: 1,
    name: "SUI DeFi Aggregator",
    description: "Advanced DeFi protocol aggregating multiple yield farming opportunities on Sui blockchain",
    status: "active",
    createdDate: "2024-04-15",
    fundingGoal: 15000,
    currentFunding: 12500,
    backers: 47,
    category: "DeFi",
    timeLeft: "12 days",
    raised: 580,
  },
  {
    id: 2,
    name: "NFT Creator Studio",
    description: "Comprehensive platform for creating, minting, and trading NFTs with AI-powered tools",
    status: "funded",
    createdDate: "2024-05-20",
    fundingGoal: 8000,
    currentFunding: 8500,
    backers: 32,
    category: "NFTs",
    timeLeft: "Completed",
    raised: 8500,
  },
  {
    id: 3,
    name: "Sustainable Energy Tracker",
    description: "Blockchain-based carbon credit tracking and renewable energy marketplace",
    status: "live",
    createdDate: "2024-06-15",
    fundingGoal: 20000,
    currentFunding: 18500,
    backers: 73,
    category: "Sustainability",
    timeLeft: "8 days",
    raised: 18500,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "funded":
      return "bg-green-100 text-green-800 border-green-200"
    case "live":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export default function ProjectsPage() {
  const totalRaised = projectsData.reduce((sum, project) => sum + project.raised, 0)
  const totalBackers = projectsData.reduce((sum, project) => sum + project.backers, 0)
  const activeProjects = projectsData.filter(p => p.status === "active" || p.status === "live").length

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
                <CardDescription>Total Projects</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Folder className="size-5" />
                  {projectsData.length}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                {activeProjects} currently active
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Raised</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  {totalRaised.toLocaleString()} SUI
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Across all projects
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Total Backers</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Users className="size-5" />
                  {totalBackers}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Unique supporters
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Success Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Target className="size-5" />
                  67%
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                2 of 3 funded
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Portfolio</CardTitle>
              <CardDescription>Overview of all your created projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projectsData.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {project.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {project.category}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-2xl">{project.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Funding Goal</p>
                        <p className="font-semibold">{project.fundingGoal.toLocaleString()} SUI</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Current Funding</p>
                        <p className="font-semibold">{project.currentFunding.toLocaleString()} SUI</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Backers</p>
                        <p className="font-semibold">{project.backers}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Time Left</p>
                        <p className="font-semibold">{project.timeLeft}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round((project.currentFunding / project.fundingGoal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((project.currentFunding / project.fundingGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        Created {new Date(project.createdDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="size-3" />
                        {project.backers} backers
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
