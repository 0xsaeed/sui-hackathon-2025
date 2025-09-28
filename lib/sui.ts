// lib/sui.ts
import { SuiClient } from "@mysten/sui/client";

export const RPC_URL =
  process.env.SUI_RPC_URL || "https://fullnode.testnet.sui.io"; // adjust if needed
export const suiClient = new SuiClient({ url: RPC_URL });

// your deployed package id
export const PACKAGE_ID =
  "0xa2fa1aa78581095d51a1396cd9d988098fdc87ec33b03a4715fbeb53fa30a963";
