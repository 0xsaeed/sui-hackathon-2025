"use client"

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Coins, TrendingUp, TrendingDown } from 'lucide-react'

export function PledgesOverview() {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">My Pledges Overview</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <Coins className="size-4" />
              Active Investments
            </CardDescription>
            <CardTitle className="text-xl">8 Projects</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            Total pledged: 1,250 SUI
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Successful Backs
            </CardDescription>
            <CardTitle className="text-xl">5 Projects</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            62.5% success rate
          </CardFooter>
        </Card>

        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="size-4" />
              Pending Refunds
            </CardDescription>
            <CardTitle className="text-xl">1 Project</CardTitle>
          </CardHeader>
          <CardFooter className="text-sm text-muted-foreground">
            85 SUI to be refunded
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}