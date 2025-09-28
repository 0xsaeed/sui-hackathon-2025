"use client"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, Users, Calendar, Clock, TrendingUp, Search, ArrowUpDown, RefreshCw } from "lucide-react"
import Link from "next/link"
import React from "react"
import { SEED_PROJECTS, type Project, getProjectsClient, percentFunded, sortProjects, type SortKey } from "@/lib/projects"
import { useSuiClient } from "@mysten/dapp-kit"
import { getProjectsFromBlockchain, blockchainToUIProject } from "@/lib/blockchain"

const getStatusColor = (status: Project["status"]) => {
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
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<SortKey>("trending")
  const [projects, setProjects] = React.useState<Project[]>(SEED_PROJECTS)
  const [loading, setLoading] = React.useState(false)
  const suiClient = useSuiClient()

  const loadProjects = React.useCallback(async () => {
    setLoading(true)
    try {
      // Try to load from blockchain first
      const blockchainProjects = await getProjectsFromBlockchain(suiClient)
      if (blockchainProjects.length > 0) {
        const uiProjects = blockchainProjects.map(blockchainToUIProject)
        setProjects(uiProjects)
        console.log('Loaded', uiProjects.length, 'projects from blockchain')
      } else {
        // Fallback to seed data
        console.log('No blockchain projects found, using seed data')
        setProjects(SEED_PROJECTS)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
      // Fallback to seed data on error
      setProjects(SEED_PROJECTS)
    } finally {
      setLoading(false)
    }
  }, [suiClient])

  React.useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Auto-refresh every 30 seconds to catch new projects
  React.useEffect(() => {
    const interval = setInterval(loadProjects, 30000)
    return () => clearInterval(interval)
  }, [loadProjects])

  const filtered = projects.filter((p) => {
    const matchesQuery = [p.name, p.description].join(" ").toLowerCase().includes(query.toLowerCase())
    return matchesQuery
  })

  const sorted = sortProjects(filtered, sortKey)

  const totalRaised = projects.reduce((sum, p) => sum + p.currentFunding, 0)
  const totalBackers = projects.reduce((sum, p) => sum + p.backers, 0)
  const liveCount = projects.filter((p) => p.status === "active" || p.status === "live").length
  const fundedCount = projects.filter((p) => p.status === "funded").length

  return (
    <>
      <Header />
      <div className="container pt-28 md:pt-36 pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Explore Projects</h1>
            <p className="text-foreground/60 mt-2 max-w-2xl">
              Discover and back on‑chain initiatives on Matryofund. Filter by category or search to find what inspires you.
            </p>
          </div>
          <div className="w-full md:w-auto flex gap-3 items-center">
            <div className="relative">
              <Input
                placeholder="Search projects…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 w-full md:w-[320px]"
              />
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadProjects}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-foreground/60" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent border rounded-md px-3 py-2 text-sm"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="ending">Ending soon</option>
              </select>
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Live Projects</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <Folder className="size-5" /> {liveCount}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Currently funding</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Funded</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <TrendingUp className="size-5" /> {fundedCount}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Successfully reached goal</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Total Raised</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">{totalRaised.toLocaleString()} SUI</CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Across all projects</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Total Backers</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <Users className="size-5" /> {totalBackers}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Unique supporters</CardFooter>
          </Card>
        </div>

        <div id="projects" className="mt-10">
          {/* Debug info */}
          <div className="mb-4 p-4 bg-muted/50 rounded-lg text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>Total projects loaded: {projects.length}</p>
            <p>Projects showing: {sorted.length}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>Data source: {projects.length > 0 && projects[0].id > 10000 ? 'Blockchain' : 'Seed Data'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorted.map((project) => {
              const pct = percentFunded(project)
              return (
                <Card key={project.id} className="hover:bg-muted/30 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{project.name}</h3>
                      <Badge className={`text-xs ${getStatusColor(project.status)}`}>{project.status}</Badge>
                    </div>
                    <CardDescription className="mt-1">{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-foreground/60">Funding Goal</p>
                        <p className="font-semibold">{project.fundingGoal.toLocaleString()} SUI</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Raised</p>
                        <p className="font-semibold">{project.currentFunding.toLocaleString()} SUI</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Backers</p>
                        <p className="font-semibold">{project.backers}</p>
                      </div>
                      <div>
                        <p className="text-foreground/60">Time Left</p>
                        <p className="font-semibold">{project.timeLeft}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(pct)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-foreground/60">
                      <span className="inline-flex items-center gap-1"><Calendar className="size-3" /> Created {new Date(project.createdDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {project.timeLeft}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        console.log('Navigating to project:', project.id, project.name)
                        console.log('Project data:', project)
                      }}
                      asChild
                    >
                      <Link href={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
