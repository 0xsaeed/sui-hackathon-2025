"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Folder, TrendingUp, Coins } from 'lucide-react'

export function ProjectsOverview() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">My Projects Overview</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Folder className="size-4" />
              Live Projects
            </CardDescription>
            <CardTitle className="text-xl">1 Project</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            45% funded, 12 days left
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Successful Projects
            </CardDescription>
            <CardTitle className="text-xl">2 Projects</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            580 SUI raised total
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Coins className="size-4" />
              Total Backers
            </CardDescription>
            <CardTitle className="text-xl">47 People</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Across all projects
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}