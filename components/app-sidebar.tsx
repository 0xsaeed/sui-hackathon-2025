"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileText,
  IconFolder,
  IconGridDots,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import Image from "next/image"
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
              <a href="/dashboard" className="flex items-center gap-2">
                {/* Small logo to the left of wordmark */}
                <Image
                  src="/applogo-black.svg"
                  alt="Matryofund"
                  width={20}
                  height={20}
                  className="shrink-0 dark:hidden"
                  priority
                />
                <Image
                  src="/applogo-white.svg"
                  alt="Matryofund"
                  width={20}
                  height={20}
                  className="shrink-0 hidden dark:block"
                  priority
                />
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
