"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { FileText, Check, TrendingUp } from 'lucide-react'

export function ProposalsOverview() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">My Proposals Overview</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <FileText className="size-4" />
              Active Proposals
            </CardDescription>
            <CardTitle className="text-xl">5 Proposals</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Voting ends in 3-7 days
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Check className="size-4" />
              Voted This Month
            </CardDescription>
            <CardTitle className="text-xl">8 Proposals</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            100% participation rate
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Proposals Passed
            </CardDescription>
            <CardTitle className="text-xl">6 of 8</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            75% success rate on votes
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}