"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileText,
  IconFolder,
  IconGridDots,
  IconInnerShadowTop,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import { NavMain } from '@/components/nav-main'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useTheme } from "next-themes"

const data = {
  navMain: [
    {
      title: "My Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "My Pledges",
      url: "/dashboard/pledges",
      icon: IconGridDots,
    },
    {
      title: "My Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "My Proposals",
      url: "/dashboard/proposals",
      icon: IconFileText,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Matryofund</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-2"
        >
          {theme === "dark" ? (
            <>
              <IconSun className="size-4" />
              Light Mode
            </>
          ) : (
            <>
              <IconMoon className="size-4" />
              Dark Mode
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
