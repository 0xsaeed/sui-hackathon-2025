"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { PledgesOverview } from '@/components/dashboard/pledges-overview'
import { ProjectsOverview } from '@/components/dashboard/projects-overview'
import { ProposalsOverview } from '@/components/dashboard/proposals-overview'
import { VisitorsChart } from '@/components/dashboard/visitors-chart'

export default function Page() {
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
          <StatsCards />
          <VisitorsChart />
          <PledgesOverview />
          <ProjectsOverview />
          <ProposalsOverview />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}