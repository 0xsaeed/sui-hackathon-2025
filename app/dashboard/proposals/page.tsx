"use client"

import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Vote, ThumbsUp, ThumbsDown, Clock, CheckCircle, XCircle, FileText, TrendingUp } from 'lucide-react'

const proposalsData = [
  {
    id: 1,
    title: "Increase Platform Fee for Sustainability",
    description: "Proposal to increase the platform fee from 2% to 2.5% to fund platform development and sustainability initiatives",
    status: "active",
    createdDate: "2024-06-20",
    endDate: "2024-07-05",
    category: "Platform",
    votesFor: 342,
    votesAgainst: 128,
    totalVotes: 470,
    requiredVotes: 500,
    myVote: "for",
    votingPower: 12,
  },
  {
    id: 2,
    title: "New DeFi Category Guidelines",
    description: "Establish clear guidelines and requirements for DeFi projects to ensure security and transparency standards",
    status: "passed",
    createdDate: "2024-05-15",
    endDate: "2024-06-01",
    category: "Guidelines",
    votesFor: 567,
    votesAgainst: 143,
    totalVotes: 710,
    requiredVotes: 500,
    myVote: "for",
    votingPower: 8,
  },
  {
    id: 3,
    title: "Community Treasury Allocation",
    description: "Allocate 50,000 SUI from community treasury for educational initiatives and developer grants",
    status: "active",
    createdDate: "2024-06-25",
    endDate: "2024-07-10",
    category: "Treasury",
    votesFor: 289,
    votesAgainst: 156,
    totalVotes: 445,
    requiredVotes: 500,
    myVote: "for",
    votingPower: 15,
  },
  {
    id: 4,
    title: "NFT Marketplace Integration",
    description: "Integrate dedicated NFT marketplace features within the platform to support digital art projects",
    status: "failed",
    createdDate: "2024-04-10",
    endDate: "2024-04-25",
    category: "Features",
    votesFor: 234,
    votesAgainst: 389,
    totalVotes: 623,
    requiredVotes: 500,
    myVote: "against",
    votingPower: 5,
  },
  {
    id: 5,
    title: "Quarterly Community Rewards",
    description: "Implement quarterly rewards program for active community members based on participation and contributions",
    status: "active",
    createdDate: "2024-06-28",
    endDate: "2024-07-15",
    category: "Community",
    votesFor: 412,
    votesAgainst: 87,
    totalVotes: 499,
    requiredVotes: 500,
    myVote: "for",
    votingPower: 10,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "passed":
      return "bg-green-100 text-green-800 border-green-200"
    case "failed":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <Clock className="size-3" />
    case "passed":
      return <CheckCircle className="size-3" />
    case "failed":
      return <XCircle className="size-3" />
    default:
      return <Clock className="size-3" />
  }
}

const getVoteIcon = (vote: string) => {
  return vote === "for" ? <ThumbsUp className="size-3" /> : <ThumbsDown className="size-3" />
}

const getVoteColor = (vote: string) => {
  return vote === "for" ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"
}

export default function ProposalsPage() {
  const totalVotingPower = proposalsData.reduce((sum, proposal) => sum + proposal.votingPower, 0)
  const activeProposals = proposalsData.filter(p => p.status === "active").length
  const passedProposals = proposalsData.filter(p => p.status === "passed").length
  const totalProposalsVoted = proposalsData.length

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

          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-4">
            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Voting Power</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Vote className="size-5" />
                  {totalVotingPower}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Current total power
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Proposals Voted</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <FileText className="size-5" />
                  {totalProposalsVoted}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Total participation
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Active Proposals</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <Clock className="size-5" />
                  {activeProposals}
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Currently voting
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription>Success Rate</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  {Math.round((passedProposals / (passedProposals + proposalsData.filter(p => p.status === "failed").length)) * 100)}%
                </CardTitle>
              </CardHeader>
              <CardFooter className="text-sm text-muted-foreground">
                Voted with majority
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Voting History</CardTitle>
              <CardDescription>All proposals you’ve participated in</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {proposalsData.map((proposal) => (
                  <div key={proposal.id} className="border rounded-lg p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">{proposal.title}</h3>
                          <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                            {getStatusIcon(proposal.status)}
                            {proposal.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {proposal.category}
                          </Badge>
                          <Badge className={`text-xs ${getVoteColor(proposal.myVote)}`}>
                            {getVoteIcon(proposal.myVote)}
                            Voted {proposal.myVote}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-2xl">{proposal.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{proposal.votingPower} VP</p>
                        <p className="text-xs text-muted-foreground">Your power</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Votes For</p>
                        <p className="font-semibold text-green-600">{proposal.votesFor}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Votes Against</p>
                        <p className="font-semibold text-red-600">{proposal.votesAgainst}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Votes</p>
                        <p className="font-semibold">{proposal.totalVotes}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Required</p>
                        <p className="font-semibold">{proposal.requiredVotes}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress ({proposal.totalVotes}/{proposal.requiredVotes})</span>
                        <span>{Math.round((proposal.totalVotes / proposal.requiredVotes) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min((proposal.totalVotes / proposal.requiredVotes) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Created {new Date(proposal.createdDate).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Ends {new Date(proposal.endDate).toLocaleDateString()}</span>
                      </div>
                      {proposal.status === "active" && (
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
