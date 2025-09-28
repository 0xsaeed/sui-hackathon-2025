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
import { Folder, Users, Calendar, Target, TrendingUp, ExternalLink, Edit, RefreshCw } from 'lucide-react'
import { useSuiClient } from '@mysten/dapp-kit'
import { getProjectsFromBlockchain, blockchainToUIProject } from '@/lib/blockchain'
import { SEED_PROJECTS, type Project } from '@/lib/projects'
import React from 'react'


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
  const suiClient = useSuiClient()
  const [projects, setProjects] = React.useState<Project[]>(SEED_PROJECTS)
  const [loading, setLoading] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)

  const loadProjectsFromBlockchain = React.useCallback(async () => {
    console.log('🔄 Loading projects from blockchain...')
    setLoading(true)
    try {
      const blockchainProjects = await getProjectsFromBlockchain(suiClient)
      console.log('📊 Blockchain projects found:', blockchainProjects.length)
      console.log('📋 Blockchain projects data:', blockchainProjects)

      if (blockchainProjects.length > 0) {
        const uiProjects = blockchainProjects.map(blockchainToUIProject)
        console.log('✅ Converted to UI projects:', uiProjects)
        setProjects(uiProjects)
        setLastUpdated(new Date())
        console.log('✅ Projects updated in state')
      } else {
        console.log('⚠️ No blockchain projects found, using seed data')
        setProjects(SEED_PROJECTS)
      }
    } catch (error) {
      console.error('❌ Error loading projects from blockchain:', error)
      console.log('⚠️ Falling back to seed data due to error')
      setProjects(SEED_PROJECTS)
    } finally {
      setLoading(false)
      console.log('🏁 Project loading completed')
    }
  }, [suiClient])

  // Load projects on component mount
  React.useEffect(() => {
    loadProjectsFromBlockchain()
  }, [loadProjectsFromBlockchain])

  // Check for refresh parameter from project creation
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('refresh') === 'true') {
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname)
      // Force a refresh after a short delay
      setTimeout(() => {
        console.log('Auto-refreshing after project creation...')
        loadProjectsFromBlockchain()
      }, 1000)
    }
  }, [])

  const totalRaised = projects.reduce((sum, project) => sum + (project as any).currentFunding, 0)
  const totalBackers = projects.reduce((sum, project) => sum + project.backers, 0)
  const activeProjects = projects.filter(p => p.status === "active" || p.status === "live").length

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
                  {projects.length}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Project Portfolio</CardTitle>
                  <CardDescription>
                    Overview of all your created projects
                    {lastUpdated && (
                      <span className="block text-xs text-muted-foreground mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadProjectsFromBlockchain}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          <Badge className={`text-xs ${getStatusColor(project.status)}`}>
                            {project.status}
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
                        <p className="font-semibold">{(project as any).currentFunding?.toLocaleString()} SUI</p>
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
                        <span>{Math.round(((project as any).currentFunding / project.fundingGoal) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(((project as any).currentFunding / project.fundingGoal) * 100, 100)}%` }}
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
