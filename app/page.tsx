"use client";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


export default function Home() {
    const currentAccount = useCurrentAccount();

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome to Counter App
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A beautiful and modern counter application built with Next.js, Tailwind CSS, and shadcn/ui components.
          </p>
        </div>

        <div className="flex justify-center">
        </div>
      </div>
  );
}