"use client"

import { usePathname } from "next/navigation"
import Image from "next/image"
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Plus } from 'lucide-react'
import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'
import { WalletPill } from '@/components/wallet-pill'

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
  const account = useCurrentAccount()

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
            <Button size="sm" className="ml-4" asChild>
              <a href="/dashboard/projects/new">
                <Plus className="size-4 mr-2" />
                Create Project
              </a>
            </Button>
          )}
        </div>
        {account?.address ? (
          <WalletPill />
        ) : (
          <ConnectButton />
        )}
      </div>
    </header>
  )
}
