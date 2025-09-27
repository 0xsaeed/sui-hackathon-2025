import type { Metadata } from "next"
import "../home.css"

export const metadata: Metadata = {
  title: "Projects • Matryofund",
  description: "Explore on‑chain projects on Matryofund",
}

export default function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="home-scope">{children}</div>
}
