"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, LogOut } from 'lucide-react'

const getPageTitle = (pathname: string) => {
  switch (pathname) {
    case "/dashboard":
      return "My Dashboard"
    case "/dashboard/pledges":
      return "My Pledges"
    case "/dashboard/projects":
      return "My Projects"
    case "/dashboard/proposals":
      return "My Proposals"
    default:
      return "My Dashboard"
  }
}

export function SiteHeader() {
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)
  const isProjectsPage = pathname === "/dashboard/projects"
  const walletAddress = "0x6f6c2df75d7710c1117aa94c01c6724c10e1b658c7e99d081ee5c8cb6c22fc98"
  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`

  const handleDisconnect = () => {
    // Handle wallet disconnect logic here
    console.log("Disconnecting wallet...")
  }

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">
        <div className="flex items-center gap-1 lg:gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <h1 className="text-base font-medium">{pageTitle}</h1>
          {isProjectsPage && (
            <Button size="sm" className="ml-4">
              <Plus className="size-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded-md transition-colors">
              {/* Light mode logo */}
              <Image
                src="/sui-logo-black.svg"
                alt="SUI Logo"
                width={16}
                height={16}
                className="opacity-60 dark:hidden"
              />
              {/* Dark mode logo */}
              <Image
                src="/sui-logo-white.svg"
                alt="SUI Logo"
                width={16}
                height={16}
                className="opacity-80 hidden dark:block"
              />
              <span className="text-sm text-muted-foreground font-mono">
                {truncatedAddress}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600" onClick={handleDisconnect}>
              <LogOut className="size-4" />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
