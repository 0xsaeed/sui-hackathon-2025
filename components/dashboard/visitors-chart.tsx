"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const pledgesData = [
  { date: "2024-04-06", value: 950 },
  { date: "2024-04-07", value: 975 },
  { date: "2024-04-08", value: 1020 },
  { date: "2024-04-09", value: 1045 },
  { date: "2024-04-10", value: 1080 },
  { date: "2024-04-11", value: 1105 },
  { date: "2024-04-12", value: 1125 },
  { date: "2024-04-13", value: 1140 },
  { date: "2024-04-14", value: 1160 },
  { date: "2024-04-15", value: 1180 },
  { date: "2024-04-16", value: 1200 },
  { date: "2024-04-17", value: 1210 },
  { date: "2024-04-18", value: 1225 },
  { date: "2024-04-19", value: 1235 },
  { date: "2024-04-20", value: 1250 },
  { date: "2024-04-21", value: 1245 },
  { date: "2024-04-22", value: 1240 },
  { date: "2024-04-23", value: 1248 },
  { date: "2024-04-24", value: 1250 },
  { date: "2024-04-25", value: 1250 },
  { date: "2024-04-26", value: 1250 },
  { date: "2024-04-27", value: 1250 },
  { date: "2024-04-28", value: 1250 },
  { date: "2024-04-29", value: 1250 },
  { date: "2024-04-30", value: 1250 },
  { date: "2024-05-01", value: 1250 },
  { date: "2024-05-02", value: 1250 },
  { date: "2024-05-03", value: 1250 },
  { date: "2024-05-04", value: 1250 },
  { date: "2024-05-05", value: 1250 },
  { date: "2024-05-06", value: 1250 },
  { date: "2024-05-07", value: 1250 },
  { date: "2024-05-08", value: 1250 },
  { date: "2024-05-09", value: 1250 },
  { date: "2024-05-10", value: 1250 },
  { date: "2024-05-11", value: 1250 },
  { date: "2024-05-12", value: 1250 },
  { date: "2024-05-13", value: 1250 },
  { date: "2024-05-14", value: 1250 },
  { date: "2024-05-15", value: 1250 },
  { date: "2024-05-16", value: 1250 },
  { date: "2024-05-17", value: 1250 },
  { date: "2024-05-18", value: 1250 },
  { date: "2024-05-19", value: 1250 },
  { date: "2024-05-20", value: 1250 },
  { date: "2024-05-21", value: 1250 },
  { date: "2024-05-22", value: 1250 },
  { date: "2024-05-23", value: 1250 },
  { date: "2024-05-24", value: 1250 },
  { date: "2024-05-25", value: 1250 },
  { date: "2024-05-26", value: 1250 },
  { date: "2024-05-27", value: 1250 },
  { date: "2024-05-28", value: 1250 },
  { date: "2024-05-29", value: 1250 },
  { date: "2024-05-30", value: 1250 },
  { date: "2024-05-31", value: 1250 },
  { date: "2024-06-01", value: 1250 },
  { date: "2024-06-02", value: 1250 },
  { date: "2024-06-03", value: 1250 },
  { date: "2024-06-04", value: 1250 },
  { date: "2024-06-05", value: 1250 },
  { date: "2024-06-06", value: 1250 },
  { date: "2024-06-07", value: 1250 },
  { date: "2024-06-08", value: 1250 },
  { date: "2024-06-09", value: 1250 },
  { date: "2024-06-10", value: 1250 },
  { date: "2024-06-11", value: 1250 },
  { date: "2024-06-12", value: 1250 },
  { date: "2024-06-13", value: 1250 },
  { date: "2024-06-14", value: 1250 },
  { date: "2024-06-15", value: 1250 },
  { date: "2024-06-16", value: 1250 },
  { date: "2024-06-17", value: 1250 },
  { date: "2024-06-18", value: 1250 },
  { date: "2024-06-19", value: 1250 },
  { date: "2024-06-20", value: 1250 },
  { date: "2024-06-21", value: 1250 },
  { date: "2024-06-22", value: 1250 },
  { date: "2024-06-23", value: 1250 },
  { date: "2024-06-24", value: 1250 },
  { date: "2024-06-25", value: 1250 },
  { date: "2024-06-26", value: 1250 },
  { date: "2024-06-27", value: 1250 },
  { date: "2024-06-28", value: 1250 },
  { date: "2024-06-29", value: 1250 },
  { date: "2024-06-30", value: 1250 },
]

const projectsData = [
  { date: "2024-04-06", value: 0 },
  { date: "2024-04-07", value: 0 },
  { date: "2024-04-08", value: 0 },
  { date: "2024-04-09", value: 0 },
  { date: "2024-04-10", value: 0 },
  { date: "2024-04-11", value: 0 },
  { date: "2024-04-12", value: 0 },
  { date: "2024-04-13", value: 0 },
  { date: "2024-04-14", value: 0 },
  { date: "2024-04-15", value: 1 },
  { date: "2024-04-16", value: 1 },
  { date: "2024-04-17", value: 1 },
  { date: "2024-04-18", value: 1 },
  { date: "2024-04-19", value: 1 },
  { date: "2024-04-20", value: 1 },
  { date: "2024-04-21", value: 1 },
  { date: "2024-04-22", value: 1 },
  { date: "2024-04-23", value: 1 },
  { date: "2024-04-24", value: 1 },
  { date: "2024-04-25", value: 1 },
  { date: "2024-04-26", value: 1 },
  { date: "2024-04-27", value: 1 },
  { date: "2024-04-28", value: 1 },
  { date: "2024-04-29", value: 1 },
  { date: "2024-04-30", value: 1 },
  { date: "2024-05-01", value: 1 },
  { date: "2024-05-02", value: 1 },
  { date: "2024-05-03", value: 1 },
  { date: "2024-05-04", value: 1 },
  { date: "2024-05-05", value: 1 },
  { date: "2024-05-06", value: 1 },
  { date: "2024-05-07", value: 1 },
  { date: "2024-05-08", value: 1 },
  { date: "2024-05-09", value: 1 },
  { date: "2024-05-10", value: 1 },
  { date: "2024-05-11", value: 1 },
  { date: "2024-05-12", value: 1 },
  { date: "2024-05-13", value: 1 },
  { date: "2024-05-14", value: 1 },
  { date: "2024-05-15", value: 2 },
  { date: "2024-05-16", value: 2 },
  { date: "2024-05-17", value: 2 },
  { date: "2024-05-18", value: 2 },
  { date: "2024-05-19", value: 2 },
  { date: "2024-05-20", value: 2 },
  { date: "2024-05-21", value: 2 },
  { date: "2024-05-22", value: 2 },
  { date: "2024-05-23", value: 2 },
  { date: "2024-05-24", value: 2 },
  { date: "2024-05-25", value: 2 },
  { date: "2024-05-26", value: 2 },
  { date: "2024-05-27", value: 2 },
  { date: "2024-05-28", value: 2 },
  { date: "2024-05-29", value: 2 },
  { date: "2024-05-30", value: 2 },
  { date: "2024-05-31", value: 2 },
  { date: "2024-06-01", value: 2 },
  { date: "2024-06-02", value: 2 },
  { date: "2024-06-03", value: 2 },
  { date: "2024-06-04", value: 2 },
  { date: "2024-06-05", value: 2 },
  { date: "2024-06-06", value: 2 },
  { date: "2024-06-07", value: 2 },
  { date: "2024-06-08", value: 2 },
  { date: "2024-06-09", value: 2 },
  { date: "2024-06-10", value: 2 },
  { date: "2024-06-11", value: 2 },
  { date: "2024-06-12", value: 2 },
  { date: "2024-06-13", value: 2 },
  { date: "2024-06-14", value: 2 },
  { date: "2024-06-15", value: 3 },
  { date: "2024-06-16", value: 3 },
  { date: "2024-06-17", value: 3 },
  { date: "2024-06-18", value: 3 },
  { date: "2024-06-19", value: 3 },
  { date: "2024-06-20", value: 3 },
  { date: "2024-06-21", value: 3 },
  { date: "2024-06-22", value: 3 },
  { date: "2024-06-23", value: 3 },
  { date: "2024-06-24", value: 3 },
  { date: "2024-06-25", value: 3 },
  { date: "2024-06-26", value: 3 },
  { date: "2024-06-27", value: 3 },
  { date: "2024-06-28", value: 3 },
  { date: "2024-06-29", value: 3 },
  { date: "2024-06-30", value: 3 },
]

const proposalsData = [
  { date: "2024-04-06", value: 20 },
  { date: "2024-04-07", value: 22 },
  { date: "2024-04-08", value: 25 },
  { date: "2024-04-09", value: 27 },
  { date: "2024-04-10", value: 30 },
  { date: "2024-04-11", value: 32 },
  { date: "2024-04-12", value: 33 },
  { date: "2024-04-13", value: 35 },
  { date: "2024-04-14", value: 37 },
  { date: "2024-04-15", value: 38 },
  { date: "2024-04-16", value: 40 },
  { date: "2024-04-17", value: 41 },
  { date: "2024-04-18", value: 42 },
  { date: "2024-04-19", value: 43 },
  { date: "2024-04-20", value: 44 },
  { date: "2024-04-21", value: 44 },
  { date: "2024-04-22", value: 45 },
  { date: "2024-04-23", value: 45 },
  { date: "2024-04-24", value: 45 },
  { date: "2024-04-25", value: 45 },
  { date: "2024-04-26", value: 45 },
  { date: "2024-04-27", value: 45 },
  { date: "2024-04-28", value: 45 },
  { date: "2024-04-29", value: 45 },
  { date: "2024-04-30", value: 45 },
  { date: "2024-05-01", value: 45 },
  { date: "2024-05-02", value: 45 },
  { date: "2024-05-03", value: 45 },
  { date: "2024-05-04", value: 45 },
  { date: "2024-05-05", value: 45 },
  { date: "2024-05-06", value: 45 },
  { date: "2024-05-07", value: 45 },
  { date: "2024-05-08", value: 45 },
  { date: "2024-05-09", value: 45 },
  { date: "2024-05-10", value: 45 },
  { date: "2024-05-11", value: 45 },
  { date: "2024-05-12", value: 45 },
  { date: "2024-05-13", value: 45 },
  { date: "2024-05-14", value: 45 },
  { date: "2024-05-15", value: 45 },
  { date: "2024-05-16", value: 45 },
  { date: "2024-05-17", value: 45 },
  { date: "2024-05-18", value: 45 },
  { date: "2024-05-19", value: 45 },
  { date: "2024-05-20", value: 45 },
  { date: "2024-05-21", value: 45 },
  { date: "2024-05-22", value: 45 },
  { date: "2024-05-23", value: 45 },
  { date: "2024-05-24", value: 45 },
  { date: "2024-05-25", value: 45 },
  { date: "2024-05-26", value: 45 },
  { date: "2024-05-27", value: 45 },
  { date: "2024-05-28", value: 45 },
  { date: "2024-05-29", value: 45 },
  { date: "2024-05-30", value: 45 },
  { date: "2024-05-31", value: 45 },
  { date: "2024-06-01", value: 45 },
  { date: "2024-06-02", value: 45 },
  { date: "2024-06-03", value: 45 },
  { date: "2024-06-04", value: 45 },
  { date: "2024-06-05", value: 45 },
  { date: "2024-06-06", value: 45 },
  { date: "2024-06-07", value: 45 },
  { date: "2024-06-08", value: 45 },
  { date: "2024-06-09", value: 45 },
  { date: "2024-06-10", value: 45 },
  { date: "2024-06-11", value: 45 },
  { date: "2024-06-12", value: 45 },
  { date: "2024-06-13", value: 45 },
  { date: "2024-06-14", value: 45 },
  { date: "2024-06-15", value: 45 },
  { date: "2024-06-16", value: 45 },
  { date: "2024-06-17", value: 45 },
  { date: "2024-06-18", value: 45 },
  { date: "2024-06-19", value: 45 },
  { date: "2024-06-20", value: 45 },
  { date: "2024-06-21", value: 45 },
  { date: "2024-06-22", value: 45 },
  { date: "2024-06-23", value: 45 },
  { date: "2024-06-24", value: 45 },
  { date: "2024-06-25", value: 45 },
  { date: "2024-06-26", value: 45 },
  { date: "2024-06-27", value: 45 },
  { date: "2024-06-28", value: 45 },
  { date: "2024-06-29", value: 45 },
  { date: "2024-06-30", value: 45 },
]

const chartConfigs = {
  pledges: {
    value: {
      label: "SUI Invested",
      color: "hsl(220 100% 60%)",
    },
  },
  projects: {
    value: {
      label: "Projects Created",
      color: "hsl(160 80% 50%)",
    },
  },
  proposals: {
    value: {
      label: "Voting Power",
      color: "hsl(50 100% 60%)",
    },
  },
}

export function VisitorsChart() {
  const [activeTab, setActiveTab] = React.useState("pledges")
  const [timeRange, setTimeRange] = React.useState("90d")

  const getDataForTab = () => {
    switch (activeTab) {
      case "pledges":
        return pledgesData
      case "projects":
        return projectsData
      case "proposals":
        return proposalsData
      default:
        return pledgesData
    }
  }

  const getConfigForTab = () => {
    switch (activeTab) {
      case "pledges":
        return chartConfigs.pledges
      case "projects":
        return chartConfigs.projects
      case "proposals":
        return chartConfigs.proposals
      default:
        return chartConfigs.pledges
    }
  }

  const getTitleForTab = () => {
    switch (activeTab) {
      case "pledges":
        return "My Pledges Overview"
      case "projects":
        return "My Projects Overview"
      case "proposals":
        return "My Proposals Overview"
      default:
        return "My Pledges Overview"
    }
  }

  const getDescriptionForTab = () => {
    switch (activeTab) {
      case "pledges":
        return "Total SUI invested over time"
      case "projects":
        return "Projects created over time"
      case "proposals":
        return "Voting power growth over time"
      default:
        return "Total SUI invested over time"
    }
  }

  const filteredData = getDataForTab().filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{getTitleForTab()}</CardTitle>
            <p className="text-sm text-muted-foreground">{getDescriptionForTab()}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange("90d")}
              className={`px-3 py-1 text-xs rounded ${timeRange === "90d" ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Last 3 months
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1 text-xs rounded ${timeRange === "30d" ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Last 30 days
            </button>
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1 text-xs rounded ${timeRange === "7d" ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
            >
              Last 7 days
            </button>
          </div>
        </div>
        <div className="flex space-x-1 mt-4">
          <button
            onClick={() => setActiveTab("pledges")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "pledges"
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            My Pledges
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "projects"
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            My Projects
          </button>
          <button
            onClick={() => setActiveTab("proposals")}
            className={`px-4 py-2 text-sm rounded-md transition-colors ${
              activeTab === "proposals"
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            My Proposals
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={getConfigForTab()}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={getConfigForTab().value.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={getConfigForTab().value.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted-foreground/20" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              className="fill-muted-foreground"
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillValue)"
              stroke={getConfigForTab().value.color}
              strokeWidth={2}
              strokeOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}