"use client"

import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, Users, Calendar, Clock, TrendingUp, Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import React from "react"
import { getProjectsServer, percentFunded, type UIProject } from "@/lib/project"

type SortKey = "trending" | "newest" | "ending"

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "funding":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "active":
      return "bg-green-100 text-green-800 border-green-200"
    case "voting":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "closed":
      return "bg-slate-200 text-slate-800 border-slate-300"
    case "failed":
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function categoryLabel(project: UIProject) {
  const raw = project.category?.trim()
  return raw && raw.length > 0 ? raw : "Uncategorized"
}

function formatSui(n: number) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function timeLeftLabel(project: UIProject) {
  const deadline = project.fundingDeadline
  if (!deadline) return "—"

  const diff = deadline - Date.now()
  if (diff <= 0) return "Funding closed"

  const hours = Math.round(diff / (1000 * 60 * 60))
  if (hours < 24) {
    return `${Math.max(hours, 1)}h left`
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days < 14) {
    return `${days} day${days === 1 ? "" : "s"} left`
  }

  const weeks = Math.ceil(days / 7)
  return `${weeks} wk${weeks === 1 ? "" : "s"} left`
}

function sortProjects(list: UIProject[], sort: SortKey): UIProject[] {
  const copy = [...list]
  switch (sort) {
    case "trending":
      return copy.sort((a, b) => {
        const diff = percentFunded(b) - percentFunded(a)
        if (diff !== 0) return diff
        return b.currentFunding - a.currentFunding
      })
    case "newest":
      return copy.sort((a, b) => (b.createdDate ?? 0) - (a.createdDate ?? 0))
    case "ending": {
      const deadline = (p: UIProject) => p.fundingDeadline ?? Number.MAX_SAFE_INTEGER
      return copy.sort((a, b) => deadline(a) - deadline(b))
    }
    default:
      return copy
  }
}

export default function ProjectsPage() {
  const [query, setQuery] = React.useState("")
  const [activeCategory, setActiveCategory] = React.useState<string>("All")
  const [sortKey, setSortKey] = React.useState<SortKey>("trending")
  const [projects, setProjects] = React.useState<UIProject[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let mounted = true

    const fetchProjects = async () => {
      try {
        const data = await getProjectsServer()
        if (!mounted) return
        setProjects(data)
        setError(null)
      } catch (err) {
        if (!mounted) return
        const message = err instanceof Error ? err.message : "Failed to load projects"
        setError(message)
      } finally {
        if (!mounted) return
        setLoading(false)
      }
    }

    fetchProjects()

    return () => {
      mounted = false
    }
  }, [])

  const categories = React.useMemo(() => {
    const set = new Set<string>(["All"])
    let hasUncategorized = false

    projects.forEach((project) => {
      const raw = project.category?.trim()
      if (raw && raw.length > 0) {
        set.add(raw)
      } else {
        hasUncategorized = true
      }
    })

    if (hasUncategorized) {
      set.add("Uncategorized")
    }

    return Array.from(set)
  }, [projects])

  React.useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("All")
    }
  }, [categories, activeCategory])

  const normalizedQuery = query.trim().toLowerCase()

  const filtered = projects.filter((project) => {
    const category = categoryLabel(project)
    const matchesCategory = activeCategory === "All" || category === activeCategory
    if (!matchesCategory) return false

    if (!normalizedQuery) return true

    const haystack = [project.title, project.description, category, project.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return haystack.includes(normalizedQuery)
  })

  const sorted = sortProjects(filtered, sortKey)

  const totalRaised = projects.reduce((sum, p) => sum + p.currentFunding, 0)
  const totalBackers = projects.reduce((sum, p) => sum + (p.backers ?? 0), 0)
  const liveStatuses = new Set(["funding", "active", "voting"])
  const liveCount = projects.filter((p) => liveStatuses.has(p.status)).length
  const fundedCount = projects.filter((p) => ["closed", "funded"].includes(p.status)).length

  return (
    <>
      <Header />
      <div className="container pt-28 md:pt-36 pb-12">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold">Explore Projects</h1>
            <p className="text-foreground/60 mt-2 max-w-2xl">
              Discover and back on-chain initiatives on Matryofund. Filter by status or search to find what inspires you.
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
            <div className="flex items-center gap-2">
              <ArrowUpDown className="size-4 text-foreground/60" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent border rounded-md px-2 py-1 text-sm"
              >
                <option value="trending">Trending</option>
                <option value="newest">Newest</option>
                <option value="ending">Ending soon</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                activeCategory === c ? "bg-primary text-black border-primary" : "bg-transparent hover:bg-white/5 border-border"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 mt-8 md:grid-cols-2 lg:grid-cols-4">
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Live Projects</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <Folder className="size-5" /> {loading ? "—" : liveCount}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Currently funding</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Funded</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <TrendingUp className="size-5" /> {loading ? "—" : fundedCount}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Successfully reached goal</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Total Raised</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {loading ? "—" : `${formatSui(totalRaised)} SUI`}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Across all projects</CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Total Backers</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                <Users className="size-5" /> {loading ? "—" : totalBackers}
              </CardTitle>
            </CardHeader>
            <CardFooter className="text-sm text-muted-foreground">Unique supporters</CardFooter>
          </Card>
        </div>

        <div id="projects" className="mt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => (
                <Card key={`placeholder-${idx}`} className="h-56 animate-pulse bg-muted/30" />
              ))
            ) : error ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">Failed to load projects</CardTitle>
                  <CardDescription>{error}</CardDescription>
                </CardHeader>
              </Card>
            ) : sorted.length === 0 ? (
              <Card className="md:col-span-2 xl:col-span-3">
                <CardHeader>
                  <CardTitle className="text-lg">No projects yet</CardTitle>
                  <CardDescription>
                    We couldn&apos;t find any on-chain projects for this package. Create one to see it here.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              sorted.map((project) => {
                const pct = percentFunded(project)
                const category = categoryLabel(project)
                const timeLeft = timeLeftLabel(project)
                const milestoneCount = project.milestones.length

                return (
                  <Card key={project.id} className="hover:bg-muted/30 transition-colors">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{project.title}</h3>
                        <Badge className={`text-xs capitalize ${getStatusColor(project.status)}`}>
                          {project.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {category}
                        </Badge>
                      </div>
                      <CardDescription className="mt-1 line-clamp-3">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-foreground/60">Funding Goal</p>
                          <p className="font-semibold">{formatSui(project.fundingGoal)} SUI</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Raised</p>
                          <p className="font-semibold">{formatSui(project.currentFunding)} SUI</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Backers</p>
                          <p className="font-semibold">{project.backers ?? "—"}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Milestones</p>
                          <p className="font-semibold">{milestoneCount || "—"}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
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
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3" /> Created {new Date(project.createdDate).toLocaleDateString()}
                        </span>
                        {timeLeft !== "—" && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="size-3" /> {timeLeft}
                            </span>
                          </>
                        )}
                      </div>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/projects/${project.id}`}>View Project</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </div>
    </>
  )
}
