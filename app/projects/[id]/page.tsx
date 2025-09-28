import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, Target, ArrowLeft } from "lucide-react"
import type { Milestone } from "@/lib/projects"
import { getProjectsServer, percentFunded } from "@/lib/projects"

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const projects = await getProjectsServer()
  const project = projects.find((p) => p.id === Number(id))
  if (!project) return notFound()
  const pct = percentFunded(project)

  return (
    <>
      <Header />
      <div className="container pt-28 md:pt-36 pb-12">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Projects
        </Link>

        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <Badge className="capitalize">{project.status}</Badge>
            </div>
            <CardDescription>{project.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div>
                  <p className="text-foreground/60 text-sm">Funding Goal</p>
                  <p className="font-semibold">{project.fundingGoal.toLocaleString()} SUI</p>
                </div>
                <div>
                  <p className="text-foreground/60 text-sm">Raised</p>
                  <p className="font-semibold">{project.currentFunding.toLocaleString()} SUI</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Users className="size-4" /> {project.backers} backers
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Calendar className="size-4" /> Created {new Date(project.createdDate).toLocaleDateString()}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(pct)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <Button className="">Back This Project</Button>
                  <Button variant="outline">Share</Button>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">About this project</h3>
                  <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </div>
                {project.milestones?.length ? (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-3">Milestones</h3>
                    <div className="space-y-3">
                      {project.milestones.map((m: Milestone, i: number) => (
                        <div key={i} className="border rounded-md p-4">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{m.title}</p>
                            <span className="text-xs text-foreground/60">Due {new Date(m.endDate).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Relative Share</span>
                              <span>{m.percent}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(m.percent, 100)}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-foreground/60">
            <div className="flex items-center gap-2">
              <Target className="size-3" /> Goal {project.fundingGoal.toLocaleString()} SUI
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
