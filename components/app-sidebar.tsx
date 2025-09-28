"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFileText,
  IconFolder,
  IconGridDots,
  IconHome,
  IconMoon,
  IconSun,
} from "@tabler/icons-react"
import Image from "next/image"
import Link from "next/link"
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
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    if (!mounted) return

    if (resolvedTheme === "dark") {
      setTheme("light")
    } else {
      setTheme("dark")
    }
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
                  className="block shrink-0 dark:hidden opacity-100"
                  priority
                />
                <Image
                  src="/applogo-white.svg"
                  alt="Matryofund"
                  width={20}
                  height={20}
                  className="shrink-0 hidden dark:block opacity-100"
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
        <div className="flex items-center justify-between w-full p-2">
          <span className="text-sm font-medium">Theme</span>
          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-8 w-16 items-center justify-between rounded-full px-2 transition-colors focus:outline-none ${
              mounted && resolvedTheme === "dark" ? "bg-slate-800" : "bg-slate-200"
            }`}
            disabled={!mounted}
          >
            {/* Sun icon on the left */}
            <IconSun className={`size-3 transition-colors ${
              mounted && resolvedTheme === "light" ? "text-yellow-500" : "text-slate-400"
            }`} />

            {/* Moon icon on the right */}
            <IconMoon className={`size-3 transition-colors ${
              mounted && resolvedTheme === "dark" ? "text-slate-300" : "text-slate-400"
            }`} />

            {/* Toggle circle */}
            <span
              className={`absolute inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                mounted && resolvedTheme === "dark" ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
          asChild
        >
          <Link href="/">
            <IconHome className="size-4" />
            Back to Home
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
