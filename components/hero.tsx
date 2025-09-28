"use client";

import Link from "next/link";
import { GL } from "./gl/index";
import { Pill } from "./pill";
import { ButtonHome } from "./ui/button-home";
import { useState } from "react";

export function Hero() {
  const [hovering, setHovering] = useState(false);
  return (
    <div className="flex flex-col h-svh justify-between">
      <GL hovering={hovering} />

      <div className="pb-16 mt-auto text-center relative">
        <Pill className="mb-6">BETA RELEASE</Pill>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-sentient">
          Create, Support, Earn <br />
          <i className="font-light">Secure</i> on-chain
        </h1>
        <p className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[440px] mx-auto">
          Support the projects you believe in and release funds step by step as milestones are achieved.
        </p>

        <Link className="contents max-sm:hidden" href="/projects">
          <ButtonHome
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            Browse Projects
          </ButtonHome>
        </Link>
        <Link className="contents sm:hidden" href="/projects">
          <ButtonHome
            size="sm"
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            Browse Projects
          </ButtonHome>
        </Link>
      </div>
    </div>
  );
}
